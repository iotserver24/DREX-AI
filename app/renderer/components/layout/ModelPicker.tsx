/**
 * ModelPicker - Dropdown component for selecting AI models
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useProviderStore } from '@/store/providerStore'
import { GlassCard } from '@/components/ui/GlassCard'

/**
 * Renders a dropdown for selecting the active AI model from configured providers
 */
export function ModelPicker() {
  const { providers, activeProviderId, activeModel, setActiveModel, setActiveProvider } = useProviderStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeProvider = providers.find((p) => p.id === activeProviderId)

  // Get all available providers with API keys
  const availableProviders = providers.filter((p) => p.apiKey)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleModelSelect = (providerId: string, model: string) => {
    if (providerId !== activeProviderId) {
      setActiveProvider(providerId)
    }
    setActiveModel(model)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <GlassCard
        hover
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 flex items-center gap-2 min-w-[200px]"
      >
        <span className="text-lg">{activeProvider?.logo || '🤖'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-100 truncate">{activeModel}</div>
          <div className="text-xs text-slate-500 truncate">{activeProvider?.name || 'Select Model'}</div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </GlassCard>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 max-h-96 overflow-y-auto z-50">
          <GlassCard className="p-2">
            {availableProviders.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                No providers configured.
                <br />
                Add API keys in Settings.
              </div>
            ) : (
              availableProviders.map((provider) => (
                <div key={provider.id} className="mb-3 last:mb-0">
                  {/* Provider Header */}
                  <div className="px-3 py-1.5 flex items-center gap-2">
                    <span className="text-base">{provider.logo}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {provider.name}
                    </span>
                  </div>

                  {/* Models */}
                  <div className="space-y-0.5">
                    {provider.models.map((model) => {
                      const isSelected = provider.id === activeProviderId && model === activeModel
                      return (
                        <button
                          key={`${provider.id}-${model}`}
                          onClick={() => handleModelSelect(provider.id, model)}
                          className={`w-full px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-glass-violet/20 text-glass-violet'
                              : 'hover:bg-white/[0.05] text-slate-300'
                          }`}
                        >
                          <span className="text-sm font-medium">{model}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </GlassCard>
        </div>
      )}
    </div>
  )
}
