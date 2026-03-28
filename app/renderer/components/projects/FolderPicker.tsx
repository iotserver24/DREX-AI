/**
 * FolderPicker — Button to open a native folder picker dialog.
 */
'use client'
import React, { useState } from 'react'
import { FolderPlus } from 'lucide-react'
import { GlassButton } from '../ui/GlassButton'
import { rpcPickFolder } from '../../lib/rpc'

interface FolderPickerProps {
  onSelect: (path: string) => void
}

/** Large "Open Folder" button that triggers the native folder picker dialog. */
export function FolderPicker({ onSelect }: FolderPickerProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const path = await rpcPickFolder()
      if (path) onSelect(path)
    } catch {
      // In dev/browser mode rpc will be unavailable – silently ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassButton
      variant="primary"
      size="lg"
      loading={loading}
      onClick={handleClick}
      className="w-full sm:w-auto gap-2"
    >
      <FolderPlus size={18} />
      Open Folder
    </GlassButton>
  )
}
