import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './renderer/app/**/*.{js,ts,jsx,tsx,mdx}',
    './renderer/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'glass-dark': '#0a0a0f',
        'glass-violet': '#7c3aed',
        'glass-cyan': '#06b6d4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 0 20px rgba(124,58,237,0.2)',
        'glass-active': '0 0 30px rgba(124,58,237,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
