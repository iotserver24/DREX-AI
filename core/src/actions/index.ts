import { resolve } from 'path'
import { editFile } from './editFile.js'
import { createFile } from './createFile.js'
import { deleteFile } from './deleteFile.js'
import { runCommand } from './runCommand.js'

/**
 * Permission levels controlling what actions are allowed.
 */
export type PermissionLevel = 'safe' | 'moderate' | 'full'

/**
 * Result of any action execution.
 */
export interface ActionResult {
  success: boolean
  error?: string
}

/**
 * A single action parsed from LLM output.
 */
export interface Action {
  type: 'edit_file' | 'create_file' | 'delete_file' | 'run_command'
  path?: string
  content?: string
  cmd?: string
}

/** Commands that are always blocked regardless of permission level. */
const BLOCKED_COMMANDS: RegExp[] = [
  /rm\s+-rf\s+\//,
  /\bshutdown\b/,
  /\breboot\b/,
  /curl\s.*\|\s*bash/,
  /wget\s.*\|\s*sh/,
  /\bmkfs\b/,
  /\bdd\s+if=/,
  /curl\s.*\|\s*sh/,
  /wget\s.*\|\s*bash/,
  />\s*\/dev\/sda/,
  /:(){ :\|:& };:/,
]

/**
 * Checks whether a command string matches any blocked command pattern.
 *
 * @param cmd - The command string to check
 * @returns True if the command is blocked
 */
function isBlockedCommand(cmd: string): boolean {
  return BLOCKED_COMMANDS.some((pattern) => pattern.test(cmd))
}

/**
 * Validates that a file path resolves within the project root directory.
 * Prevents path traversal attacks.
 *
 * @param projectRoot - Absolute path to the project root
 * @param filePath - Relative file path to validate
 * @returns The resolved absolute path if valid
 * @throws Error if the path resolves outside project root
 */
function validatePath(projectRoot: string, filePath: string): string {
  const resolvedRoot = resolve(projectRoot)
  const resolvedPath = resolve(projectRoot, filePath)

  if (!resolvedPath.startsWith(resolvedRoot + '/') && resolvedPath !== resolvedRoot) {
    throw new Error(`Path traversal detected: "${filePath}" resolves outside project root`)
  }

  return resolvedPath
}

/**
 * Checks whether the given action is permitted under the current permission level.
 *
 * @param action - The action to check
 * @param level - The current permission level
 * @returns An error message if blocked, or null if permitted
 */
function checkPermission(action: Action, level: PermissionLevel): string | null {
  if (level === 'safe') {
    return `Action "${action.type}" is blocked under "safe" permission level (read-only mode)`
  }

  if (level === 'moderate') {
    if (action.type === 'delete_file') {
      return `Action "delete_file" is blocked under "moderate" permission level`
    }
    if (action.type === 'run_command' && action.cmd) {
      const dangerousPatterns = [/\brm\b/, /\brmdir\b/, /\bmv\s+.*\s+\/dev\/null/]
      for (const pattern of dangerousPatterns) {
        if (pattern.test(action.cmd)) {
          return `Destructive command blocked under "moderate" permission level: "${action.cmd}"`
        }
      }
    }
  }

  return null
}

/**
 * Dispatches and executes a single action with full safety checks.
 * Validates paths, checks permissions, and blocks dangerous commands
 * before executing any action.
 *
 * @param action - The action to execute
 * @param projectRoot - Absolute path to the project root
 * @param permissionLevel - Current permission level
 * @returns Result indicating success or failure
 */
export async function executeAction(
  action: Action,
  projectRoot: string,
  permissionLevel: PermissionLevel
): Promise<ActionResult> {
  try {
    const permissionError = checkPermission(action, permissionLevel)
    if (permissionError) {
      return { success: false, error: permissionError }
    }

    switch (action.type) {
      case 'edit_file': {
        if (!action.path || action.content === undefined) {
          return { success: false, error: 'edit_file requires "path" and "content" fields' }
        }
        validatePath(projectRoot, action.path)
        return await editFile(projectRoot, action.path, action.content)
      }

      case 'create_file': {
        if (!action.path || action.content === undefined) {
          return { success: false, error: 'create_file requires "path" and "content" fields' }
        }
        validatePath(projectRoot, action.path)
        return await createFile(projectRoot, action.path, action.content)
      }

      case 'delete_file': {
        if (!action.path) {
          return { success: false, error: 'delete_file requires "path" field' }
        }
        validatePath(projectRoot, action.path)
        return await deleteFile(projectRoot, action.path)
      }

      case 'run_command': {
        if (!action.cmd) {
          return { success: false, error: 'run_command requires "cmd" field' }
        }
        if (isBlockedCommand(action.cmd)) {
          return { success: false, error: `Blocked dangerous command: "${action.cmd}"` }
        }
        const result = await runCommand(projectRoot, action.cmd)
        return { success: result.success, error: result.error ?? (result.success ? undefined : result.stderr) }
      }

      default: {
        const exhaustiveCheck: never = action.type
        return { success: false, error: `Unknown action type: "${exhaustiveCheck}"` }
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

/**
 * Dispatches and executes an array of actions sequentially with safety checks.
 * Stops execution on first failure.
 *
 * @param actions - Array of actions to execute
 * @param projectRoot - Absolute path to the project root
 * @param permissionLevel - Current permission level
 * @returns Array of results, one per action attempted
 */
export async function executeActions(
  actions: Action[],
  projectRoot: string,
  permissionLevel: PermissionLevel
): Promise<ActionResult[]> {
  const results: ActionResult[] = []

  for (const action of actions) {
    const result = await executeAction(action, projectRoot, permissionLevel)
    results.push(result)

    if (!result.success) {
      break
    }
  }

  return results
}
