/**
 * Run page (/run) — Three-column layout for DREX execution.
 * Left: Plan checklist, Center: Intent→Q&A→Logs, Right: Task detail
 */
'use client'
import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IntentInput } from '../../components/run/IntentInput'
import { QuestionPanel } from '../../components/run/QuestionPanel'
import { PlanChecklist } from '../../components/run/PlanChecklist'
import { LogStream } from '../../components/run/LogStream'
import { SummaryPanel } from '../../components/run/SummaryPanel'
import { TaskCard } from '../../components/run/TaskCard'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassBadge } from '../../components/ui/GlassBadge'
import { useSessionStore } from '../../store/sessionStore'
import { useProjectStore } from '../../store/projectStore'
import { useProviderStore } from '../../store/providerStore'
import { onDrexEvent, rpcPlan, rpcAnswerQuestions, rpcApprovePlan, rpcRun } from '../../lib/rpc'
import type { Answer, AgentType, TaskStatus } from '../../lib/types'
import { FileText, GitBranch, RotateCcw } from 'lucide-react'

export default function RunPage() {
  const router = useRouter()
  const activeProject = useProjectStore((s) => s.activeProject)
  const {
    status,
    questions,
    plan,
    tasks,
    logs,
    summary,
    currentPlanId,
    selectedTaskId,
    setStatus,
    setPlan,
    setQuestions,
    setPlanId,
    setSummary,
    addLog,
    updateTask,
    setSelectedTaskId,
    reset,
  } = useSessionStore()

  // Redirect to projects if no active project
  useEffect(() => {
    if (!activeProject) router.push('/projects')
  }, [activeProject, router])

  // Subscribe to drex events from main process
  useEffect(() => {
    const unsub = onDrexEvent((event) => {
      if (event.type === 'plan:questions') {
        const { planId, questions: qs } = event.payload
        setPlanId(planId)
        setQuestions(qs)
        addLog({ id: '', timestamp: Date.now(), type: 'plan:questions', message: `Generated ${qs.length} questions` })
      } else if (event.type === 'plan:ready') {
        setPlan(event.payload)
        addLog({ id: '', timestamp: Date.now(), type: 'plan:ready', message: `Plan ready: ${event.payload.tasks.length} tasks` })
      } else if (event.type === 'task:start') {
        updateTask(event.payload.id, { status: 'running' })
        addLog({ id: '', timestamp: Date.now(), type: 'task:start', taskId: event.payload.id, message: `[${event.payload.agentType}] ${event.payload.description}` })
      } else if (event.type === 'task:done') {
        updateTask(event.payload.task.id, { status: 'done' })
        addLog({ id: '', timestamp: Date.now(), type: 'task:done', taskId: event.payload.task.id, message: `✓ ${event.payload.task.description}` })
      } else if (event.type === 'review:fail') {
        updateTask(event.payload.task.id, { status: 'failed', reviewerFeedback: event.payload.feedback, retryCount: event.payload.attempt })
        addLog({ id: '', timestamp: Date.now(), type: 'review:fail', taskId: event.payload.task.id, message: `Review failed (attempt ${event.payload.attempt}): ${event.payload.feedback}` })
      } else if (event.type === 'done') {
        setSummary(event.payload)
        addLog({ id: '', timestamp: Date.now(), type: 'info', message: `Run complete in ${Math.round(event.payload.durationMs / 1000)}s` })
      } else if (event.type === 'error') {
        setStatus('FAILED')
        addLog({ id: '', timestamp: Date.now(), type: 'error', message: event.payload.message })
      }
    })
    return unsub
  }, [setPlanId, setQuestions, setPlan, updateTask, setSummary, setStatus, addLog])

  async function handleIntentSubmit(intent: string, headless: boolean) {
    if (!activeProject) return
    setStatus('PLANNING')
    addLog({ id: '', timestamp: Date.now(), type: 'info', message: `Planning: ${intent}` })
    try {
      if (headless) {
        await rpcRun(intent, activeProject, { headless: true })
      } else {
        await rpcPlan(intent, activeProject)
      }
    } catch {
      setStatus('FAILED')
      addLog({ id: '', timestamp: Date.now(), type: 'error', message: 'Failed to start planning.' })
    }
  }

  async function handleAnswers(answers: Record<number, string>) {
    if (!currentPlanId) return
    const mapped: Answer[] = Object.entries(answers).map(([id, answer]) => ({
      id: Number(id),
      answer,
    }))
    setStatus('PLANNING')
    try {
      await rpcAnswerQuestions(currentPlanId, mapped)
    } catch {
      setStatus('FAILED')
    }
  }

  async function handleSkipQA() {
    if (!currentPlanId || !activeProject) return
    setStatus('PLANNING')
    const autoAnswers: Answer[] = questions.map((q) => ({
      id: q.id,
      answer: 'Use your best judgment.',
    }))
    try {
      await rpcAnswerQuestions(currentPlanId, autoAnswers)
    } catch {
      setStatus('FAILED')
    }
  }

  async function handleApprove() {
    if (!currentPlanId) return
    setStatus('EXECUTING')
    try {
      await rpcApprovePlan(currentPlanId)
    } catch {
      setStatus('FAILED')
    }
  }

  function handleRegenerate() {
    reset()
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT PANEL — Plan checklist */}
      <aside
        className="w-[280px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)] overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        <div className="px-3 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Tasks</p>
        </div>
        <div className="flex-1 overflow-auto p-2 flex flex-col gap-1.5">
          {tasks.length === 0 ? (
            <p className="text-xs text-[#94a3b8] p-3 text-center italic">No plan yet</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={task.id === selectedTaskId}
                onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* CENTER PANEL */}
      <main className="flex-1 flex flex-col overflow-auto p-4 gap-4 min-w-0">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          {status === 'IDLE' && (
            <IntentInput onSubmit={handleIntentSubmit} loading={false} />
          )}

          {(status === 'PLANNING') && (
            <GlassCard padding="lg" className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin flex-shrink-0" />
              <p className="text-sm text-[#94a3b8]">Planning your task…</p>
            </GlassCard>
          )}

          {status === 'AWAITING_ANSWERS' && (
            <QuestionPanel
              intent={useSessionStore.getState().plan?.intent ?? ''}
              questions={questions}
              onSubmit={handleAnswers}
              onSkip={handleSkipQA}
            />
          )}

          {status === 'AWAITING_APPROVAL' && plan && (
            <PlanChecklist
              plan={plan}
              onApprove={handleApprove}
              onRegenerate={handleRegenerate}
            />
          )}

          {(status === 'EXECUTING' || status === 'DONE' || status === 'FAILED') && (
            <LogStream logs={logs} />
          )}

          {status === 'DONE' && summary && (
            <SummaryPanel
              summary={summary}
              onRunAgain={() => reset()}
              onNewTask={() => reset()}
            />
          )}

          {status === 'FAILED' && (
            <GlassCard padding="md" className="flex items-center justify-between">
              <p className="text-sm text-[#ef4444]">Run failed. Check the logs above.</p>
              <button
                onClick={() => reset()}
                className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </GlassCard>
          )}
        </motion.div>
      </main>

      {/* RIGHT PANEL — Task detail */}
      <aside
        className="w-[320px] flex-shrink-0 flex flex-col border-l border-[rgba(255,255,255,0.06)] overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        <div className="px-3 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Task Detail</p>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {selectedTask ? (
            <TaskDetailPanel task={selectedTask} />
          ) : (
            <p className="text-xs text-[#94a3b8] text-center mt-8 italic">
              Select a task to see details
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

/** Right panel showing full task details. */
function TaskDetailPanel({ task }: { task: import('../../lib/types').Task }) {
  const [rawExpanded, setRawExpanded] = React.useState(false)

  const statusColors: Record<TaskStatus, string> = {
    pending: 'gray',
    running: 'violet',
    done: 'green',
    failed: 'red',
    escalated: 'orange',
  }

  const agentVariants: Record<AgentType, string> = {
    code: 'violet',
    debug: 'orange',
    test: 'cyan',
    refactor: 'yellow',
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <GlassBadge variant={statusColors[task.status] as React.ComponentProps<typeof GlassBadge>['variant']}>
            {task.status}
          </GlassBadge>
          <GlassBadge variant={agentVariants[task.agentType] as React.ComponentProps<typeof GlassBadge>['variant']}>
            {task.agentType}
          </GlassBadge>
          <span className="text-xs text-[#94a3b8] font-mono">{task.id}</span>
        </div>
        <p className="text-[#f8fafc] leading-relaxed">{task.description}</p>
      </div>

      {task.filesLikelyAffected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1">
            <FileText size={11} /> Files
          </p>
          <div className="flex flex-col gap-1">
            {task.filesLikelyAffected.map((f) => (
              <span key={f} className="text-xs font-mono text-[#94a3b8] truncate">{f}</span>
            ))}
          </div>
        </div>
      )}

      {task.dependencies.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1">
            <GitBranch size={11} /> Depends on
          </p>
          <div className="flex flex-wrap gap-1">
            {task.dependencies.map((dep) => (
              <span key={dep} className="px-1.5 py-0.5 rounded text-xs font-mono bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#94a3b8]">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {task.actionsExecuted && task.actionsExecuted.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Actions</p>
          <div className="flex flex-col gap-1">
            {task.actionsExecuted.map((action, i) => (
              <div key={i} className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                <span className="text-[#7c3aed]">›</span>
                <span className="font-mono">{action.type}</span>
                {action.path && <span className="truncate">{action.path}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {task.reviewerFeedback && (
        <div>
          <p className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider mb-2">Reviewer Feedback</p>
          <p className="text-xs text-[#94a3b8] leading-relaxed bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)] rounded-lg p-2">
            {task.reviewerFeedback}
          </p>
        </div>
      )}

      {task.retryCount !== undefined && task.retryCount > 0 && (
        <p className="text-xs text-[#94a3b8]">Retry attempts: {task.retryCount}</p>
      )}

      {task.rawOutput && (
        <div>
          <button
            onClick={() => setRawExpanded((v) => !v)}
            className="text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors flex items-center gap-1"
          >
            {rawExpanded ? '▼' : '▶'} Raw LLM Output
          </button>
          {rawExpanded && (
            <pre className="mt-2 text-[10px] font-mono text-[#94a3b8] bg-[rgba(0,0,0,0.3)] rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
              {task.rawOutput}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
