/**
 * AddProviderModal - Modal for adding custom providers
 */

'use client'

import React, { useState } from 'react'
import { GlassModal } from '@/components/ui/GlassModal'
import { GlassInput } from '@/components/ui/GlassInput'
import { GlassButton } from '@/components/ui/GlassButton'
import type { Provider } from '@/lib/types'

interface AddProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (provider: Provider) => void
}

/**
 * Renders a modal dialog for adding custom AI providers
 */
export function AddProviderModal({ isOpen, onClose, onAdd }: AddProviderModalProps) {
  const [name, setName] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState('')
  const [logo, setLogo] = useState('🤖')

  const handleSubmit = () => {
    if (!name || !baseURL || !models) return

    const provider: Provider = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      baseURL,
      logo,
      models: models.split(',').map((m) => m.trim()).filter(Boolean),
      apiKey: apiKey || undefined,
      isCustom: true,
    }

    onAdd(provider)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setBaseURL('')
    setApiKey('')
    setModels('')
    setLogo('🤖')
    onClose()
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Custom Provider"
      size="md"
      footer={
        <>
          <GlassButton variant="secondary" onClick={handleClose}>
            Cancel
          </GlassButton>
          <GlassButton onClick={handleSubmit} disabled={!name || !baseURL || !models}>
            Add Provider
          </GlassButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Provider Name</label>
          <GlassInput
            value={name}
            onChange={setName}
            placeholder="e.g., Custom OpenAI"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Base URL</label>
          <GlassInput
            value={baseURL}
            onChange={setBaseURL}
            placeholder="https://api.example.com/v1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">API Key (Optional)</label>
          <GlassInput
            value={apiKey}
            onChange={setApiKey}
            type="password"
            placeholder="sk-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Logo Emoji</label>
          <GlassInput
            value={logo}
            onChange={setLogo}
            placeholder="🤖"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Models (comma-separated)
          </label>
          <GlassInput
            value={models}
            onChange={setModels}
            placeholder="model-1, model-2, model-3"
            multiline
            rows={3}
          />
        </div>
      </div>
    </GlassModal>
  )
}
