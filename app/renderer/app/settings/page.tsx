/**
 * Settings Page - Application settings
 */

'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProviderManager } from '@/components/settings/ProviderManager'
import { Settings, Info } from 'lucide-react'

type Section = 'providers' | 'general' | 'about'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('providers')

  const sections = [
    { id: 'providers' as Section, label: 'Providers', icon: <Settings size={16} /> },
    { id: 'general' as Section, label: 'General', icon: <Settings size={16} /> },
    { id: 'about' as Section, label: 'About', icon: <Info size={16} /> },
  ]

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <div className="w-56 border-r border-white/[0.08] p-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
            Settings
          </h2>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-glass-violet/20 text-glass-violet'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {activeSection === 'providers' && (
              <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">Provider Configuration</h1>
                <ProviderManager />
              </div>
            )}

            {activeSection === 'general' && (
              <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">General Settings</h1>
                <GlassCard className="p-6">
                  <p className="text-slate-400">General settings coming soon...</p>
                </GlassCard>
              </div>
            )}

            {activeSection === 'about' && (
              <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-6">About DREX</h1>
                <GlassCard className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Version</h3>
                    <p className="text-slate-100">1.0.0</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">drex-core Version</h3>
                    <p className="text-slate-100">1.0.0</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Built With</h3>
                    <p className="text-slate-100">Bun + Electrobun + Next.js</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">GitHub</h3>
                    <a
                      href="https://github.com/iotserver24/DREX-AI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-glass-violet hover:underline"
                    >
                      github.com/iotserver24/DREX-AI
                    </a>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
