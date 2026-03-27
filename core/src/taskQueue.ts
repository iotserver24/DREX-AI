import type { Task, TaskStatus } from './modes/planner.js'

/**
 * A priority-ordered task queue that manages task execution order
 * based on dependency resolution.
 */
export class TaskQueue {
  private readonly tasks: Map<string, Task>
  private readonly completedTasks: Set<string>

  /**
   * Creates a new TaskQueue with the given tasks.
   *
   * @param tasks - Array of tasks to manage
   */
  constructor(tasks: Task[]) {
    this.tasks = new Map()
    this.completedTasks = new Set()

    for (const task of tasks) {
      this.tasks.set(task.id, task)
    }
  }

  /**
   * Returns all tasks whose dependencies are satisfied and are pending.
   * These tasks are safe to execute in parallel.
   *
   * @returns Array of tasks ready for execution
   */
  getReadyTasks(): Task[] {
    const ready: Task[] = []

    for (const task of this.tasks.values()) {
      if (task.status !== 'pending') {
        continue
      }

      const depsResolved = task.dependencies.every((depId) =>
        this.completedTasks.has(depId)
      )

      if (depsResolved) {
        ready.push(task)
      }
    }

    return ready
  }

  /**
   * Updates the status of a task.
   *
   * @param taskId - ID of the task to update
   * @param status - New status for the task
   */
  updateStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.status = status

    if (status === 'done' || status === 'escalated') {
      this.completedTasks.add(taskId)
    }
  }

  /**
   * Marks a task as running.
   *
   * @param taskId - ID of the task to mark as running
   */
  markRunning(taskId: string): void {
    this.updateStatus(taskId, 'running')
  }

  /**
   * Marks a task as completed.
   *
   * @param taskId - ID of the task to mark as done
   */
  markDone(taskId: string): void {
    this.updateStatus(taskId, 'done')
  }

  /**
   * Marks a task as failed.
   *
   * @param taskId - ID of the task to mark as failed
   */
  markFailed(taskId: string): void {
    this.updateStatus(taskId, 'failed')
  }

  /**
   * Marks a task as escalated (max retries exceeded).
   *
   * @param taskId - ID of the task to escalate
   */
  markEscalated(taskId: string): void {
    this.updateStatus(taskId, 'escalated')
  }

  /**
   * Resets a failed task back to pending for retry.
   *
   * @param taskId - ID of the task to reset
   */
  resetForRetry(taskId: string): void {
    this.updateStatus(taskId, 'pending')
  }

  /**
   * Returns whether all tasks are complete (done, failed, or escalated).
   *
   * @returns True if no tasks remain pending or running
   */
  isComplete(): boolean {
    for (const task of this.tasks.values()) {
      if (task.status === 'pending' || task.status === 'running') {
        return false
      }
    }
    return true
  }

  /**
   * Returns a task by its ID.
   *
   * @param taskId - ID of the task to retrieve
   * @returns The task, or undefined if not found
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Returns all tasks as an array.
   *
   * @returns Array of all tasks
   */
  getAllTasks(): Task[] {
    return [...this.tasks.values()]
  }

  /**
   * Returns summary statistics for the queue.
   *
   * @returns Object with counts by status
   */
  getSummary(): { total: number; done: number; failed: number; escalated: number; pending: number; running: number } {
    let done = 0
    let failed = 0
    let escalated = 0
    let pending = 0
    let running = 0

    for (const task of this.tasks.values()) {
      switch (task.status) {
        case 'done':
          done++
          break
        case 'failed':
          failed++
          break
        case 'escalated':
          escalated++
          break
        case 'pending':
          pending++
          break
        case 'running':
          running++
          break
      }
    }

    return { total: this.tasks.size, done, failed, escalated, pending, running }
  }
}
