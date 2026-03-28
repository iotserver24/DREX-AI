/**
 * SummaryPanel - Final summary panel shown when execution is complete
 */

'use client'

import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import type { Summary } from '@/lib/types'

interface SummaryPanelProps {
  summary: Summary
  onRunAgain: () => void
  onNewTask: () => void
}

/**
 * Renders the execution summary with stats and action buttons
 */
export function SummaryPanel({ summary, onRunAgain, onNewTask }: SummaryPanelProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const stats = [
    { label: 'Completed', value: summary.doneTasks, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Failed', value: summary.failedTasks, icon: XCircle, color: 'text-red-500' },
    { label: 'Escalated', value: summary.escalatedTasks, icon: AlertTriangle, color: 'text-yellow-500' },
  ]

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-2xl">
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-2">
            {summary.failedTasks > 0 ? 'Execution Completed with Errors' : 'Execution Complete!'}
          </h2>
          <p className="text-center text-slate-400 mb-8">
            DREX finished processing your request
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]"
                >
                  <StatIcon size={24} className={`mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* Duration */}
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-8">
            <Clock size={16} />
            <span className="text-sm">Duration: {formatDuration(summary.duration)}</span>
          </div>

          {/* Errors */}
          {summary.errors.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm font-semibold text-red-400 mb-2">Errors:</p>
              <ul className="space-y-1">
                {summary.errors.map((error, i) => (
                  <li key={i} className="text-xs text-red-300">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <GlassButton onClick={onRunAgain} variant="secondary">
              Run Again
            </GlassButton>
            <GlassButton onClick={onNewTask}>
              New Task
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
