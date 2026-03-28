/**
 * GlassCard - A glassmorphism card component
 */

import React, { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  active?: boolean
}

/**
 * Renders a glassmorphism card with backdrop blur and semi-transparent background
 */
export function GlassCard({ children, className = '', onClick, hover = false, active = false }: GlassCardProps) {
  const baseClasses = 'rounded-2xl border transition-all duration-300'
  const glassClasses = 'border-white/[0.08] shadow-glass'

  const stateClasses = active
    ? 'bg-glass-violet/10 border-glass-violet/60 shadow-glass-active'
    : hover
    ? 'bg-white/[0.05] hover:bg-white/[0.08] hover:shadow-glass-hover'
    : 'bg-white/[0.05]'

  const cursorClass = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseClasses} ${glassClasses} ${stateClasses} ${cursorClass} ${className}`}
      onClick={onClick}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  )
}
