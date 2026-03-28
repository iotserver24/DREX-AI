/**
 * Project store - Manages active project and recent project history
 */

import { create } from 'zustand'
import type { RecentProject } from '@/lib/types'

interface ProjectStore {
  activeProject: string | null
  recentProjects: RecentProject[]

  // Actions
  setActiveProject: (path: string) => void
  addToRecent: (path: string, name: string) => void
  removeFromRecent: (path: string) => void
  clearActiveProject: () => void
  initializeRecentProjects: (projects: RecentProject[]) => void
}

/**
 * Zustand store for project management
 */
export const useProjectStore = create<ProjectStore>((set) => ({
  activeProject: null,
  recentProjects: [],

  setActiveProject: (path: string) => {
    set({ activeProject: path })
  },

  addToRecent: (path: string, name: string) => {
    set((state) => {
      // Remove if already exists
      const filtered = state.recentProjects.filter((p) => p.path !== path)

      // Add to beginning
      const newProject: RecentProject = {
        path,
        name,
        lastUsed: Date.now(),
      }

      // Keep only last 10 projects
      const updated = [newProject, ...filtered].slice(0, 10)

      return { recentProjects: updated }
    })
  },

  removeFromRecent: (path: string) => {
    set((state) => ({
      recentProjects: state.recentProjects.filter((p) => p.path !== path),
    }))
  },

  clearActiveProject: () => {
    set({ activeProject: null })
  },

  initializeRecentProjects: (projects: RecentProject[]) => {
    set({ recentProjects: projects })
  },
}))
