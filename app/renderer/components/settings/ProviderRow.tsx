/**
 * ProviderRow — A single provider row in the provider manager.
 * Shows logo, name, URL, API key input (masked), toggle and model chips.
 */
'use client'
import React, { useState } from 'react'
import { Eye, EyeOff, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { GlassBadge } from '../ui/GlassBadge'
import { GlassButton } from '../ui/GlassButton'
import { useProviderStore } from '../../store/providerStore'
import type { Provider } from '../../lib/types'

interface ProviderRowProps {
  provider: Provider
}

/** A single provider row with key masking, toggle, and expandable model list. */
export function ProviderRow({ provider }: ProviderRowProps) {
  const { updateProviderKey, toggleProvider, removeCustomProvider, activeProviderId, activeModel, setActiveProvider, setActiveModel } =
    useProviderStore()
  const [expanded, setExpanded] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [keyValue, setKeyValue] = useState(provider.apiKey ?? '')

  const hasKey = keyValue.trim().length > 0

  function handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setKeyValue(e.target.value)
    updateProviderKey(provider.id, e.target.value)
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo + name */}
        <span className="text-xl w-8 text-center flex-shrink-0">{provider.logo}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f8fafc] truncate">{provider.name}</p>
          <p className="text-xs text-[#94a3b8] truncate font-mono">{provider.baseURL}</p>
        </div>

        {/* Key input */}
        <div className="relative flex items-center">
          <input
            type={showKey ? 'text' : 'password'}
            value={keyValue}
            onChange={handleKeyChange}
            placeholder="API Key"
            className="w-44 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 pr-9 text-xs text-[#f8fafc] placeholder-[#94a3b8] focus:outline-none focus:border-[rgba(124,58,237,0.5)] transition-colors"
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2 text-[#94a3b8] hover:text-[#f8fafc]"
            aria-label={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Status dot */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${hasKey ? 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-[#94a3b8]'}`}
          title={hasKey ? 'Key set' : 'No key'}
        />

        {/* Active toggle */}
        <button
          onClick={() => toggleProvider(provider.id)}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${provider.isActive ? 'bg-[rgba(124,58,237,0.8)]' : 'bg-[rgba(255,255,255,0.1)]'}`}
          aria-label="Toggle provider"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${provider.isActive ? 'right-0.5' : 'left-0.5'}`}
          />
        </button>

        {/* Expand */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          aria-label="Show models"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Delete (custom only) */}
        {!provider.isDefault && (
          <button
            onClick={() => removeCustomProvider(provider.id)}
            className="text-[#94a3b8] hover:text-[#ef4444] transition-colors"
            aria-label="Remove provider"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Model chips */}
      {expanded && (
        <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3 flex flex-wrap gap-2">
          {provider.models.map((model) => {
            const isActive = activeProviderId === provider.id && activeModel === model
            return (
              <button
                key={model}
                onClick={() => {
                  setActiveProvider(provider.id)
                  setActiveModel(model)
                }}
                className="transition-all"
              >
                <GlassBadge variant={isActive ? 'violet' : 'gray'}>
                  {isActive && '✓ '}{model}
                </GlassBadge>
              </button>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
