/**
 * GlassModal - A glassmorphism modal dialog component
 */

'use client'

import React, { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { GlassButton } from './GlassButton'

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Renders a glassmorphism modal dialog with backdrop and close button
 */
export function GlassModal({ isOpen, onClose, title, children, footer, size = 'md' }: GlassModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        <GlassCard className="p-6 flex flex-col max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.08]">
            <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
