/**
 * Provider store - Manages all provider and model state
 */

import { create } from 'zustand'
import type { Provider } from '@/lib/types'
import { DEFAULT_PROVIDERS } from '@/lib/providers'

interface ProviderStore {
  providers: Provider[]
  activeProviderId: string
  activeModel: string

  // Actions
  setActiveModel: (model: string) => void
  setActiveProvider: (id: string) => void
  updateProviderKey: (id: string, apiKey: string) => void
  toggleProvider: (id: string) => void
  addCustomProvider: (provider: Provider) => void
  removeCustomProvider: (id: string) => void
  initializeProviders: (providers: Provider[]) => void
}

/**
 * Zustand store for provider and model management
 */
export const useProviderStore = create<ProviderStore>((set) => ({
  providers: DEFAULT_PROVIDERS,
  activeProviderId: 'openai',
  activeModel: 'gpt-4o',

  setActiveModel: (model: string) => {
    set({ activeModel: model })
  },

  setActiveProvider: (id: string) => {
    set((state) => {
      const provider = state.providers.find((p) => p.id === id)
      return {
        activeProviderId: id,
        activeModel: provider?.models[0] || state.activeModel,
      }
    })
  },

  updateProviderKey: (id: string, apiKey: string) => {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, apiKey } : p
      ),
    }))
  },

  toggleProvider: (id: string) => {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ),
    }))
  },

  addCustomProvider: (provider: Provider) => {
    set((state) => ({
      providers: [...state.providers, { ...provider, isCustom: true }],
    }))
  },

  removeCustomProvider: (id: string) => {
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id || !p.isCustom),
    }))
  },

  initializeProviders: (providers: Provider[]) => {
    set({ providers })
  },
}))
