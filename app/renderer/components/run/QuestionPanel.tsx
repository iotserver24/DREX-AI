/**
 * QuestionPanel — Renders numbered planning questions with text inputs for answers.
 */
'use client'
import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { GlassInput } from '../ui/GlassInput'
import { GlassButton } from '../ui/GlassButton'
import type { Question } from '../../lib/types'

interface QuestionPanelProps {
  intent: string
  questions: Question[]
  onSubmit: (answers: Record<number, string>) => void
  onSkip: () => void
  loading?: boolean
}

/** Numbered Q&A panel where users answer planner questions before execution. */
export function QuestionPanel({ intent, questions, onSubmit, onSkip, loading = false }: QuestionPanelProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, '']))
  )

  function handleSubmit() {
    onSubmit(answers)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Intent chip */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#94a3b8]">Goal:</span>
        <span className="px-2.5 py-1 rounded-full text-xs bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)] text-[#a78bfa]">
          {intent}
        </span>
      </div>

      <GlassCard padding="lg" className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-[#f8fafc]">A few quick questions</p>
        {questions.map((q, i) => (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label className="text-sm text-[#f8fafc]">
              <span className="text-[#7c3aed] font-bold mr-2">{i + 1}.</span>
              {q.question}
            </label>
            <GlassInput
              placeholder="Your answer…"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          </div>
        ))}

        <div className="flex gap-2 justify-end pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <GlassButton variant="ghost" size="sm" onClick={onSkip}>
            Skip (headless)
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={handleSubmit} loading={loading}>
            Submit Answers
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
