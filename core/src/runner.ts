import { EventEmitter } from 'events'
import { TaskQueue } from './taskQueue.js'
import { WorkerPool } from './workerPool.js'
import { runAgent, type AgentConfig, type AgentResult } from './agent.js'
import { reviewTask } from './modes/review.js'
import { runVerification, formatVerificationForReview } from './verification.js'

import type { Task } from './modes/planner.js'
import type { PermissionLevel } from './actions/index.js'

/** Maximum number of retry attempts per task before escalation. */
const MAX_RETRIES = 3

/**
 * Events emitted by the Runner during plan execution.
 */
export interface RunnerEvents {
  'task:start': (task: Task) => void
  'task:done': (task: Task, result: AgentResult) => void
  'review:fail': (task: Task, feedback: string, attempt: number) => void
  'task:escalated': (task: Task) => void
  'error': (err: Error) => void
}

import type { LLMConfig } from './llm.js'

/**
 * Configuration for the plan runner.
 */
export interface RunnerConfig {
  projectRoot: string
  llmConfig: LLMConfig
  maxConcurrentAgents: number
  permissionLevel: PermissionLevel
}

/**
 * Executes a full plan: dequeues ready tasks, dispatches agents via the worker pool,
 * runs verification, reviews results, and handles retries/escalation.
 *
 * @param config - Runner configuration
 * @param tasks - Array of tasks to execute
 * @param emitter - EventEmitter for progress events
 * @returns Promise that resolves when all tasks are complete
 */
export async function executePlan(
  config: RunnerConfig,
  tasks: Task[],
  emitter: EventEmitter
): Promise<void> {
  const queue = new TaskQueue(tasks)
  const pool = new WorkerPool(config.maxConcurrentAgents)
  const retryCounts = new Map<string, number>()

  const agentConfig: AgentConfig = {
    projectRoot: config.projectRoot,
    llmConfig: config.llmConfig,
    permissionLevel: config.permissionLevel,
  }

  /**
   * Processes a single task through the agent → verify → review → retry loop.
   *
   * @param task - The task to execute
   * @param feedback - Optional reviewer feedback from a previous attempt
   */
  async function processTask(task: Task, feedback?: string): Promise<void> {
    const currentRetries = retryCounts.get(task.id) ?? 0

    try {
      queue.markRunning(task.id)
      emitter.emit('task:start', task)

      /* Run the agent */
      const result = await runAgent(
        agentConfig,
        {
          id: task.id,
          description: task.description,
          filesLikelyAffected: task.filesLikelyAffected,
          agentType: task.agentType,
        },
        feedback
      )

      if (!result.success) {
        if (currentRetries < MAX_RETRIES) {
          retryCounts.set(task.id, currentRetries + 1)
          emitter.emit('review:fail', task, result.error ?? 'Agent execution failed', currentRetries + 1)
          queue.resetForRetry(task.id)
          return
        }

        queue.markEscalated(task.id)
        emitter.emit('task:escalated', task)
        return
      }

      /* Run verification pass — re-run commands and check imports */
      let verificationDataStr = ''
      try {
        const verificationResult = await runVerification(
          config.projectRoot,
          result.actionResults.map((ar) => ar.action),
          result.actionResults
        )
        verificationDataStr = formatVerificationForReview(verificationResult)
      } catch {
        /* Verification errors should not block the review */
      }

      /* Format a detailed summary of actions for the reviewer */
      const actionsSummary = result.actionResults.map((ar, idx) => {
        const action = ar.action
        let detail = `Action ${idx + 1}: ${action.type}`
        if (action.path) detail += ` on ${action.path}`
        if (action.cmd) detail += ` (${action.cmd})`
        if (ar.error) detail += ` - FAILED: ${ar.error}`
        else detail += ` - SUCCESS`
        
        /* For file changes, include the new content so reviewer can see it */
        if (!ar.error && (action.type === 'create_file' || action.type === 'edit_file') && action.content) {
          detail += `\nNew Content:\n\`\`\`\n${action.content}\n\`\`\``
        }
        return detail
      }).join('\n\n')

      /* Review the result with verification data */
      const reviewResult = await reviewTask(
        config.llmConfig,
        task.description,
        actionsSummary,
        verificationDataStr || undefined
      )

      if (reviewResult.pass) {
        queue.markDone(task.id)
        emitter.emit('task:done', task, result)
      } else {
        if (currentRetries < MAX_RETRIES) {
          retryCounts.set(task.id, currentRetries + 1)
          emitter.emit('review:fail', task, reviewResult.feedback ?? 'Review failed', currentRetries + 1)
          queue.resetForRetry(task.id)
        } else {
          queue.markEscalated(task.id)
          emitter.emit('task:escalated', task)
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      const error = err instanceof Error ? err : new Error(message)

      if (currentRetries < MAX_RETRIES) {
        retryCounts.set(task.id, currentRetries + 1)
        emitter.emit('review:fail', task, message, currentRetries + 1)
        queue.resetForRetry(task.id)
      } else {
        queue.markEscalated(task.id)
        emitter.emit('task:escalated', task)
        emitter.emit('error', error)
      }
    }
  }

  /* Main execution loop: repeatedly dequeue ready tasks and dispatch them */
  while (!queue.isComplete()) {
    const readyTasks = queue.getReadyTasks()

    if (readyTasks.length === 0) {
      /* Check if there are tasks still running — wait a bit */
      const summary = queue.getSummary()
      if (summary.running > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        continue
      }

      /* Deadlock: no tasks ready and none running */
      const pendingTasks = queue.getAllTasks().filter((task) => task.status === 'pending')
      for (const stuckTask of pendingTasks) {
        queue.markEscalated(stuckTask.id)
        emitter.emit('task:escalated', stuckTask)
      }
      break
    }

    /* Dispatch all ready tasks in parallel via the worker pool */
    const dispatched = readyTasks.map((task) =>
      pool.submit(task.id, task.filesLikelyAffected, () => {
        const currentFeedback = retryCounts.has(task.id) ? undefined : undefined
        return processTask(task, currentFeedback)
      })
    )

    await Promise.allSettled(dispatched)
  }
}
