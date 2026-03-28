/**
 * PlanChecklist — Renders the generated plan as a beautiful markdown checklist
 * awaiting user approval.
 */
'use client'
import React from 'react'
import { RefreshCw, Play } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { GlassButton } from '../ui/GlassButton'
import type { Plan, AgentType } from '../../lib/types'
import { motion } from 'framer-motion'

interface PlanChecklistProps {
  plan: Plan
  onApprove: () => void
  onRegenerate: () => void
  loading?: boolean
}

const agentTypeVariant: Record<AgentType, React.ComponentProps<typeof GlassBadge>['variant']> = {
  code: 'violet',
  debug: 'orange',
  test: 'cyan',
  refactor: 'yellow',
}

/** Plan approval view showing tasks as a checklist with type badges and file counts. */
export function PlanChecklist({ plan, onApprove, onRegenerate, loading = false }: PlanChecklistProps) {
  return (
    <div className="flex flex-col gap-4">
      <GlassCard padding="lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[#f8fafc]">Execution Plan</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{plan.tasks.length} task{plan.tasks.length !== 1 ? 's' : ''} · {plan.intent}</p>
          </div>
          <GlassBadge variant="yellow">Awaiting Approval</GlassBadge>
        </div>

        <div className="flex flex-col gap-2">
          {plan.tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
            >
              <span className="w-5 h-5 rounded border-2 border-[rgba(255,255,255,0.2)] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f8fafc]">{task.description}</p>
                {task.filesLikelyAffected.length > 0 && (
                  <p className="text-xs text-[#94a3b8] mt-1 font-mono truncate">
                    {task.filesLikelyAffected.slice(0, 3).join(', ')}
                    {task.filesLikelyAffected.length > 3 && ` +${task.filesLikelyAffected.length - 3} more`}
                  </p>
                )}
              </div>
              <GlassBadge variant={agentTypeVariant[task.agentType]}>{task.agentType}</GlassBadge>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <GlassButton variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw size={13} />
            Regenerate Plan
          </GlassButton>
          <GlassButton variant="primary" size="md" onClick={onApprove} loading={loading}>
            <Play size={14} />
            Approve &amp; Run
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
