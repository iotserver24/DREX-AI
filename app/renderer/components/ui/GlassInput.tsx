/**
 * GlassInput - A glassmorphism input component
 */

import React, { ChangeEvent } from 'react'

interface GlassInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'password' | 'number' | 'email'
  className?: string
  multiline?: boolean
  rows?: number
  disabled?: boolean
}

/**
 * Renders a glassmorphism text input or textarea
 */
export function GlassInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  multiline = false,
  rows = 3,
  disabled = false,
}: GlassInputProps) {
  const baseClasses = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all duration-300 focus:border-glass-violet/60 focus:outline-none focus:ring-2 focus:ring-glass-violet/20'

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const style = {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  }

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`${baseClasses} ${disabledClasses} ${className} resize-none`}
        style={style}
      />
    )
  }

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      style={style}
    />
  )
}
