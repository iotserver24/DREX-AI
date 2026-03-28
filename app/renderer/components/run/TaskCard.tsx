/**
 * TaskCard - Card component for displaying a task in the plan checklist
 */

'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Loader, XCircle, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassBadge } from '@/components/ui/GlassBadge'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  index: number
  onClick?: () => void
  isSelected?: boolean
}

/**
 * Renders a task card with status, description, and expandable details
 */
export function TaskCard({ task, index, onClick, isSelected = false }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusConfig = {
    pending: { icon: Circle, color: 'text-slate-500', variant: 'default' as const },
    running: { icon: Loader, color: 'text-glass-cyan animate-spin', variant: 'info' as const },
    done: { icon: CheckCircle, color: 'text-green-500', variant: 'success' as const },
    failed: { icon: XCircle, color: 'text-red-500', variant: 'danger' as const },
    escalated: { icon: AlertTriangle, color: 'text-yellow-500', variant: 'warning' as const },
  }

  const status = statusConfig[task.status]
  const StatusIcon = status.icon

  return (
    <GlassCard
      hover={!isSelected}
      active={isSelected}
      onClick={onClick}
      className="p-4"
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${status.color}`}>
          <StatusIcon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
            <GlassBadge variant="violet" className="text-xs">
              {task.agentType}
            </GlassBadge>
            {task.retryCount && task.retryCount > 0 && (
              <GlassBadge variant="warning" className="text-xs">
                Retry {task.retryCount}
              </GlassBadge>
            )}
          </div>

          <p className="text-sm text-slate-100 mb-2">{task.description}</p>

          {/* Expandable Details */}
          {task.filesLikelyAffected && task.filesLikelyAffected.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100 transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {task.filesLikelyAffected.length} files affected
            </button>
          )}

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-white/[0.08]">
              <div className="space-y-1">
                {task.filesLikelyAffected.map((file, i) => (
                  <div key={i} className="text-xs text-slate-400 font-mono">
                    {file}
                  </div>
                ))}
              </div>

              {task.reviewFeedback && (
                <div className="mt-3 pt-3 border-t border-white/[0.08]">
                  <p className="text-xs text-red-400 mb-1">Review Feedback:</p>
                  <p className="text-xs text-slate-300">{task.reviewFeedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
