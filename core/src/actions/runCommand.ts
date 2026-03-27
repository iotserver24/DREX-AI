/**
 * Result of a run command action.
 */
export interface RunCommandResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
  error?: string
}

/**
 * Runs a shell command in the project directory using Bun.spawn.
 *
 * @param projectRoot - Absolute path to the project root directory (used as cwd)
 * @param command - Shell command string to execute
 * @returns Result with stdout, stderr, exit code, and success status
 */
export async function runCommand(
  projectRoot: string,
  command: string
): Promise<RunCommandResult> {
  try {
    const proc = Bun.spawn(['sh', '-c', command], {
      cwd: projectRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    })

    const stdoutText = await new Response(proc.stdout).text()
    const stderrText = await new Response(proc.stderr).text()
    const exitCode = await proc.exited

    return {
      success: exitCode === 0,
      stdout: stdoutText,
      stderr: stderrText,
      exitCode,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      stdout: '',
      stderr: '',
      exitCode: 1,
      error: `Failed to run command "${command}": ${message}`,
    }
  }
}
