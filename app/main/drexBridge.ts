/**
 * drexBridge — Integrates drex-core with the Electrobun main process.
 * Creates/manages a Drex instance per session and forwards EventEmitter
 * events to the renderer via the provided sendEvent callback.
 */
import { Drex } from 'drex-core'
import type { DrexConfig, RunOptions } from 'drex-core'
import type { DrexEvent, Answer } from '../renderer/lib/types'

type SendEvent = (event: DrexEvent) => void

/**
 * Manages the lifecycle of a Drex session.
 */
export class DrexBridge {
  private drex: InstanceType<typeof Drex> | null = null
  private currentPlanId: string | null = null
  private sendEvent: SendEvent

  constructor(sendEvent: SendEvent) {
    this.sendEvent = sendEvent
  }

  /**
   * Creates a new Drex instance configured with the provided settings.
   *
   * @param config - DrexConfig passed directly to the Orchestrator
   */
  private createDrex(config: DrexConfig): InstanceType<typeof Drex> {
    const instance = new Drex(config)

    instance.on('plan:questions', (planId: string, questions: unknown[]) => {
      this.currentPlanId = planId
      this.sendEvent({
        type: 'plan:questions',
        payload: { planId, questions: questions as import('../renderer/lib/types').Question[] },
      })
    })

    instance.on('plan:ready', (plan: unknown) => {
      this.sendEvent({ type: 'plan:ready', payload: plan as import('../renderer/lib/types').Plan })
    })

    instance.on('task:start', (task: unknown) => {
      this.sendEvent({ type: 'task:start', payload: task as import('../renderer/lib/types').Task })
    })

    instance.on('task:done', (task: unknown, result: unknown) => {
      this.sendEvent({
        type: 'task:done',
        payload: { task: task as import('../renderer/lib/types').Task, result },
      })
    })

    instance.on('review:fail', (task: unknown, feedback: string, attempt: number) => {
      this.sendEvent({
        type: 'review:fail',
        payload: { task: task as import('../renderer/lib/types').Task, feedback, attempt },
      })
    })

    instance.on('done', (summary: unknown) => {
      this.sendEvent({ type: 'done', payload: summary as import('../renderer/lib/types').Summary })
    })

    instance.on('error', (err: Error) => {
      this.sendEvent({ type: 'error', payload: { message: err.message } })
    })

    return instance
  }

  /**
   * Starts the planning phase for the given intent.
   *
   * @param intent - User's stated intent
   * @param projectRoot - Absolute path to the project
   * @param config - LLM configuration
   * @returns The generated plan ID
   */
  async plan(
    intent: string,
    projectRoot: string,
    config: { apiKey: string; baseURL: string; model: string; maxConcurrentAgents?: number }
  ): Promise<string> {
    this.drex = this.createDrex({
      projectRoot,
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
      maxConcurrentAgents: config.maxConcurrentAgents ?? 3,
      permissionLevel: 'moderate',
    })
    await this.drex.plan(intent)
    return this.currentPlanId ?? ''
  }

  /**
   * Submits answers to planner questions.
   *
   * @param planId - Plan ID from the question phase
   * @param answers - User's answers
   */
  async answerQuestions(planId: string, answers: Answer[]): Promise<void> {
    if (!this.drex) throw new Error('No active Drex session')
    await this.drex.answerQuestions(planId, answers)
  }

  /**
   * Approves the plan and begins execution.
   *
   * @param planId - Plan ID to approve
   */
  async approve(planId: string): Promise<void> {
    if (!this.drex) throw new Error('No active Drex session')
    await this.drex.approve(planId)
  }

  /**
   * Runs the full pipeline headlessly.
   *
   * @param intent - User's intent
   * @param projectRoot - Project path
   * @param config - LLM config
   * @param options - Run options
   */
  async run(
    intent: string,
    projectRoot: string,
    config: { apiKey: string; baseURL: string; model: string; maxConcurrentAgents?: number },
    options?: RunOptions
  ): Promise<void> {
    this.drex = this.createDrex({
      projectRoot,
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
      maxConcurrentAgents: config.maxConcurrentAgents ?? 3,
      permissionLevel: 'moderate',
    })
    await this.drex.run(intent, options)
  }

  /** Cancels the current session and resets the bridge. */
  cancel(): void {
    this.drex?.reset()
    this.drex = null
    this.currentPlanId = null
  }
}
