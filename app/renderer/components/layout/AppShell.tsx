/**
 * AppShell — Root application shell wrapping all pages.
 * Provides the sidebar, topbar, and main content area layout.
 */
'use client'
import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { usePathname } from 'next/navigation'

interface AppShellProps {
  children: React.ReactNode
}

/** Renders the full-app chrome (sidebar + topbar) around page content. */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  // Project picker is full-screen — no shell chrome
  const isFullscreen = pathname === '/projects' || pathname === '/projects/'

  if (isFullscreen) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ background: '#0a0a0f' }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
