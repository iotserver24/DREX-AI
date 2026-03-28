/**
 * Project Picker page (/projects) — Select or open a project to work with.
 */
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Cpu } from 'lucide-react'
import { GlassInput } from '../../components/ui/GlassInput'
import { ProjectCard } from '../../components/projects/ProjectCard'
import { FolderPicker } from '../../components/projects/FolderPicker'
import { useProjectStore } from '../../store/projectStore'
import { basename } from 'path'

export default function ProjectsPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { recentProjects, setActiveProject, addToRecent } = useProjectStore()

  function openProject(path: string) {
    const name = path.split('/').filter(Boolean).pop() ?? path
    addToRecent({ path, name, lastUsed: Date.now() })
    setActiveProject(path)
    router.push('/run')
  }

  const filtered = query.trim()
    ? recentProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.path.toLowerCase().includes(query.toLowerCase())
      )
    : recentProjects

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12 bg-drex-radial"
      style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 50%), #0a0a0f' }}
    >
      {/* Logo */}
      <motion.div
        className="flex flex-col items-center gap-3 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[rgba(124,58,237,0.8)] flex items-center justify-center shadow-glass-active">
          <Cpu size={36} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#f8fafc] tracking-tight">DREX</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Developer Reasoning and Execution</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="w-full max-w-2xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <GlassInput
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={16} />}
          className="text-base py-3"
        />
      </motion.div>

      {/* Projects grid */}
      {filtered.length > 0 ? (
        <motion.div
          className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {filtered.map((project) => (
            <motion.div
              key={project.path}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProjectCard project={project} onOpen={openProject} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="w-full max-w-2xl mb-10 text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#94a3b8] text-sm">
            {query ? 'No projects match your search.' : 'No recent projects. Open a folder to get started.'}
          </p>
        </motion.div>
      )}

      {/* Open folder */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <FolderPicker onSelect={openProject} />
      </motion.div>
    </div>
  )
}
