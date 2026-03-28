/**
 * GlassButton - A glassmorphism button component
 */

import React, { ReactNode } from 'react'

interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Renders a glassmorphism button with various variants and sizes
 */
export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: GlassButtonProps) {
  const baseClasses = 'rounded-xl border font-medium transition-all duration-300'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantClasses = {
    primary: 'bg-glass-violet/80 border-glass-violet hover:bg-glass-violet hover:shadow-glass-hover text-white',
    secondary: 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.08] hover:shadow-glass-hover text-slate-100',
    danger: 'bg-red-500/80 border-red-500 hover:bg-red-500 hover:shadow-glass-hover text-white',
  }

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer active:scale-95'

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </button>
  )
}
