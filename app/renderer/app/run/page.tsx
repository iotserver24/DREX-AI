/**
 * Run Page - Main execution screen with state-based UI
 */

'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { IntentInput } from '@/components/run/IntentInput'
import { QuestionPanel } from '@/components/run/QuestionPanel'
import { PlanChecklist } from '@/components/run/PlanChecklist'
import { LogStream } from '@/components/run/LogStream'
import { SummaryPanel } from '@/components/run/SummaryPanel'
import { GlassCard } from '@/components/ui/GlassCard'
import { useProjectStore } from '@/store/projectStore'
import { useSessionStore } from '@/store/sessionStore'
import { drexPlan, drexAnswerQuestions, drexApprove, onDrexEvent } from '@/lib/rpc'

export default function RunPage() {
  const router = useRouter()
  const { activeProject } = useProjectStore()
  const {
    status,
    questions,
    plan,
    tasks,
    logs,
    summary,
    selectedTaskId,
    setStatus,
    setQuestions,
    setPlan,
    updateTask,
    addLog,
    setSummary,
    setSelectedTaskId,
    reset,
  } = useSessionStore()

  // Redirect if no active project
  useEffect(() => {
    if (!activeProject) {
      router.push('/projects')
    }
  }, [activeProject, router])

  // Set up DREX event listeners
  useEffect(() => {
    onDrexEvent((event) => {
      switch (event.type) {
        case 'plan:questions':
          setQuestions((event.payload as { questions: typeof questions }).questions)
          break

        case 'plan:ready':
          setPlan((event.payload as { plan: typeof plan }).plan)
          break

        case 'task:start':
          const startTask = (event.payload as { task: typeof tasks[0] }).task
          updateTask(startTask.id, { status: 'running' })
          addLog({ type: 'task:start', message: `Started: ${startTask.description}` })
          break

        case 'task:done':
          const doneTask = (event.payload as { task: typeof tasks[0] }).task
          updateTask(doneTask.id, { status: 'done' })
          addLog({ type: 'task:done', message: `Completed: ${doneTask.description}` })
          break

        case 'review:fail':
          const failPayload = event.payload as { task: typeof tasks[0]; feedback: string; attempt: number }
          updateTask(failPayload.task.id, {
            status: 'failed',
            reviewFeedback: failPayload.feedback,
            retryCount: failPayload.attempt,
          })
          addLog({ type: 'review:fail', message: `Review failed: ${failPayload.feedback}` })
          break

        case 'done':
          setSummary((event.payload as { summary: typeof summary }).summary)
          break

        case 'error':
          const errorMsg = (event.payload as { message: string }).message
          addLog({ type: 'error', message: errorMsg })
          setStatus('FAILED')
          break
      }
    })
  }, [setQuestions, setPlan, updateTask, addLog, setSummary, setStatus])

  const handleSubmitIntent = async (intent: string, headless: boolean) => {
    if (!activeProject) return

    try {
      setStatus('PLANNING')
      await drexPlan({
        intent,
        projectRoot: activeProject,
      })
    } catch (error) {
      console.error('Failed to create plan:', error)
      addLog({ type: 'error', message: 'Failed to create plan' })
      setStatus('FAILED')
    }
  }

  const handleSubmitAnswers = async (answers: Record<string, string>) => {
    if (!plan) return

    try {
      await drexAnswerQuestions({
        planId: plan.id,
        answers,
      })
    } catch (error) {
      console.error('Failed to submit answers:', error)
      addLog({ type: 'error', message: 'Failed to submit answers' })
    }
  }

  const handleSkipQuestions = async () => {
    if (!plan) return
    // TODO: Implement headless mode skip
    console.log('Skip questions - headless mode')
  }

  const handleApprovePlan = async () => {
    if (!plan) return

    try {
      setStatus('EXECUTING')
      await drexApprove({ planId: plan.id })
    } catch (error) {
      console.error('Failed to approve plan:', error)
      addLog({ type: 'error', message: 'Failed to start execution' })
      setStatus('FAILED')
    }
  }

  const handleRegeneratePlan = () => {
    reset()
  }

  const handleNewTask = () => {
    reset()
  }

  const handleRunAgain = () => {
    // Re-run with same intent would require storing it
    reset()
  }

  if (!activeProject) return null

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Left Panel - Plan Checklist */}
        {(status === 'AWAITING_APPROVAL' || status === 'EXECUTING' || status === 'DONE') && (
          <div className="w-80 border-r border-white/[0.08] flex-shrink-0">
            <PlanChecklist
              plan={plan}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onTaskClick={setSelectedTaskId}
              onApprove={handleApprovePlan}
              onRegenerate={handleRegeneratePlan}
              showActions={status === 'AWAITING_APPROVAL'}
            />
          </div>
        )}

        {/* Center Panel - Main Content */}
        <div className="flex-1 min-w-0">
          {status === 'IDLE' && (
            <IntentInput onSubmit={handleSubmitIntent} />
          )}

          {status === 'PLANNING' && questions.length > 0 && (
            <QuestionPanel
              questions={questions}
              onSubmitAnswers={handleSubmitAnswers}
              onSkip={handleSkipQuestions}
            />
          )}

          {status === 'PLANNING' && questions.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass-violet mx-auto mb-4" />
                <p className="text-slate-400">Creating plan...</p>
              </div>
            </div>
          )}

          {status === 'AWAITING_APPROVAL' && (
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-semibold text-slate-100 mb-4">
                    Plan Ready for Approval
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Review the tasks in the left panel and approve to start execution.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Total tasks: {tasks.length}</p>
                    <p className="text-sm text-slate-500">
                      Files affected: {new Set(tasks.flatMap((t) => t.filesLikelyAffected)).size}
                    </p>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {status === 'EXECUTING' && (
            <LogStream logs={logs} />
          )}

          {status === 'DONE' && summary && (
            <SummaryPanel
              summary={summary}
              onRunAgain={handleRunAgain}
              onNewTask={handleNewTask}
            />
          )}

          {status === 'FAILED' && (
            <div className="flex items-center justify-center h-full p-8">
              <GlassCard className="p-8 max-w-2xl">
                <h2 className="text-2xl font-semibold text-red-400 mb-4">Execution Failed</h2>
                <p className="text-slate-400 mb-6">
                  DREX encountered an error. Check the logs for details.
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                  <div className="space-y-1">
                    {logs
                      .filter((log) => log.type === 'error')
                      .slice(-5)
                      .map((log) => (
                        <p key={log.id} className="text-sm text-red-300 font-mono">
                          {log.message}
                        </p>
                      ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Right Panel - Task Detail (when task is selected) */}
        {selectedTaskId && (status === 'EXECUTING' || status === 'DONE') && (
          <div className="w-96 border-l border-white/[0.08] p-6 overflow-y-auto">
            {(() => {
              const task = tasks.find((t) => t.id === selectedTaskId)
              if (!task) return null

              return (
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Task Details</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Description</h4>
                      <p className="text-sm text-slate-100">{task.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Agent Type</h4>
                      <p className="text-sm text-slate-100">{task.agentType}</p>
                    </div>

                    {task.filesLikelyAffected.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Files Affected</h4>
                        <div className="space-y-1">
                          {task.filesLikelyAffected.map((file, i) => (
                            <p key={i} className="text-xs text-slate-300 font-mono">
                              {file}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.reviewFeedback && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Review Feedback</h4>
                        <p className="text-sm text-red-300">{task.reviewFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </AppShell>
  )
}
