/**
 * AddProviderModal — Modal form to add a custom LLM provider.
 */
'use client'
import React, { useState } from 'react'
import { GlassModal } from '../ui/GlassModal'
import { GlassInput } from '../ui/GlassInput'
import { GlassButton } from '../ui/GlassButton'
import { useProviderStore } from '../../store/providerStore'

interface AddProviderModalProps {
  open: boolean
  onClose: () => void
}

/** Modal to create and save a new custom LLM provider. */
export function AddProviderModal({ open, onClose }: AddProviderModalProps) {
  const addCustomProvider = useProviderStore((s) => s.addCustomProvider)
  const [name, setName] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName('')
    setBaseURL('')
    setApiKey('')
    setModels('')
    setTestResult(null)
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleTest() {
    if (!baseURL) {
      setError('Base URL is required for testing.')
      return
    }
    setTesting(true)
    setTestResult(null)
    setError(null)
    try {
      const url = baseURL.replace(/\/$/, '') + '/models'
      const res = await fetch(url, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      })
      setTestResult(res.ok ? 'ok' : 'error')
      if (!res.ok) setError(`Server returned ${res.status}`)
    } catch (err) {
      setTestResult('error')
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    if (!name.trim() || !baseURL.trim()) {
      setError('Name and Base URL are required.')
      return
    }
    const modelList = models
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
    addCustomProvider({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      baseURL: baseURL.trim(),
      logo: '🔌',
      models: modelList.length > 0 ? modelList : ['default'],
      apiKey: apiKey.trim() || undefined,
    })
    handleClose()
  }

  return (
    <GlassModal open={open} onClose={handleClose} title="Add Custom Provider">
      <div className="flex flex-col gap-4">
        <GlassInput
          label="Provider Name"
          placeholder="My Custom LLM"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <GlassInput
          label="Base URL"
          placeholder="https://api.example.com/v1"
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
        />
        <GlassInput
          label="API Key"
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <GlassInput
          label="Models (comma-separated)"
          placeholder="model-1, model-2"
          value={models}
          onChange={(e) => setModels(e.target.value)}
        />

        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
        {testResult === 'ok' && <p className="text-xs text-[#22c55e]">✓ Connection successful</p>}

        <div className="flex gap-2 justify-end pt-2">
          <GlassButton variant="ghost" size="sm" onClick={handleTest} loading={testing}>
            Test Connection
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={handleSave}>
            Save Provider
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  )
}
