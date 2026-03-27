/**
 * drex-core — Autonomous Multi-Agent AI Coding Engine
 *
 * Public API surface. This is the ONLY file that CLI and app consumers import.
 *
 * @example
 * ```typescript
 * import { Drex } from 'drex-core'
 *
 * const drex = new Drex({
 *   projectRoot: '/path/to/project',
 *   apiKey: process.env.DREX_LLM_KEY!,
 *   baseURL: 'https://api.openai.com/v1',
 *   model: 'gpt-4o',
 * })
 *
 * drex.on('done', (summary) => console.log(summary))
 * await drex.run('add a /health endpoint', { headless: true })
 * ```
 */

/* Re-export public types */
export { Orchestrator as Drex, type DrexConfig, type RunOptions, type Summary, type OrchestratorState } from './orchestrator.js'
export type { LLMConfig, Message } from './llm.js'
export type { Action, ActionResult, PermissionLevel } from './actions/index.js'
export type { Task, Question, Answer, Plan, AgentType, TaskStatus } from './modes/planner.js'
export type { AgentResult } from './agent.js'
export type { ReviewResult } from './modes/review.js'
export type { MemoryEntry } from './memory.js'
export type { ContextChunk, ContextResult } from './context.js'
