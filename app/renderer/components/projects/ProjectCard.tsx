/**
 * ProjectCard - Card component for displaying a recent project
 */

'use client'

import React from 'react'
import { Folder, Clock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import type { RecentProject } from '@/lib/types'

interface ProjectCardProps {
  project: RecentProject
  onOpen: (path: string) => void
}

/**
 * Renders a project card with name, path, and last used info
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <GlassCard
      hover
      className="p-6 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-glass-violet/20 to-glass-cyan/20 flex items-center justify-center flex-shrink-0">
          <Folder size={24} className="text-glass-violet" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-100 mb-1 truncate">{project.name}</h3>
          <p className="text-sm text-slate-400 truncate mb-3">{project.path}</p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDate(project.lastUsed)}</span>
            </div>
            {project.taskCount !== undefined && (
              <span>{project.taskCount} tasks completed</span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
          <GlassButton onClick={() => onOpen(project.path)}>
            Open Project
          </GlassButton>
        </div>
      )}
    </GlassCard>
  )
}
