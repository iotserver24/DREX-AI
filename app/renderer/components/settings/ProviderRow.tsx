/**
 * ProviderRow - Row component for displaying and configuring a provider
 */

'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { GlassBadge } from '@/components/ui/GlassBadge'
import type { Provider } from '@/lib/types'

interface ProviderRowProps {
  provider: Provider
  onUpdateKey: (apiKey: string) => void
  onToggleActive: () => void
}

/**
 * Renders a provider configuration row with API key input and model list
 */
export function ProviderRow({ provider, onUpdateKey, onToggleActive }: ProviderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState(provider.apiKey || '')

  const handleKeyChange = (value: string) => {
    setApiKey(value)
    onUpdateKey(value)
  }

  const hasKey = Boolean(provider.apiKey)

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="text-2xl flex-shrink-0">{provider.logo}</div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-100 mb-1">{provider.name}</h3>
          <p className="text-xs text-slate-500 truncate">{provider.baseURL}</p>
        </div>

        {/* API Key Input */}
        <div className="w-64">
          <div className="relative">
            <GlassInput
              value={apiKey}
              onChange={handleKeyChange}
              type={showKey ? 'text' : 'password'}
              placeholder="Enter API key"
              className="pr-10 text-sm"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-100"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400">{hasKey ? 'Active' : 'Inactive'}</span>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-slate-400 hover:text-slate-100"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded: Model List */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <p className="text-xs text-slate-400 mb-2">Available Models:</p>
          <div className="flex flex-wrap gap-2">
            {provider.models.map((model) => (
              <GlassBadge key={model} variant="violet">
                {model}
              </GlassBadge>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
