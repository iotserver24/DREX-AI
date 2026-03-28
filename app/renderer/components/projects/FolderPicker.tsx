/**
 * FolderPicker - Component for picking a new project folder
 */

'use client'

import React from 'react'
import { FolderPlus } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { folderPick } from '@/lib/rpc'

interface FolderPickerProps {
  onFolderSelected: (path: string) => void
}

/**
 * Renders a large button for opening the native folder picker dialog
 */
export function FolderPicker({ onFolderSelected }: FolderPickerProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      const result = await folderPick()

      if (!result.cancelled && result.path) {
        onFolderSelected(result.path)
      }
    } catch (error) {
      console.error('Failed to pick folder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassCard
      hover
      onClick={handleClick}
      className="p-8 text-center cursor-pointer group"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-glass-violet/20 to-glass-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FolderPlus size={32} className="text-glass-violet" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            {isLoading ? 'Opening...' : 'Open Folder'}
          </h3>
          <p className="text-sm text-slate-400">
            Select a project folder to get started with DREX
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
