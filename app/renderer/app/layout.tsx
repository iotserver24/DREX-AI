/**
 * Root layout for the DREX Next.js application.
 * Applies global styles, fonts and the AppShell chrome.
 */
import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '../components/layout/AppShell'

export const metadata: Metadata = {
  title: 'DREX — Developer Reasoning and Execution',
  description: 'Autonomous multi-agent AI coding system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased text-[#f8fafc] font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
