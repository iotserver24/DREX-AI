/**
 * Sidebar - Main navigation sidebar component
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderOpen, Play, Settings, Zap } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/projects', label: 'Projects', icon: <FolderOpen size={20} /> },
  { href: '/run', label: 'Run', icon: <Play size={20} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={20} /> },
]

/**
 * Renders the main navigation sidebar with glassmorphism styling
 */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-20 h-full flex flex-col items-center py-6 gap-4">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-glass-violet to-glass-cyan flex items-center justify-center">
          <Zap size={24} className="text-white" />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <GlassCard
                active={isActive}
                hover={!isActive}
                className="w-14 h-14 flex items-center justify-center group"
              >
                <div className={`transition-colors ${isActive ? 'text-glass-violet' : 'text-slate-400 group-hover:text-slate-100'}`}>
                  {item.icon}
                </div>
              </GlassCard>
            </Link>
          )
        })}
      </nav>

      {/* Version Badge */}
      <div className="text-xs text-slate-600 font-mono">v1.0</div>
    </div>
  )
}
