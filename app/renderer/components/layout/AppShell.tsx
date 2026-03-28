/**
 * AppShell - Main application layout wrapper with sidebar and top bar
 */

'use client'

import React, { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  showTopBar?: boolean
}

/**
 * Renders the main application shell with sidebar navigation and optional top bar
 */
export function AppShell({ children, showTopBar = true }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen bg-glass-dark overflow-hidden">
      {/* Background Gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {showTopBar && <TopBar />}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
