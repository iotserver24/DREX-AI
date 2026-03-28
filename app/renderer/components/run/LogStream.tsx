/**
 * LogStream - Real-time log streaming component
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassBadge } from '@/components/ui/GlassBadge'
import type { LogEntry } from '@/lib/types'

interface LogStreamProps {
  logs: LogEntry[]
}

const logTypeConfig = {
  'task:start': { variant: 'violet' as const, label: 'TASK START' },
  'task:done': { variant: 'success' as const, label: 'TASK DONE' },
  'review:fail': { variant: 'warning' as const, label: 'REVIEW FAIL' },
  command: { variant: 'info' as const, label: 'COMMAND' },
  error: { variant: 'danger' as const, label: 'ERROR' },
  info: { variant: 'default' as const, label: 'INFO' },
}

/**
 * Renders a real-time scrolling log stream with color-coded entries
 */
export function LogStream({ logs }: LogStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = React.useState(true)

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const handleScroll = () => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50

    if (isAtBottom !== autoScroll) {
      setAutoScroll(isAtBottom)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false })
  }

  return (
    <div className="h-full flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-center">Waiting for logs...</p>
          </div>
        ) : (
          <>
            {logs.map((log) => {
              const config = logTypeConfig[log.type] || logTypeConfig.info
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-xs text-slate-600 flex-shrink-0 w-20">
                    {formatTime(log.timestamp)}
                  </span>
                  <GlassBadge variant={config.variant} className="flex-shrink-0">
                    {config.label}
                  </GlassBadge>
                  <span className="text-slate-300 flex-1 break-words">{log.message}</span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {!autoScroll && (
        <div className="p-2 border-t border-white/[0.08]">
          <button
            onClick={() => {
              setAutoScroll(true)
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
          >
            ↓ Auto-scroll paused. Click to resume.
          </button>
        </div>
      )}
    </div>
  )
}
