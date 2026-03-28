/**
 * GlassInput — A glassmorphism text input component.
 */
import React from 'react'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

/** Glassmorphism text input with optional label, error state, and icon slots. */
export function GlassInput({
  label,
  error,
  leftIcon,
  rightElement,
  className = '',
  id,
  ...props
}: GlassInputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#94a3b8]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#94a3b8]">{leftIcon}</span>
        )}
        <input
          id={inputId}
          {...props}
          className={[
            'w-full rounded-lg border py-2 px-3 text-sm text-[#f8fafc] placeholder-[#94a3b8]',
            'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.08)]',
            'focus:outline-none focus:border-[rgba(124,58,237,0.6)] focus:bg-[rgba(255,255,255,0.08)]',
            'transition-all duration-200',
            error ? 'border-[rgba(239,68,68,0.6)]' : '',
            leftIcon ? 'pl-9' : '',
            rightElement ? 'pr-10' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        />
        {rightElement && (
          <span className="absolute right-3">{rightElement}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
}
