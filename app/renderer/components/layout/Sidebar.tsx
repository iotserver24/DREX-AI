/**
 * Sidebar — Left navigation sidebar for the DREX app shell.
 * Shows navigation links for Run, Projects, and Settings.
 */
'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Play, FolderOpen, Settings, Cpu } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { href: '/run', label: 'Run', icon: <Play size={18} /> },
  { href: '/projects', label: 'Projects', icon: <FolderOpen size={18} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={18} /> },
]

/** Left sidebar with DREX logo and primary navigation links. */
export function Sidebar() {
  const pathname = usePathname()
  const activeProject = useProjectStore((s) => s.activeProject)

  return (
    <aside
      className="w-[60px] flex-shrink-0 flex flex-col items-center py-4 gap-2 border-r border-[rgba(255,255,255,0.06)]"
      style={{
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="mb-4 w-9 h-9 rounded-xl bg-[rgba(124,58,237,0.8)] flex items-center justify-center shadow-glass-active">
        <Cpu size={20} className="text-white" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={[
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'bg-[rgba(124,58,237,0.3)] text-[#a78bfa] shadow-glass-active'
                  : 'text-[#94a3b8] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f8fafc]',
              ].join(' ')}
            >
              {item.icon}
            </Link>
          )
        })}
      </nav>

      {/* Project indicator dot */}
      {activeProject && (
        <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]" title="Project active" />
      )}
    </aside>
  )
}
