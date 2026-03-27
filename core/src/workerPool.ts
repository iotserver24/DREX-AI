import pLimit from 'p-limit'

/**
 * Error thrown when a file lock acquisition times out.
 */
export class LockTimeoutError extends Error {
  constructor(filePath: string, agentId: string) {
    super(`Lock timeout: agent "${agentId}" could not acquire lock on "${filePath}" within 30 seconds`)
    this.name = 'LockTimeoutError'
  }
}

/** Polling interval in milliseconds for lock acquisition. */
const LOCK_POLL_INTERVAL_MS = 500

/** Maximum wait time in milliseconds for lock acquisition. */
const LOCK_TIMEOUT_MS = 30_000

/**
 * Delays execution for the specified number of milliseconds.
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * A worker pool that manages concurrent agent execution with file-level locking.
 * Uses p-limit for concurrency control and a file lock registry to prevent
 * conflicting writes from parallel agents.
 */
export class WorkerPool {
  private readonly limiter: ReturnType<typeof pLimit>
  private readonly fileLocks: Map<string, string>

  /**
   * Creates a new WorkerPool with the given concurrency limit.
   *
   * @param maxConcurrency - Maximum number of concurrent agent executions
   */
  constructor(maxConcurrency: number) {
    this.limiter = pLimit(maxConcurrency)
    this.fileLocks = new Map()
  }

  /**
   * Acquires a lock on a file for a specific agent.
   * If the file is already locked by another agent, polls every 500ms
   * until the lock is released or the 30-second timeout is reached.
   *
   * @param filePath - Path to the file to lock
   * @param agentId - ID of the agent requesting the lock
   * @throws LockTimeoutError if the lock cannot be acquired within timeout
   */
  async acquireLock(filePath: string, agentId: string): Promise<void> {
    const startTime = Date.now()

    while (true) {
      const currentHolder = this.fileLocks.get(filePath)

      if (currentHolder === undefined || currentHolder === agentId) {
        this.fileLocks.set(filePath, agentId)
        return
      }

      const elapsed = Date.now() - startTime
      if (elapsed >= LOCK_TIMEOUT_MS) {
        throw new LockTimeoutError(filePath, agentId)
      }

      await delay(LOCK_POLL_INTERVAL_MS)
    }
  }

  /**
   * Acquires locks on multiple files for a specific agent.
   *
   * @param filePaths - Array of file paths to lock
   * @param agentId - ID of the agent requesting the locks
   * @throws LockTimeoutError if any lock cannot be acquired within timeout
   */
  async acquireLocksForFiles(filePaths: string[], agentId: string): Promise<void> {
    for (const filePath of filePaths) {
      await this.acquireLock(filePath, agentId)
    }
  }

  /**
   * Releases all file locks held by a specific agent.
   *
   * @param agentId - ID of the agent whose locks should be released
   */
  releaseLocks(agentId: string): void {
    for (const [filePath, holder] of this.fileLocks.entries()) {
      if (holder === agentId) {
        this.fileLocks.delete(filePath)
      }
    }
  }

  /**
   * Releases a specific file lock held by an agent.
   *
   * @param filePath - Path to the file to unlock
   * @param agentId - ID of the agent releasing the lock
   */
  releaseLock(filePath: string, agentId: string): void {
    const holder = this.fileLocks.get(filePath)
    if (holder === agentId) {
      this.fileLocks.delete(filePath)
    }
  }

  /**
   * Submits work to the pool, respecting the concurrency limit.
   * Automatically acquires file locks before execution and releases them after.
   *
   * @param agentId - Unique identifier for the agent
   * @param filesToLock - Files the agent needs exclusive access to
   * @param work - Async function to execute
   * @returns Promise resolving to the work result
   */
  async submit<T>(
    agentId: string,
    filesToLock: string[],
    work: () => Promise<T>
  ): Promise<T> {
    return this.limiter(async () => {
      await this.acquireLocksForFiles(filesToLock, agentId)

      try {
        return await work()
      } finally {
        this.releaseLocks(agentId)
      }
    })
  }

  /**
   * Returns the number of currently active (running) workers.
   *
   * @returns Count of active workers
   */
  get activeCount(): number {
    return this.limiter.activeCount
  }

  /**
   * Returns the number of tasks waiting in the queue.
   *
   * @returns Count of pending tasks
   */
  get pendingCount(): number {
    return this.limiter.pendingCount
  }
}
