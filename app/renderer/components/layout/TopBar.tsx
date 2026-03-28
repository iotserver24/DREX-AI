/**
 * TopBar - Header bar with logo, project name, status, and model picker
 */

'use client'

import React from 'react'
import { Zap } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { useSessionStore } from '@/store/sessionStore'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { ModelPicker } from './ModelPicker'

const statusConfig = {
  IDLE: { variant: 'default' as const, label: 'IDLE' },
  PLANNING: { variant: 'violet' as const, label: 'PLANNING', pulse: true },
  AWAITING_APPROVAL: { variant: 'warning' as const, label: 'AWAITING APPROVAL' },
  EXECUTING: { variant: 'info' as const, label: 'EXECUTING', pulse: true },
  DONE: { variant: 'success' as const, label: 'DONE' },
  FAILED: { variant: 'danger' as const, label: 'FAILED' },
}

/**
 * Renders the top bar with project info, status badge, and model picker
 */
export function TopBar() {
  const { activeProject } = useProjectStore()
  const { status } = useSessionStore()

  const statusInfo = statusConfig[status]

  const projectName = activeProject ? activeProject.split('/').pop() : null

  return (
    <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.08]">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-glass-violet" />
          <span className="text-lg font-bold text-slate-100">DREX</span>
        </div>

        {projectName && (
          <>
            <div className="w-px h-6 bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Project:</span>
              <span className="text-sm font-medium text-slate-100">{projectName}</span>
            </div>
          </>
        )}
      </div>

      {/* Center: Status Badge */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <GlassBadge variant={statusInfo.variant} pulse={statusInfo.pulse}>
          {statusInfo.label}
        </GlassBadge>
      </div>

      {/* Right: Model Picker */}
      <div className="flex items-center gap-3">
        <ModelPicker />
      </div>
    </div>
  )
}
