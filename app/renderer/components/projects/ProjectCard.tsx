/**
 * ProjectCard — Displays a recent project with hover open overlay.
 */
'use client'
import React from 'react'
import { FolderOpen, Clock, ChevronRight } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import type { RecentProject } from '../../lib/types'

interface ProjectCardProps {
  project: RecentProject
  onOpen: (path: string) => void
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

/** Card showing project folder name, path, last-used time, and task count with hover overlay. */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <GlassCard
      hoverable
      className="relative group overflow-hidden cursor-pointer"
      onClick={() => onOpen(project.path)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <FolderOpen size={18} className="text-[#a78bfa]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#f8fafc] font-semibold text-base truncate">{project.name}</p>
            <p className="text-[#94a3b8] text-xs mt-0.5 truncate font-mono">{project.path}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatRelativeTime(project.lastUsed)}
          </span>
          {project.taskCount !== undefined && project.taskCount > 0 && (
            <span className="flex items-center gap-1 text-[#7c3aed]">
              {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[rgba(124,58,237,0.12)]">
        <div className="flex items-center gap-2 bg-[rgba(124,58,237,0.9)] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-glass-active">
          Open <ChevronRight size={14} />
        </div>
      </div>
    </GlassCard>
  )
}
