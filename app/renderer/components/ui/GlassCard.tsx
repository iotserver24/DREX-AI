/**
 * GlassCard — A glassmorphism surface container with optional hover and active states.
 */
import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  active?: boolean
  hoverable?: boolean
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

/** Glass card surface with backdrop blur, optional hover glow, and active violet border. */
export function GlassCard({
  children,
  className = '',
  active = false,
  hoverable = false,
  onClick,
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-glass border transition-all duration-200',
        paddingMap[padding],
        active
          ? 'border-[rgba(124,58,237,0.6)] bg-[rgba(124,58,237,0.1)]'
          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]',
        hoverable && !active
          ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.08)] hover:shadow-glass-hover'
          : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: active
          ? '0 0 30px rgba(124,58,237,0.3)'
          : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {children}
    </div>
  )
}
