/**
 * Typed RPC helpers for Electrobun communication between renderer and main process
 */

import type {
  RPCPlanRequest,
  RPCAnswerQuestionsRequest,
  RPCApproveRequest,
  RPCRunRequest,
  RPCFolderPickResult,
  AppConfig,
  DrexEvent,
} from './types'

// Type guard for window.electrobun
declare global {
  interface Window {
    electrobun?: {
      send: (channel: string, data?: unknown) => void
      on: (channel: string, callback: (data: unknown) => void) => void
      invoke: (channel: string, data?: unknown) => Promise<unknown>
    }
  }
}

/**
 * Check if Electrobun is available
 */
export function isElectrobunAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.electrobun
}

/**
 * Send a message to the main process
 */
export function send(channel: string, data?: unknown): void {
  if (!isElectrobunAvailable()) {
    console.warn('Electrobun not available')
    return
  }
  window.electrobun!.send(channel, data)
}

/**
 * Listen for messages from the main process
 */
export function on(channel: string, callback: (data: unknown) => void): void {
  if (!isElectrobunAvailable()) {
    console.warn('Electrobun not available')
    return
  }
  window.electrobun!.on(channel, callback)
}

/**
 * Invoke an RPC method on the main process
 */
export async function invoke<T = unknown>(channel: string, data?: unknown): Promise<T> {
  if (!isElectrobunAvailable()) {
    throw new Error('Electrobun not available')
  }
  return window.electrobun!.invoke(channel, data) as Promise<T>
}

// ============================================================================
// Typed RPC Methods
// ============================================================================

/**
 * Request DREX to create a plan
 */
export async function drexPlan(request: RPCPlanRequest): Promise<{ planId: string }> {
  return invoke<{ planId: string }>('drex:plan', request)
}

/**
 * Answer questions for a plan
 */
export async function drexAnswerQuestions(request: RPCAnswerQuestionsRequest): Promise<void> {
  return invoke<void>('drex:answerQuestions', request)
}

/**
 * Approve a plan and start execution
 */
export async function drexApprove(request: RPCApproveRequest): Promise<void> {
  return invoke<void>('drex:approve', request)
}

/**
 * Run DREX with an intent
 */
export async function drexRun(request: RPCRunRequest): Promise<void> {
  return invoke<void>('drex:run', request)
}

/**
 * Get application config
 */
export async function configGet(): Promise<AppConfig> {
  return invoke<AppConfig>('config:get')
}

/**
 * Save application config
 */
export async function configSave(config: AppConfig): Promise<void> {
  return invoke<void>('config:save', config)
}

/**
 * Open native folder picker dialog
 */
export async function folderPick(): Promise<RPCFolderPickResult> {
  return invoke<RPCFolderPickResult>('folder:pick')
}

/**
 * Listen for DREX events from main process
 */
export function onDrexEvent(callback: (event: DrexEvent) => void): void {
  on('drex:event', (data) => {
    callback(data as DrexEvent)
  })
}

/**
 * Remove all event listeners (for cleanup)
 */
export function removeAllListeners(): void {
  // Note: Electrobun doesn't provide removeListener API
  // This is a placeholder for future implementation
  console.warn('removeAllListeners not implemented in Electrobun')
}
