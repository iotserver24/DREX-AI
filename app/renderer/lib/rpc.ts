/**
 * Typed RPC helpers for communicating between the renderer (Next.js) and
 * the main process (Electrobun). Falls back gracefully when running in a
 * plain browser (dev server without Electrobun).
 */
import type { AppConfig, DrexEvent, Answer, Plan } from './types'

/** True when running inside Electrobun where window.electrobun is available. */
function isElectrobun(): boolean {
  return typeof window !== 'undefined' && 'electrobun' in window
}

/** Raw Electrobun RPC call — typed wrapper. */
async function call<T>(method: string, params?: unknown): Promise<T> {
  if (!isElectrobun()) {
    console.warn(`[rpc] Not in Electrobun environment, skipping call: ${method}`)
    return Promise.reject(new Error(`RPC unavailable outside Electrobun: ${method}`))
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).electrobun.rpc.call(method, params) as Promise<T>
}

/** Subscribe to events pushed from the main process. */
function on(channel: string, handler: (payload: unknown) => void): () => void {
  if (!isElectrobun()) return () => {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any
  win.electrobun.rpc.on(channel, handler)
  return () => win.electrobun.rpc.off(channel, handler)
}

// ─── Config RPC ──────────────────────────────────────────────────────────────

/** Retrieves the full application config from the main process. */
export async function rpcGetConfig(): Promise<AppConfig> {
  return call<AppConfig>('config:get')
}

/** Persists the application config via the main process. */
export async function rpcSaveConfig(config: Partial<AppConfig>): Promise<void> {
  return call<void>('config:save', config)
}

// ─── Folder picker RPC ───────────────────────────────────────────────────────

/** Opens a native folder picker dialog; resolves with the selected path or null. */
export async function rpcPickFolder(): Promise<string | null> {
  return call<string | null>('folder:pick')
}

// ─── DREX session RPC ────────────────────────────────────────────────────────

/** Starts the planning phase for the given intent in the given project. */
export async function rpcPlan(intent: string, projectRoot: string): Promise<string> {
  return call<string>('drex:plan', { intent, projectRoot })
}

/** Submits answers to planner questions. */
export async function rpcAnswerQuestions(planId: string, answers: Answer[]): Promise<void> {
  return call<void>('drex:answerQuestions', { planId, answers })
}

/** Approves a plan and begins execution. */
export async function rpcApprovePlan(planId: string): Promise<void> {
  return call<void>('drex:approve', { planId })
}

/** Runs DREX headlessly (plan + auto-answer + execute). */
export async function rpcRun(
  intent: string,
  projectRoot: string,
  options?: { headless?: boolean; dryRun?: boolean }
): Promise<void> {
  return call<void>('drex:run', { intent, projectRoot, options })
}

/** Cancels the current session. */
export async function rpcCancel(): Promise<void> {
  return call<void>('drex:cancel')
}

// ─── Event subscriptions ─────────────────────────────────────────────────────

/** Subscribes to all drex:event messages from the main process. */
export function onDrexEvent(handler: (event: DrexEvent) => void): () => void {
  return on('drex:event', (payload) => handler(payload as DrexEvent))
}
