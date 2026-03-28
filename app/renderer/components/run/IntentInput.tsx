/**
 * IntentInput — Large textarea for entering the user's coding intent.
 */
'use client'
import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { GlassButton } from '../ui/GlassButton'
import { GlassCard } from '../ui/GlassCard'

interface IntentInputProps {
  onSubmit: (intent: string, headless: boolean) => void
  loading?: boolean
}

/** Full intent textarea with headless toggle and Plan with DREX submit button. */
export function IntentInput({ onSubmit, loading = false }: IntentInputProps) {
  const [intent, setIntent] = useState('')
  const [headless, setHeadless] = useState(false)

  function handleSubmit() {
    if (intent.trim()) onSubmit(intent.trim(), headless)
  }

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <textarea
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
        }}
        placeholder="What do you want to build?"
        rows={5}
        className="w-full bg-transparent text-[#f8fafc] placeholder-[#94a3b8] text-base resize-none focus:outline-none leading-relaxed"
      />

      <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            onClick={() => setHeadless((v) => !v)}
            className={`w-8 h-4 rounded-full transition-colors relative ${headless ? 'bg-[rgba(124,58,237,0.8)]' : 'bg-[rgba(255,255,255,0.1)]'}`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${headless ? 'right-0.5' : 'left-0.5'}`} />
          </button>
          <span className="text-sm text-[#94a3b8]">Run headless</span>
        </label>

        <GlassButton
          variant="primary"
          onClick={handleSubmit}
          disabled={!intent.trim()}
          loading={loading}
        >
          <Send size={14} />
          Plan with DREX
        </GlassButton>
      </div>
    </GlassCard>
  )
}
