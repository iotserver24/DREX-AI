/**
 * ProviderManager — Main content for the Providers settings section.
 * Lists all providers (default + custom) and provides add/manage controls.
 */
'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { GlassButton } from '../ui/GlassButton'
import { ProviderRow } from './ProviderRow'
import { AddProviderModal } from './AddProviderModal'
import { useProviderStore } from '../../store/providerStore'

/** Full provider management panel with list of providers and add button. */
export function ProviderManager() {
  const providers = useProviderStore((s) => s.providers)
  const [showAdd, setShowAdd] = useState(false)

  const defaultProviders = providers.filter((p) => p.isDefault)
  const customProviders = providers.filter((p) => !p.isDefault)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f8fafc]">LLM Providers</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Configure API keys and select the default model for each provider.
          </p>
        </div>
        <GlassButton variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} />
          Add Custom
        </GlassButton>
      </div>

      {/* Default providers */}
      <div>
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
          Built-in Providers
        </p>
        <div className="flex flex-col gap-2">
          {defaultProviders.map((p) => (
            <ProviderRow key={p.id} provider={p} />
          ))}
        </div>
      </div>

      {/* Custom providers */}
      {customProviders.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
            Custom Providers
          </p>
          <div className="flex flex-col gap-2">
            {customProviders.map((p) => (
              <ProviderRow key={p.id} provider={p} />
            ))}
          </div>
        </div>
      )}

      <AddProviderModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
