/**
 * SummaryPanel — Displays the completion summary after a DREX run finishes.
 */
'use client'
import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, Plus } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { GlassButton } from '../ui/GlassButton'
import type { Summary } from '../../lib/types'
import { motion } from 'framer-motion'

interface SummaryPanelProps {
  summary: Summary
  onRunAgain: () => void
  onNewTask: () => void
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

/** Run completion summary with task counts, duration, and action buttons. */
export function SummaryPanel({ summary, onRunAgain, onNewTask }: SummaryPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard padding="lg" className="text-center">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
            <CheckCircle2 size={28} className="text-[#22c55e]" />
          </div>
          <h2 className="text-lg font-bold text-[#f8fafc]">Run Complete</h2>
          <p className="text-xs text-[#94a3b8]">Plan {summary.planId.slice(0, 16)}…</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<CheckCircle2 size={16} className="text-[#22c55e]" />}
            value={summary.tasksDone}
            label="Done"
            color="text-[#22c55e]"
          />
          <StatCard
            icon={<XCircle size={16} className="text-[#ef4444]" />}
            value={summary.tasksFailed}
            label="Failed"
            color="text-[#ef4444]"
          />
          <StatCard
            icon={<AlertTriangle size={16} className="text-[#f59e0b]" />}
            value={summary.tasksEscalated}
            label="Escalated"
            color="text-[#f59e0b]"
          />
          <StatCard
            icon={<Clock size={16} className="text-[#94a3b8]" />}
            value={formatDuration(summary.durationMs)}
            label="Duration"
            color="text-[#94a3b8]"
          />
        </div>

        <div className="flex gap-3 justify-center">
          <GlassButton variant="ghost" onClick={onRunAgain}>
            <RefreshCw size={14} />
            Run Again
          </GlassButton>
          <GlassButton variant="primary" onClick={onNewTask}>
            <Plus size={14} />
            New Task
          </GlassButton>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
      {icon}
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">{label}</span>
    </div>
  )
}
