/**
 * GlassButton — A glassmorphism button with violet, ghost, and danger variants.
 */
import React from 'react'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const variantClasses = {
  primary: 'bg-[rgba(124,58,237,0.8)] hover:bg-[rgba(124,58,237,1)] border-[rgba(124,58,237,0.6)] text-white',
  ghost: 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-[#f8fafc]',
  danger: 'bg-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.3)] border-[rgba(239,68,68,0.5)] text-[#ef4444]',
  success: 'bg-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.3)] border-[rgba(34,197,94,0.5)] text-[#22c55e]',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

/** Glassmorphism button with primary, ghost, danger and success variants. */
export function GlassButton({
  variant = 'ghost',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg border font-medium',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(124,58,237,0.5)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
