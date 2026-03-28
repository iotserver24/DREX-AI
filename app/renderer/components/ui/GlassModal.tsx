/**
 * GlassModal — A glassmorphism modal dialog with backdrop overlay.
 */
'use client'
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GlassModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

const widthMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

/** Full-screen overlay modal with glass surface, animated entry, and keyboard close. */
export function GlassModal({ open, onClose, title, children, width = 'md' }: GlassModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.7)]"
            onClick={onClose}
          />

          {/* Modal surface */}
          <motion.div
            key="modal-content"
            className={`relative w-full ${widthMap[width]} rounded-glass border border-[rgba(255,255,255,0.08)] p-6`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              background: 'rgba(255,255,255,0.07)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#f8fafc]">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
