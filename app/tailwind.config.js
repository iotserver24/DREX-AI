/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './renderer/components/**/*.{js,ts,jsx,tsx,mdx}',
    './renderer/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        drex: {
          bg: '#0a0a0f',
          surface: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
          violet: '#7c3aed',
          cyan: '#06b6d4',
          'text-primary': '#f8fafc',
          'text-secondary': '#94a3b8',
          danger: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        glass: '16px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 0 20px rgba(124,58,237,0.2)',
        'glass-active': '0 0 30px rgba(124,58,237,0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease',
        'slide-up': 'slide-up 0.3s ease',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(124,58,237,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(124,58,237,0.8)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
