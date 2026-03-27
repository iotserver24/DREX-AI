import { EventEmitter } from 'events'
import {
  generateQuestions,
  generatePlan,

  type Answer,
  type Plan,
  type Task,
} from './modes/planner.js'
import { executePlan, type RunnerConfig } from './runner.js'
import type { PermissionLevel } from './actions/index.js'
import type { AgentResult } from './agent.js'

/**
 * States of the orchestrator state machine.
 */
export type OrchestratorState =
  | 'IDLE'
  | 'PLANNING'
  | 'AWAITING_ANSWERS'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'DONE'
  | 'FAILED'

/**
 * Summary of a completed plan execution.
 */
export interface Summary {
  planId: string
  tasksTotal: number
  tasksDone: number
  tasksFailed: number
  tasksEscalated: number
  durationMs: number
}

/**
 * Options for the headless run method.
 */
export interface RunOptions {
  headless?: boolean
  dryRun?: boolean
}

/**
 * Configuration for the Drex orchestrator.
 */
export interface DrexConfig {
  projectRoot: string
  apiKey: string
  model: string
  baseURL: string
  maxConcurrentAgents?: number
  permissionLevel?: PermissionLevel
  extraBody?: Record<string, any>
}

/** Default max concurrent agents. */
const DEFAULT_MAX_CONCURRENT = 3

/** Default permission level. */
const DEFAULT_PERMISSION: PermissionLevel = 'moderate'

/**
 * The Drex orchestrator — the main entry point for the autonomous coding engine.
 * Implements a state machine that manages the full lifecycle:
 * IDLE → PLANNING → AWAITING_ANSWERS → AWAITING_APPROVAL → EXECUTING → DONE/FAILED
 *
 * Extends EventEmitter to provide progress events to consuming applications.
 */
export class Orchestrator extends EventEmitter {
  private readonly projectRoot: string
  private readonly apiKey: string
  private readonly model: string
  private readonly maxConcurrentAgents: number
  private readonly permissionLevel: PermissionLevel

  private readonly baseURL: string
  private readonly extraBody?: Record<string, any>

  private state: OrchestratorState = 'IDLE'
  private currentPlanId: string | null = null
  private currentIntent: string | null = null
  private currentPlan: Plan | null = null

  /**
   * Creates a new Drex orchestrator instance.
   *
   * @param config - Configuration for the orchestrator
   */
  constructor(config: DrexConfig) {
    super()
    this.projectRoot = config.projectRoot
    this.apiKey = config.apiKey
    this.model = config.model
    this.baseURL = config.baseURL
    this.extraBody = config.extraBody
    this.maxConcurrentAgents = config.maxConcurrentAgents ?? DEFAULT_MAX_CONCURRENT
    this.permissionLevel = config.permissionLevel ?? DEFAULT_PERMISSION
  }

  /**
   * Returns the current state of the orchestrator.
   *
   * @returns The current OrchestratorState
   */
  getState(): OrchestratorState {
    return this.state
  }

  /**
   * Transitions the state machine to a new state.
   *
   * @param newState - The target state
   */
  private transition(newState: OrchestratorState): void {
    this.state = newState
  }

  /**
   * Starts the planning phase: generates clarifying questions via LLM.
   * Transitions: IDLE → PLANNING → AWAITING_ANSWERS
   * Emits: plan:questions
   *
   * @param intent - User's stated intent/goal
   */
  async plan(intent: string): Promise<void> {
    if (this.state !== 'IDLE') {
      throw new Error(`Cannot start planning from state "${this.state}". Must be IDLE.`)
    }

    this.transition('PLANNING')
    this.currentIntent = intent

    try {
      const { planId, questions } = await generateQuestions(
        this.projectRoot,
        intent,
        { apiKey: this.apiKey, model: this.model, baseURL: this.baseURL, extraBody: this.extraBody }
      )

      this.currentPlanId = planId
      this.transition('AWAITING_ANSWERS')
      this.emit('plan:questions', planId, questions)
    } catch (err: unknown) {
      this.transition('FAILED')
      const error = err instanceof Error ? err : new Error(String(err))
      this.emit('error', error)
    }
  }

  /**
   * Submits answers to the planner's questions and generates the execution plan.
   * Transitions: AWAITING_ANSWERS → PLANNING → AWAITING_APPROVAL
   * Emits: plan:ready
   *
   * @param planId - The plan identifier from the question phase
   * @param answers - User's answers to the generated questions
   */
  async answerQuestions(planId: string, answers: Answer[]): Promise<void> {
    if (this.state !== 'AWAITING_ANSWERS') {
      throw new Error(`Cannot answer questions from state "${this.state}". Must be AWAITING_ANSWERS.`)
    }

    if (planId !== this.currentPlanId) {
      throw new Error(`Plan ID mismatch: expected "${this.currentPlanId}", got "${planId}"`)
    }

    this.transition('PLANNING')

    try {
      const plan = await generatePlan(
        this.projectRoot,
        planId,
        this.currentIntent ?? '',
        answers,
        { apiKey: this.apiKey, model: this.model, baseURL: this.baseURL, extraBody: this.extraBody }
      )

      this.currentPlan = plan
      this.transition('AWAITING_APPROVAL')
      this.emit('plan:ready', plan)
    } catch (err: unknown) {
      this.transition('FAILED')
      const error = err instanceof Error ? err : new Error(String(err))
      this.emit('error', error)
    }
  }

  /**
   * Approves the plan and begins execution.
   * Transitions: AWAITING_APPROVAL → EXECUTING → DONE/FAILED
   * Emits: task:start, task:done, review:fail, task:escalated, error, done
   *
   * @param planId - The plan identifier to approve
   */
  async approve(planId: string): Promise<void> {
    if (this.state !== 'AWAITING_APPROVAL') {
      throw new Error(`Cannot approve from state "${this.state}". Must be AWAITING_APPROVAL.`)
    }

    if (planId !== this.currentPlanId) {
      throw new Error(`Plan ID mismatch: expected "${this.currentPlanId}", got "${planId}"`)
    }

    if (!this.currentPlan) {
      throw new Error('No plan available to execute')
    }

    await this.executePlanInternal(this.currentPlan)
  }

  /**
   * Runs the full pipeline: plan → auto-answer → execute.
   * For headless mode, auto-answers questions with defaults.
   * For dryRun mode, stops after plan generation.
   *
   * @param intent - User's stated intent/goal
   * @param options - Run options (headless, dryRun)
   */
  async run(intent: string, options?: RunOptions): Promise<void> {
    const headless = options?.headless ?? false
    const dryRun = options?.dryRun ?? false

    if (this.state !== 'IDLE') {
      throw new Error(`Cannot run from state "${this.state}". Must be IDLE.`)
    }

    this.transition('PLANNING')
    this.currentIntent = intent

    try {
      /* Generate questions */
      const { planId, questions } = await generateQuestions(
        this.projectRoot,
        intent,
        { apiKey: this.apiKey, model: this.model, baseURL: this.baseURL, extraBody: this.extraBody }
      )

      this.currentPlanId = planId

      if (!headless) {
        this.transition('AWAITING_ANSWERS')
        this.emit('plan:questions', planId, questions)
        return
      }

      /* Headless mode: auto-answer questions */
      const autoAnswers: Answer[] = questions.map((questionItem) => ({
        id: questionItem.id,
        answer: 'Use your best judgment based on the codebase context.',
      }))

      /* Generate plan */
      const plan = await generatePlan(
        this.projectRoot,
        planId,
        intent,
        autoAnswers,
        { apiKey: this.apiKey, model: this.model, baseURL: this.baseURL }
      )

      this.currentPlan = plan

      if (dryRun) {
        this.transition('DONE')
        this.emit('plan:ready', plan)
        const summary: Summary = {
          planId: plan.id,
          tasksTotal: plan.tasks.length,
          tasksDone: 0,
          tasksFailed: 0,
          tasksEscalated: 0,
          durationMs: 0,
        }
        this.emit('done', summary)
        return
      }

      this.emit('plan:ready', plan)
      await this.executePlanInternal(plan)
    } catch (err: unknown) {
      this.transition('FAILED')
      const error = err instanceof Error ? err : new Error(String(err))
      this.emit('error', error)
    }
  }

  /**
   * Internal method to execute a plan and track results.
   *
   * @param plan - The plan to execute
   */
  private async executePlanInternal(plan: Plan): Promise<void> {
    this.transition('EXECUTING')
    const startTime = Date.now()

    const runnerConfig: RunnerConfig = {
      projectRoot: this.projectRoot,
      llmConfig: { apiKey: this.apiKey, model: this.model, baseURL: this.baseURL, extraBody: this.extraBody },
      maxConcurrentAgents: this.maxConcurrentAgents,
      permissionLevel: this.permissionLevel,
    }

    /* Forward runner events */
    const runnerEmitter = new EventEmitter()

    runnerEmitter.on('task:start', (task: Task) => {
      this.emit('task:start', task)
    })

    runnerEmitter.on('task:done', (task: Task, result: AgentResult) => {
      this.emit('task:done', task, result)
    })

    runnerEmitter.on('review:fail', (task: Task, feedback: string, attempt: number) => {
      this.emit('review:fail', task, feedback, attempt)
    })

    runnerEmitter.on('task:escalated', (task: Task) => {
      this.emit('task:escalated', task)
    })

    runnerEmitter.on('error', (err: Error) => {
      this.emit('error', err)
    })

    try {
      await executePlan(runnerConfig, plan.tasks, runnerEmitter)

      const durationMs = Date.now() - startTime
      let tasksDone = 0
      let tasksFailed = 0
      let tasksEscalated = 0

      for (const task of plan.tasks) {
        switch (task.status) {
          case 'done':
            tasksDone++
            break
          case 'failed':
            tasksFailed++
            break
          case 'escalated':
            tasksEscalated++
            break
        }
      }

      const summary: Summary = {
        planId: plan.id,
        tasksTotal: plan.tasks.length,
        tasksDone,
        tasksFailed,
        tasksEscalated,
        durationMs,
      }

      this.transition('DONE')
      this.emit('done', summary)
    } catch (err: unknown) {
      this.transition('FAILED')
      const error = err instanceof Error ? err : new Error(String(err))
      this.emit('error', error)
    } finally {
      /* Reset for potential reuse */
      this.state = this.state === 'FAILED' ? 'FAILED' : 'DONE'
    }
  }

  /**
   * Resets the orchestrator back to IDLE state for reuse.
   */
  reset(): void {
    this.state = 'IDLE'
    this.currentPlanId = null
    this.currentIntent = null
    this.currentPlan = null
    this.removeAllListeners()
  }
}
