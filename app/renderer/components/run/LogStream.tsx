/**
 * LogStream — Real-time scrolling log viewer for the execution phase.
 * Auto-scrolls to the bottom; manual scroll pauses auto-scroll.
 */
'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassBadge } from '../ui/GlassBadge'
import type { LogEntry, LogType } from '../../lib/types'

interface LogStreamProps {
  logs: LogEntry[]
}

const logTypeConfig: Record<LogType, { label: string; variant: React.ComponentProps<typeof GlassBadge>['variant'] }> = {
  'task:start':    { label: 'TASK',    variant: 'violet' },
  'task:done':     { label: 'DONE',    variant: 'green'  },
  'review:fail':   { label: 'REVIEW',  variant: 'orange' },
  command:         { label: 'CMD',     variant: 'cyan'   },
  error:           { label: 'ERROR',   variant: 'red'    },
  info:            { label: 'INFO',    variant: 'gray'   },
  'plan:questions':{ label: 'PLAN',    variant: 'violet' },
  'plan:ready':    { label: 'PLAN',    variant: 'violet' },
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** Scrolling log stream with color-coded type badges and auto-scroll behaviour. */
export function LogStream({ logs }: LogStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
    setAutoScroll(isAtBottom)
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-auto font-mono text-xs leading-relaxed space-y-0.5 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)]"
      style={{ minHeight: '200px', maxHeight: '600px' }}
    >
      {logs.length === 0 && (
        <p className="text-[#94a3b8] italic">Waiting for execution to start…</p>
      )}
      <AnimatePresence initial={false}>
        {logs.map((log) => {
          const config = logTypeConfig[log.type] ?? { label: 'LOG', variant: 'gray' as const }
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2"
            >
              <span className="text-[#94a3b8] flex-shrink-0">{formatTime(log.timestamp)}</span>
              <GlassBadge variant={config.variant} className="flex-shrink-0 text-[10px]">
                {config.label}
              </GlassBadge>
              <span className="text-[#f8fafc] break-all">{log.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}
