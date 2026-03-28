/**
 * PlanChecklist - Left panel showing all tasks in a checklist format
 */

'use client'

import React from 'react'
import { TaskCard } from './TaskCard'
import { GlassButton } from '@/components/ui/GlassButton'
import type { Task, Plan } from '@/lib/types'

interface PlanChecklistProps {
  plan: Plan | null
  tasks: Task[]
  selectedTaskId: string | null
  onTaskClick: (taskId: string) => void
  onApprove?: () => void
  onRegenerate?: () => void
  showActions?: boolean
}

/**
 * Renders the plan checklist with all tasks and approval actions
 */
export function PlanChecklist({
  plan,
  tasks,
  selectedTaskId,
  onTaskClick,
  onApprove,
  onRegenerate,
  showActions = false,
}: PlanChecklistProps) {
  if (!plan && tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-sm text-slate-500 text-center">No plan yet</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onClick={() => onTaskClick(task.id)}
            isSelected={selectedTaskId === task.id}
          />
        ))}
      </div>

      {showActions && (
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <GlassButton onClick={onApprove} className="w-full">
            Approve & Run
          </GlassButton>
          <GlassButton onClick={onRegenerate} variant="secondary" className="w-full">
            Regenerate Plan
          </GlassButton>
        </div>
      )}
    </div>
  )
}
