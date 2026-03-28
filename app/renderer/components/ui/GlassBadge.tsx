/**
 * GlassBadge — A small status/type badge with color variants.
 */
import React from 'react'

interface GlassBadgeProps {
  children: React.ReactNode
  variant?: 'violet' | 'cyan' | 'green' | 'orange' | 'red' | 'gray' | 'yellow'
  pulse?: boolean
  className?: string
}

const variantClasses: Record<NonNullable<GlassBadgeProps['variant']>, string> = {
  violet: 'bg-[rgba(124,58,237,0.2)] text-[#a78bfa] border-[rgba(124,58,237,0.3)]',
  cyan: 'bg-[rgba(6,182,212,0.2)] text-[#22d3ee] border-[rgba(6,182,212,0.3)]',
  green: 'bg-[rgba(34,197,94,0.2)] text-[#4ade80] border-[rgba(34,197,94,0.3)]',
  orange: 'bg-[rgba(245,158,11,0.2)] text-[#fbbf24] border-[rgba(245,158,11,0.3)]',
  red: 'bg-[rgba(239,68,68,0.2)] text-[#f87171] border-[rgba(239,68,68,0.3)]',
  gray: 'bg-[rgba(148,163,184,0.15)] text-[#94a3b8] border-[rgba(148,163,184,0.2)]',
  yellow: 'bg-[rgba(234,179,8,0.2)] text-[#facc15] border-[rgba(234,179,8,0.3)]',
}

/** Small inline badge with glassmorphism styling for statuses and type labels. */
export function GlassBadge({
  children,
  variant = 'gray',
  pulse = false,
  className = '',
}: GlassBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        pulse ? 'animate-pulse-glow' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
