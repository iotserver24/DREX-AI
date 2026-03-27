import { callLLM, type LLMConfig } from '../llm.js'

/**
 * Result of a code review performed by the LLM.
 */
export interface ReviewResult {
  pass: boolean
  feedback?: string
}

/** System prompt for the review call. */
const REVIEW_SYSTEM_PROMPT = `You are a code reviewer. Did the agent complete the task correctly?
Check for:
1. Does the code change match the task description?
2. Are there any obvious bugs or issues?
3. Were all parts of the task addressed?

Respond ONLY in JSON: { "pass": boolean, "feedback": "string explaining issues if pass is false" }
If everything looks good, respond: { "pass": true }`

/**
 * Reviews the output of an agent's task execution by sending the original task,
 * file diffs, command output, and import information to the LLM for evaluation.
 *
 * @param config - LLM configuration
 * @param taskDescription - Original task description the agent was given
 * @param actionsSummary - Summary of actions performed (file changes, commands run)
 * @param verificationData - Optional verification data (command output + import check results)
 * @returns ReviewResult indicating pass/fail with optional feedback
 */
export async function reviewTask(
  config: LLMConfig,
  taskDescription: string,
  actionsSummary: string,
  verificationData?: string
): Promise<ReviewResult> {
  try {
    const promptParts = [
      `## Original Task\n${taskDescription}`,
      `\n## Actions Performed\n${actionsSummary}`,
    ]

    if (verificationData) {
      promptParts.push(`\n## Verification Results (Ground Truth)\n${verificationData}`)
    }

    const userPrompt = promptParts.join('\n')

    const responseText = await callLLM(
      config,
      [{ role: 'user', content: userPrompt }],
      REVIEW_SYSTEM_PROMPT
    )

    const rawText = responseText.trim()

    /* Parse the review result JSON */
    let parsed: unknown
    try {
      parsed = JSON.parse(rawText)
    } catch {
      /* Try extracting from code fences */
      const fenceMatch = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/.exec(rawText)
      if (fenceMatch?.[1]) {
        parsed = JSON.parse(fenceMatch[1].trim())
      } else {
        /* Try extracting outermost JSON object */
        const firstBrace = rawText.indexOf('{')
        const lastBrace = rawText.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1))
        } else {
          return { pass: false, feedback: 'Failed to parse reviewer response as JSON' }
        }
      }
    }

    const record = parsed as Record<string, unknown>
    const pass = record['pass'] === true
    const feedback = typeof record['feedback'] === 'string' ? record['feedback'] : undefined

    return { pass, feedback }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { pass: false, feedback: `Review failed with error: ${message}` }
  }
}

/**
 * Builds a summary string of the actions performed by an agent.
 *
 * @param actionResults - Array of action result descriptions
 * @returns Formatted summary string
 */
export function buildActionsSummary(
  actions: Array<{ type: string; path?: string; cmd?: string; success: boolean; error?: string }>
): string {
  if (actions.length === 0) {
    return 'No actions were performed.'
  }

  const parts: string[] = []

  for (const action of actions) {
    const status = action.success ? '✓' : '✗'
    switch (action.type) {
      case 'edit_file':
        parts.push(`${status} Edited: ${action.path ?? 'unknown'}`)
        break
      case 'create_file':
        parts.push(`${status} Created: ${action.path ?? 'unknown'}`)
        break
      case 'delete_file':
        parts.push(`${status} Deleted: ${action.path ?? 'unknown'}`)
        break
      case 'run_command':
        parts.push(`${status} Command: ${action.cmd ?? 'unknown'}`)
        break
      default:
        parts.push(`${status} Unknown action: ${action.type}`)
    }

    if (!action.success && action.error) {
      parts.push(`  Error: ${action.error}`)
    }
  }

  return parts.join('\n')
}
