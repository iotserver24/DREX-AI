/**
 * IntentInput - Large textarea for entering the task intent
 */

'use client'

import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { GlassButton } from '@/components/ui/GlassButton'

interface IntentInputProps {
  onSubmit: (intent: string, headless: boolean) => void
  isLoading?: boolean
}

/**
 * Renders a large intent input form with headless toggle
 */
export function IntentInput({ onSubmit, isLoading = false }: IntentInputProps) {
  const [intent, setIntent] = useState('')
  const [headless, setHeadless] = useState(false)

  const handleSubmit = () => {
    if (intent.trim()) {
      onSubmit(intent, headless)
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-3xl">
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold text-slate-100 mb-6 text-center">
            What do you want to build?
          </h2>

          <GlassInput
            value={intent}
            onChange={setIntent}
            placeholder="Describe your task or feature request in detail..."
            multiline
            rows={8}
            disabled={isLoading}
            className="mb-6"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={headless}
                onChange={(e) => setHeadless(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.05] text-glass-violet focus:ring-glass-violet/20"
              />
              <span className="text-sm text-slate-300">Run headless (skip questions)</span>
            </label>

            <GlassButton
              onClick={handleSubmit}
              disabled={!intent.trim() || isLoading}
              size="lg"
            >
              {isLoading ? (
                'Planning...'
              ) : (
                <>
                  <Send size={18} className="inline mr-2" />
                  Plan with DREX
                </>
              )}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
