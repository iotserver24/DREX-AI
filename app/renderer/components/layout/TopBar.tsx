/**
 * TopBar — Top application bar showing project name, status badge,
 * model switcher dropdown and settings link.
 */
'use client'
import React from 'react'
import Link from 'next/link'
import { Settings, Cpu } from 'lucide-react'
import { GlassBadge } from '../ui/GlassBadge'
import { ModelPicker } from './ModelPicker'
import { useProjectStore } from '../../store/projectStore'
import { useSessionStore } from '../../store/sessionStore'
import type { OrchestratorState } from '../../lib/types'

function statusBadge(status: OrchestratorState) {
  const map: Record<OrchestratorState, { label: string; variant: React.ComponentProps<typeof GlassBadge>['variant']; pulse: boolean }> = {
    IDLE:              { label: 'IDLE',      variant: 'gray',   pulse: false },
    PLANNING:          { label: 'PLANNING',  variant: 'violet', pulse: true  },
    AWAITING_ANSWERS:  { label: 'Q&A',       variant: 'cyan',   pulse: true  },
    AWAITING_APPROVAL: { label: 'APPROVAL',  variant: 'yellow', pulse: false },
    EXECUTING:         { label: 'EXECUTING', variant: 'violet', pulse: true  },
    DONE:              { label: 'DONE',      variant: 'green',  pulse: false },
    FAILED:            { label: 'FAILED',    variant: 'red',    pulse: false },
  }
  return map[status]
}

/** Application top bar with logo, project name, run status, model picker and settings. */
export function TopBar() {
  const activeProject = useProjectStore((s) => s.activeProject)
  const status = useSessionStore((s) => s.status)
  const badge = statusBadge(status)

  const projectName = activeProject
    ? activeProject.split('/').filter(Boolean).pop() ?? activeProject
    : null

  return (
    <header
      className="h-12 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0"
      style={{
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: Logo + project */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[#a78bfa] font-bold text-sm">
          <Cpu size={16} />
          <span>DREX</span>
        </div>
        {projectName && (
          <>
            <span className="text-[rgba(255,255,255,0.2)]">/</span>
            <span className="text-sm text-[#94a3b8] truncate max-w-[200px]">{projectName}</span>
          </>
        )}
      </div>

      {/* Center: Status */}
      <GlassBadge variant={badge.variant} pulse={badge.pulse}>
        {badge.label}
      </GlassBadge>

      {/* Right: Model picker + settings */}
      <div className="flex items-center gap-2">
        <ModelPicker />
        <Link
          href="/settings"
          className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </Link>
      </div>
    </header>
  )
}
