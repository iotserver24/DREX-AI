/**
 * ModelPicker — Dropdown for selecting the active LLM provider and model.
 * Renders grouped by provider with context window info.
 */
'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useProviderStore } from '../../store/providerStore'

/** Dropdown component for switching the active model mid-session. */
export function ModelPicker() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { providers, activeProviderId, activeModel, setActiveModel, setActiveProvider } =
    useProviderStore()

  const activeProvider = providers.find((p) => p.id === activeProviderId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeProviders = providers.filter((p) => p.isActive)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.09)] transition-all text-sm text-[#f8fafc]"
        style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      >
        <span className="text-base leading-none">{activeProvider?.logo ?? '🤖'}</span>
        <span className="max-w-[120px] truncate">{activeModel}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-glass border border-[rgba(255,255,255,0.1)] z-50 py-2 overflow-hidden"
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            background: 'rgba(15,15,25,0.95)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}
        >
          {activeProviders.map((provider) => (
            <div key={provider.id}>
              <div className="px-3 py-1.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                <span>{provider.logo}</span>
                <span>{provider.name}</span>
              </div>
              {provider.models.map((model) => {
                const isActive = activeProviderId === provider.id && activeModel === model
                return (
                  <button
                    key={model}
                    onClick={() => {
                      setActiveProvider(provider.id)
                      setActiveModel(model)
                      setOpen(false)
                    }}
                    className={[
                      'w-full text-left px-5 py-2 text-sm transition-colors',
                      isActive
                        ? 'text-[#a78bfa] bg-[rgba(124,58,237,0.15)]'
                        : 'text-[#f8fafc] hover:bg-[rgba(255,255,255,0.07)]',
                    ].join(' ')}
                  >
                    {model}
                    {isActive && <span className="ml-2 text-xs text-[#7c3aed]">✓</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
