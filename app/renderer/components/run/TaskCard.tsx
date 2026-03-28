/**
 * TaskCard — A single task entry in the left panel checklist.
 * Shows status icon, description, agent type badge and is expandable.
 */
'use client'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GlassBadge } from '../ui/GlassBadge'
import { useSessionStore } from '../../store/sessionStore'
import type { Task, AgentType, TaskStatus } from '../../lib/types'

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onClick: () => void
}

const statusIcon: Record<TaskStatus, React.ReactNode> = {
  pending: <span className="w-4 h-4 rounded-full border-2 border-[rgba(255,255,255,0.2)]" />,
  running: (
    <span className="w-4 h-4 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
  ),
  done: <span className="w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-[10px]">✓</span>,
  failed: <span className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center text-white text-[10px]">✗</span>,
  escalated: <span className="w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-[10px]">!</span>,
}

const agentVariant: Record<AgentType, React.ComponentProps<typeof GlassBadge>['variant']> = {
  code: 'violet',
  debug: 'orange',
  test: 'cyan',
  refactor: 'yellow',
}

/** Task row in the left panel with status indicator and expandable details. */
export function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={[
        'rounded-xl border transition-all cursor-pointer',
        isSelected
          ? 'border-[rgba(124,58,237,0.5)] bg-[rgba(124,58,237,0.08)]'
          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]',
      ].join(' ')}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex-shrink-0">{statusIcon[task.status]}</span>
        <p className="flex-1 min-w-0 text-xs text-[#f8fafc] line-clamp-2 leading-snug">
          {task.description}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <GlassBadge variant={agentVariant[task.agentType]} className="text-[10px]">
            {task.agentType}
          </GlassBadge>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[rgba(255,255,255,0.06)] pt-2">
          {task.filesLikelyAffected.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1">Files</p>
              {task.filesLikelyAffected.map((f) => (
                <p key={f} className="text-[10px] font-mono text-[#94a3b8] truncate">{f}</p>
              ))}
            </div>
          )}
          {task.reviewerFeedback && (
            <div>
              <p className="text-[10px] text-[#f59e0b] uppercase tracking-wider mb-1">Reviewer</p>
              <p className="text-[10px] text-[#94a3b8]">{task.reviewerFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
