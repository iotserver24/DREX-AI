/**
 * Settings page (/settings) — Providers, General and About sections.
 */
'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Server, SlidersHorizontal, Info } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { ProviderManager } from '../../components/settings/ProviderManager'

type Section = 'providers' | 'general' | 'about'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'providers', label: 'Providers', icon: <Server size={16} /> },
  { id: 'general', label: 'General', icon: <SlidersHorizontal size={16} /> },
  { id: 'about', label: 'About', icon: <Info size={16} /> },
]

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('providers')

  return (
    <div className="flex h-full">
      {/* Sidebar nav */}
      <nav
        className="w-[220px] flex-shrink-0 border-r border-[rgba(255,255,255,0.06)] p-4 flex flex-col gap-1"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider px-3 mb-2">Settings</p>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={[
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left',
              section === item.id
                ? 'bg-[rgba(124,58,237,0.2)] text-[#a78bfa]'
                : 'text-[#94a3b8] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f8fafc]',
            ].join(' ')}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {section === 'providers' && <ProviderManager />}
          {section === 'general' && <GeneralSection />}
          {section === 'about' && <AboutSection />}
        </motion.div>
      </main>
    </div>
  )
}

/** General settings section with agent config options. */
function GeneralSection() {
  const [maxAgents, setMaxAgents] = useState(3)
  const [permission, setPermission] = useState<'safe' | 'moderate' | 'full'>('moderate')
  const [autoApprove, setAutoApprove] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h2 className="text-base font-semibold text-[#f8fafc]">General</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">Runtime and execution preferences.</p>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-5">
          {/* Max concurrent agents */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#f8fafc]">Max Concurrent Agents</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Number of tasks that run in parallel.</p>
            </div>
            <input
              type="number"
              min={1}
              max={10}
              value={maxAgents}
              onChange={(e) => setMaxAgents(Number(e.target.value))}
              className="w-16 text-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg py-1.5 text-sm text-[#f8fafc] focus:outline-none focus:border-[rgba(124,58,237,0.5)]"
            />
          </div>

          {/* Permission level */}
          <div>
            <p className="text-sm font-medium text-[#f8fafc] mb-2">Permission Level</p>
            {(
              [
                { value: 'safe', label: 'Safe', desc: 'Read-only, no shell commands' },
                { value: 'moderate', label: 'Moderate', desc: 'File edits only, no shell' },
                { value: 'full', label: 'Full', desc: 'Unrestricted — use with caution' },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex items-start gap-3 py-2 cursor-pointer group">
                <input
                  type="radio"
                  name="permission"
                  value={opt.value}
                  checked={permission === opt.value}
                  onChange={() => setPermission(opt.value)}
                  className="mt-0.5 accent-[#7c3aed]"
                />
                <div>
                  <p className="text-sm text-[#f8fafc]">{opt.label}</p>
                  <p className="text-xs text-[#94a3b8]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Auto-approve */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#f8fafc]">Auto-approve Plans</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Skip the approval step and execute immediately.</p>
            </div>
            <button
              onClick={() => setAutoApprove((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${autoApprove ? 'bg-[rgba(124,58,237,0.8)]' : 'bg-[rgba(255,255,255,0.1)]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${autoApprove ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

/** About section with version info and links. */
function AboutSection() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h2 className="text-base font-semibold text-[#f8fafc]">About DREX</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">Version information and credits.</p>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#94a3b8]">DREX App</span>
            <span className="text-[#f8fafc] font-mono">v0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94a3b8]">drex-core</span>
            <span className="text-[#f8fafc] font-mono">v1.0.0</span>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
            <p className="text-[#94a3b8] text-xs">Built with</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Bun', 'Electrobun', 'Next.js', 'Tailwind CSS', 'Zustand', 'Framer Motion'].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded text-xs bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#94a3b8]"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="pt-2">
            <a
              href="https://github.com/iotserver24/DREX-AI"
              target="_blank"
              rel="noreferrer"
              className="text-[#7c3aed] hover:text-[#a78bfa] transition-colors text-xs"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
