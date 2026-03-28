/**
 * ProviderManager - Main provider management component
 */

'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'
import { ProviderRow } from './ProviderRow'
import { AddProviderModal } from './AddProviderModal'
import { useProviderStore } from '@/store/providerStore'
import type { Provider } from '@/lib/types'

/**
 * Renders the provider management interface with all configured providers
 */
export function ProviderManager() {
  const { providers, updateProviderKey, toggleProvider, addCustomProvider } = useProviderStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Separate default and custom providers
  const defaultProviders = providers.filter((p) => !p.isCustom)
  const customProviders = providers.filter((p) => p.isCustom)

  const handleAddProvider = (provider: Provider) => {
    addCustomProvider(provider)
  }

  return (
    <div className="space-y-6">
      {/* Default Providers */}
      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Default Providers</h2>
        <div className="space-y-3">
          {defaultProviders.map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              onUpdateKey={(apiKey) => updateProviderKey(provider.id, apiKey)}
              onToggleActive={() => toggleProvider(provider.id)}
            />
          ))}
        </div>
      </div>

      {/* Custom Providers */}
      {customProviders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Custom Providers</h2>
          <div className="space-y-3">
            {customProviders.map((provider) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                onUpdateKey={(apiKey) => updateProviderKey(provider.id, apiKey)}
                onToggleActive={() => toggleProvider(provider.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Provider Button */}
      <div>
        <GlassButton onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} className="inline mr-2" />
          Add Custom Provider
        </GlassButton>
      </div>

      {/* Add Provider Modal */}
      <AddProviderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProvider}
      />
    </div>
  )
}
