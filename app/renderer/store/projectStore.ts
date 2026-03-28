/**
 * projectStore — Zustand store for the active project and recent project history.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecentProject } from '../lib/types'

interface ProjectState {
  /** Absolute path to the currently active project, or null if none selected. */
  activeProject: string | null
  /** List of recently opened projects, newest first. */
  recentProjects: RecentProject[]

  /** Sets the active project path. */
  setActiveProject: (path: string) => void
  /** Adds or refreshes a project in the recent list. */
  addToRecent: (project: RecentProject) => void
  /** Removes a project from recent history. */
  removeFromRecent: (path: string) => void
  /** Clears the active project. */
  clearActiveProject: () => void
}

const MAX_RECENT = 20

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      recentProjects: [],

      setActiveProject: (path) => set({ activeProject: path }),

      addToRecent: (project) =>
        set((state) => {
          const filtered = state.recentProjects.filter((p) => p.path !== project.path)
          const updated = [project, ...filtered].slice(0, MAX_RECENT)
          return { recentProjects: updated }
        }),

      removeFromRecent: (path) =>
        set((state) => ({
          recentProjects: state.recentProjects.filter((p) => p.path !== path),
        })),

      clearActiveProject: () => set({ activeProject: null }),
    }),
    {
      name: 'drex-projects',
    }
  )
)
