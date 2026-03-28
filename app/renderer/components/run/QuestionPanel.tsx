/**
 * QuestionPanel - Panel for displaying and answering planning questions
 */

'use client'

import React, { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassBadge } from '@/components/ui/GlassBadge'
import type { Question } from '@/lib/types'

interface QuestionPanelProps {
  questions: Question[]
  onSubmitAnswers: (answers: Record<string, string>) => void
  onSkip: () => void
}

/**
 * Renders a list of questions with input fields for answers
 */
export function QuestionPanel({ questions, onSubmitAnswers, onSkip }: QuestionPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    onSubmitAnswers(answers)
  }

  const allAnswered = questions.every((q) => answers[q.id]?.trim())

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <GlassCard className="p-8">
          <div className="mb-6">
            <GlassBadge variant="violet" className="mb-4">
              Questions ({questions.length})
            </GlassBadge>
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">
              DREX needs more information
            </h2>
            <p className="text-sm text-slate-400">
              Answer these questions to help DREX create a better plan
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {questions.map((question, index) => (
              <div key={question.id}>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-slate-300">
                    {index + 1}. {question.question}
                  </span>
                </label>
                <GlassInput
                  value={answers[question.id] || ''}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  placeholder="Your answer..."
                  multiline
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <GlassButton variant="secondary" onClick={onSkip}>
              Skip (Headless)
            </GlassButton>
            <GlassButton onClick={handleSubmit} disabled={!allAnswered}>
              Submit Answers
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
