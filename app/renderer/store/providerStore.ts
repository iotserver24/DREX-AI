/**
 * providerStore — Zustand store for LLM provider and model state.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Provider } from '../lib/types'
import { DEFAULT_PROVIDERS } from '../lib/providers'

interface ProviderState {
  /** All configured providers (default + custom). */
  providers: Provider[]
  /** ID of the currently active provider. */
  activeProviderId: string
  /** Currently selected model name. */
  activeModel: string

  /** Sets the active model. */
  setActiveModel: (model: string) => void
  /** Sets the active provider and resets model to first available. */
  setActiveProvider: (id: string) => void
  /** Updates the API key for a given provider. */
  updateProviderKey: (id: string, key: string) => void
  /** Adds a new custom provider. */
  addCustomProvider: (provider: Omit<Provider, 'isDefault' | 'isActive'>) => void
  /** Toggles a provider's active state. */
  toggleProvider: (id: string) => void
  /** Removes a custom provider (default providers cannot be removed). */
  removeCustomProvider: (id: string) => void
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      providers: DEFAULT_PROVIDERS,
      activeProviderId: 'openai',
      activeModel: 'gpt-4o',

      setActiveModel: (model) => set({ activeModel: model }),

      setActiveProvider: (id) => {
        const provider = get().providers.find((p) => p.id === id)
        if (!provider) return
        set({
          activeProviderId: id,
          activeModel: provider.models[0] ?? '',
        })
      },

      updateProviderKey: (id, key) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, apiKey: key } : p
          ),
        })),

      addCustomProvider: (provider) =>
        set((state) => ({
          providers: [
            ...state.providers,
            { ...provider, isDefault: false, isActive: true },
          ],
        })),

      toggleProvider: (id) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        })),

      removeCustomProvider: (id) =>
        set((state) => ({
          providers: state.providers.filter((p) => p.isDefault || p.id !== id),
        })),
    }),
    {
      name: 'drex-providers',
    }
  )
)
