/**
 * Execution verification for the DREX runner.
 * Re-runs commands and checks import resolution to provide
 * ground truth data to the code reviewer.
 */

import { resolve, dirname, extname } from 'path'
import { runCommand } from './actions/runCommand.js'
import type { Action, ActionResult } from './actions/index.js'

/**
 * Output captured from re-running a command.
 */
export interface CommandVerification {
  command: string
  stdout: string
  stderr: string
  exitCode: number
  success: boolean
}

/**
 * A broken import detected in a written file.
 */
export interface BrokenImport {
  filePath: string
  importPath: string
  resolvedAttempt: string
}

/**
 * Complete verification result for an agent's work.
 */
export interface VerificationResult {
  commandOutputs: CommandVerification[]
  brokenImports: BrokenImport[]
  addedImports: string[]
}

/**
 * Extracts import paths from TypeScript/JavaScript source content.
 *
 * @param content - Source file content
 * @returns Array of import path strings
 */
function extractImportPaths(content: string): string[] {
  const imports: string[] = []
  const importPattern = /(?:import|from|require\()\s*['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null

  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1]
    if (importPath) {
      imports.push(importPath)
    }
  }

  return imports
}

/**
 * Checks if a relative import path resolves to an existing file.
 *
 * @param projectRoot - Absolute project root
 * @param sourceFile - Relative path of the file containing the import
 * @param importPath - The import path to check
 * @returns The resolved attempt path if broken, or null if valid
 */
async function checkImportResolution(
  projectRoot: string,
  sourceFile: string,
  importPath: string
): Promise<string | null> {
  /* Only check relative imports */
  if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
    return null
  }

  const sourceDir = dirname(resolve(projectRoot, sourceFile))
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js']

  /* Try the import path as-is first, then with each extension */
  for (const ext of extensions) {
    const candidate = resolve(sourceDir, importPath + ext)
    const file = Bun.file(candidate)
    const exists = await file.exists()
    if (exists) {
      return null /* Import resolves fine */
    }
  }

  /* Try replacing .js extension with .ts (common in ESM TypeScript) */
  if (importPath.endsWith('.js')) {
    const tsPath = importPath.slice(0, -3) + '.ts'
    const candidate = resolve(sourceDir, tsPath)
    const file = Bun.file(candidate)
    const exists = await file.exists()
    if (exists) {
      return null
    }
  }

  /* Import doesn't resolve — return what we tried */
  return resolve(sourceDir, importPath)
}

/**
 * Re-runs all run_command actions from an agent's execution to capture
 * real stdout/stderr output for the reviewer.
 *
 * @param projectRoot - Absolute project root
 * @param actions - Actions the agent executed
 * @param actionResults - Results from executing those actions
 * @returns Array of command verification results
 */
export async function rerunCommands(
  projectRoot: string,
  actions: Action[],
  actionResults: ActionResult[]
): Promise<CommandVerification[]> {
  const verifications: CommandVerification[] = []

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    if (action.type !== 'run_command' || !action.cmd) continue

    /* Only re-run commands that originally succeeded */
    const result = actionResults[i]
    if (!result || !result.success) continue

    try {
      const cmdResult = await runCommand(projectRoot, action.cmd)
      verifications.push({
        command: action.cmd,
        stdout: cmdResult.stdout.slice(0, 2000), /* cap output size */
        stderr: cmdResult.stderr.slice(0, 2000),
        exitCode: cmdResult.exitCode,
        success: cmdResult.success,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      verifications.push({
        command: action.cmd,
        stdout: '',
        stderr: message,
        exitCode: 1,
        success: false,
      })
    }
  }

  return verifications
}

/**
 * Checks all files created or edited by the agent for broken imports.
 * Parses import statements and verifies each relative path resolves.
 *
 * @param projectRoot - Absolute project root
 * @param actions - Actions the agent executed
 * @returns Object with broken imports list and all added imports list
 */
export async function checkImports(
  projectRoot: string,
  actions: Action[]
): Promise<{ brokenImports: BrokenImport[]; addedImports: string[] }> {
  const brokenImports: BrokenImport[] = []
  const addedImports: string[] = []

  for (const action of actions) {
    if (action.type !== 'create_file' && action.type !== 'edit_file') continue
    if (!action.path || !action.content) continue

    /* Only check code files */
    const ext = extname(action.path).toLowerCase()
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue

    const imports = extractImportPaths(action.content)

    for (const importPath of imports) {
      addedImports.push(`${action.path} → ${importPath}`)

      const resolvedAttempt = await checkImportResolution(
        projectRoot,
        action.path,
        importPath
      )

      if (resolvedAttempt !== null) {
        brokenImports.push({
          filePath: action.path,
          importPath,
          resolvedAttempt,
        })
      }
    }
  }

  return { brokenImports, addedImports }
}

/**
 * Runs the full verification pass: re-runs commands and checks imports.
 *
 * @param projectRoot - Absolute project root
 * @param actions - Actions the agent executed
 * @param actionResults - Results from executing those actions
 * @returns Complete VerificationResult
 */
export async function runVerification(
  projectRoot: string,
  actions: Action[],
  actionResults: ActionResult[]
): Promise<VerificationResult> {
  try {
    const [commandOutputs, importResults] = await Promise.all([
      rerunCommands(projectRoot, actions, actionResults),
      checkImports(projectRoot, actions),
    ])

    return {
      commandOutputs,
      brokenImports: importResults.brokenImports,
      addedImports: importResults.addedImports,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Verification failed: ${message}`)
  }
}

/**
 * Formats verification results into a string for the reviewer prompt.
 *
 * @param result - The verification result to format
 * @returns Formatted string for inclusion in the reviewer prompt
 */
export function formatVerificationForReview(result: VerificationResult): string {
  const parts: string[] = []

  if (result.commandOutputs.length > 0) {
    parts.push('## Command Execution Output')
    for (const cmd of result.commandOutputs) {
      parts.push(`\n### \`${cmd.command}\` (exit: ${cmd.exitCode})`)
      if (cmd.stdout) parts.push(`**stdout:**\n\`\`\`\n${cmd.stdout}\n\`\`\``)
      if (cmd.stderr) parts.push(`**stderr:**\n\`\`\`\n${cmd.stderr}\n\`\`\``)
    }
  }

  if (result.addedImports.length > 0) {
    parts.push('\n## Imports Added')
    for (const imp of result.addedImports) {
      parts.push(`- ${imp}`)
    }
  }

  if (result.brokenImports.length > 0) {
    parts.push('\n## ⚠️ BROKEN IMPORTS DETECTED')
    for (const broken of result.brokenImports) {
      parts.push(`- WARNING: Broken import in ${broken.filePath}: "${broken.importPath}" (file does not exist)`)
    }
  }

  return parts.join('\n')
}
