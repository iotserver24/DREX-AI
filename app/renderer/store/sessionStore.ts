/**
 * Session store - Manages current DREX run session state, logs, and tasks
 */

import { create } from 'zustand'
import type { OrchestratorState, Question, Plan, Task, LogEntry, Summary } from '@/lib/types'

interface SessionStore {
  status: OrchestratorState
  currentPlanId: string | null
  questions: Question[]
  plan: Plan | null
  tasks: Task[]
  logs: LogEntry[]
  summary: Summary | null
  selectedTaskId: string | null

  // Actions
  setStatus: (status: OrchestratorState) => void
  setQuestions: (questions: Question[]) => void
  setPlan: (plan: Plan) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void
  setSummary: (summary: Summary) => void
  setSelectedTaskId: (id: string | null) => void
  reset: () => void
}

const initialState = {
  status: 'IDLE' as OrchestratorState,
  currentPlanId: null,
  questions: [],
  plan: null,
  tasks: [],
  logs: [],
  summary: null,
  selectedTaskId: null,
}

/**
 * Zustand store for session management
 */
export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setStatus: (status: OrchestratorState) => {
    set({ status })
  },

  setQuestions: (questions: Question[]) => {
    set({ questions, status: 'PLANNING' })
  },

  setPlan: (plan: Plan) => {
    set({
      plan,
      currentPlanId: plan.id,
      tasks: plan.tasks,
      status: 'AWAITING_APPROVAL',
    })
  },

  addTask: (task: Task) => {
    set((state) => ({
      tasks: [...state.tasks, task],
    }))
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }))
  },

  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...entry,
          id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          timestamp: Date.now(),
        },
      ],
    }))
  },

  setSummary: (summary: Summary) => {
    set({ summary, status: 'DONE' })
  },

  setSelectedTaskId: (id: string | null) => {
    set({ selectedTaskId: id })
  },

  reset: () => {
    set(initialState)
  },
}))
