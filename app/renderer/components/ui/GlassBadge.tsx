/**
 * GlassBadge - A glassmorphism badge component for status indicators
 */

import React, { ReactNode } from 'react'

interface GlassBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet'
  className?: string
  pulse?: boolean
}

/**
 * Renders a glassmorphism badge with various color variants
 */
export function GlassBadge({ children, variant = 'default', className = '', pulse = false }: GlassBadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-300'

  const variantClasses = {
    default: 'bg-white/[0.05] border-white/[0.08] text-slate-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    violet: 'bg-glass-violet/10 border-glass-violet/30 text-violet-400',
  }

  const pulseClass = pulse ? 'animate-pulse' : ''

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${pulseClass} ${className}`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </span>
  )
}
