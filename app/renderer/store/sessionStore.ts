/**
 * sessionStore — Zustand store for the current DREX run session state.
 */
import { create } from 'zustand'
import type {
  OrchestratorState,
  Question,
  Plan,
  Task,
  LogEntry,
  Summary,
} from '../lib/types'

interface SessionState {
  /** Current orchestrator state. */
  status: OrchestratorState
  /** Plan ID for the current session. */
  currentPlanId: string | null
  /** Questions generated during planning. */
  questions: Question[]
  /** Current execution plan. */
  plan: Plan | null
  /** All tasks (mirrors plan.tasks but kept in sync with live updates). */
  tasks: Task[]
  /** Streaming log entries. */
  logs: LogEntry[]
  /** Run summary (available when status is DONE). */
  summary: Summary | null
  /** ID of the task being viewed in the detail panel. */
  selectedTaskId: string | null

  /** Appends a log entry. */
  addLog: (entry: LogEntry) => void
  /** Updates a single task by ID. */
  updateTask: (id: string, updates: Partial<Task>) => void
  /** Sets the orchestrator status. */
  setStatus: (status: OrchestratorState) => void
  /** Sets the current plan and initialises tasks. */
  setPlan: (plan: Plan) => void
  /** Sets the questions list. */
  setQuestions: (questions: Question[]) => void
  /** Sets the plan ID. */
  setPlanId: (id: string) => void
  /** Sets the run summary. */
  setSummary: (summary: Summary) => void
  /** Sets the selected task for the detail panel. */
  setSelectedTaskId: (id: string | null) => void
  /** Resets the session to IDLE. */
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

let logIdCounter = 0

/** Generates a unique log entry ID. */
function nextLogId(): string {
  return `log-${Date.now()}-${++logIdCounter}`
}

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialState,

  addLog: (entry) =>
    set((state) => ({
      logs: [...state.logs, { ...entry, id: entry.id || nextLogId() }],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  setStatus: (status) => set({ status }),

  setPlan: (plan) =>
    set({
      plan,
      tasks: plan.tasks,
      status: 'AWAITING_APPROVAL',
      currentPlanId: plan.id,
    }),

  setQuestions: (questions) => set({ questions, status: 'AWAITING_ANSWERS' }),

  setPlanId: (id) => set({ currentPlanId: id }),

  setSummary: (summary) => set({ summary, status: 'DONE' }),

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  reset: () => set({ ...initialState }),
}))
