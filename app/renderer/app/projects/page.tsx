/**
 * Projects Page - Project selection screen
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Zap } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { FolderPicker } from '@/components/projects/FolderPicker'
import { GlassInput } from '@/components/ui/GlassInput'
import { useProjectStore } from '@/store/projectStore'

export default function ProjectsPage() {
  const router = useRouter()
  const { recentProjects, setActiveProject, addToRecent } = useProjectStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = recentProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProjectOpen = (path: string) => {
    const name = path.split('/').pop() || path
    setActiveProject(path)
    addToRecent(path, name)
    router.push('/run')
  }

  return (
    <AppShell showTopBar={false}>
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-glass-violet to-glass-cyan flex items-center justify-center">
                <Zap size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-glass-violet to-glass-cyan bg-clip-text text-transparent">
              DREX
            </h1>
            <p className="text-lg text-slate-400">
              Developer Reasoning and EXecution
            </p>
          </div>

          {/* Search Bar */}
          {recentProjects.length > 0 && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <GlassInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search recent projects..."
                  className="pl-12"
                />
              </div>
            </div>
          )}

          {/* Recent Projects Grid */}
          {filteredProjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.path}
                    project={project}
                    onOpen={handleProjectOpen}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Open Folder Button */}
          <div className="max-w-2xl mx-auto">
            <FolderPicker onFolderSelected={handleProjectOpen} />
          </div>

          {/* Empty State */}
          {recentProjects.length === 0 && (
            <div className="text-center mt-8 text-slate-500 text-sm">
              <p>No recent projects yet. Open a folder to get started.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
