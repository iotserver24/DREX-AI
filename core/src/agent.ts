import { callLLM, type LLMConfig } from './llm.js'
import { parseLlmOutput } from './parser.js'
import { executeActions, type Action, type ActionResult, type PermissionLevel } from './actions/index.js'
import { readMemory, writeMemoryEntry, type MemoryEntry } from './memory.js'
import { buildContext, type ContextResult } from './context.js'

/**
 * Configuration for a single agent execution.
 */
export interface AgentConfig {
  projectRoot: string
  llmConfig: LLMConfig
  permissionLevel: PermissionLevel
}

/**
 * A task to be executed by an agent.
 */
export interface AgentTask {
  id: string
  description: string
  filesLikelyAffected: string[]
  agentType: 'code' | 'debug' | 'test' | 'refactor'
}

/**
 * Result of a single agent execution.
 */
export interface AgentResult {
  success: boolean
  actionsExecuted: number
  error?: string
  actionResults: (ActionResult & { action: Action })[]
}

/**
 * System prompt template for the agent.
 * Instructs the LLM to respond with valid JSON actions only.
 */
const AGENT_SYSTEM_PROMPT = `You are an expert developer. Complete exactly the task given.
Respond ONLY with a JSON object containing an actions array.
No explanation. No markdown. Valid JSON only.

The actions array must contain objects with the following types:
- { "type": "edit_file", "path": "relative/path", "content": "full new file content" }
- { "type": "create_file", "path": "relative/path", "content": "file content" }
- { "type": "delete_file", "path": "relative/path" }
- { "type": "run_command", "cmd": "command string" }

If no changes are needed, respond with: { "actions": [] }`

/**
 * Formats a ContextResult into a prompt-ready string.
 *
 * @param ctx - The context result from buildContext
 * @returns Formatted context string for the LLM prompt
 */
function formatContextForPrompt(ctx: ContextResult): string {
  const parts: string[] = []

  parts.push('## Project File Tree')
  parts.push(ctx.fileTree)

  if (ctx.chunks.length > 0) {
    parts.push('\n## Relevant Code')
    for (const chunk of ctx.chunks) {
      const sourceTag = chunk.source === 'rag' ? 'semantic' : 'exact match'
      parts.push(`\n### ${chunk.filePath} (L${chunk.startLine}-${chunk.endLine}, ${sourceTag}, score: ${chunk.score.toFixed(2)})`)
      parts.push(`\`\`\`\n${chunk.content}\n\`\`\``)
    }
  }

  return parts.join('\n')
}

/**
 * Builds the user prompt for the agent LLM call.
 *
 * @param task - The task to complete
 * @param contextContent - Pre-built context string with file tree and contents
 * @param memoryEntries - Relevant memory entries
 * @param reviewerFeedback - Optional feedback from a previous review (retry scenario)
 * @returns The assembled user prompt string
 */
function buildUserPrompt(
  task: AgentTask,
  contextContent: string,
  memoryEntries: MemoryEntry[],
  reviewerFeedback?: string
): string {
  const parts: string[] = []

  parts.push(`## Task\n${task.description}`)
  parts.push(`\n## Task Type\n${task.agentType}`)
  parts.push(`\n## Files Likely Affected\n${task.filesLikelyAffected.join(', ') || 'None specified'}`)

  if (memoryEntries.length > 0) {
    parts.push('\n## Previous Work Context')
    for (const entry of memoryEntries) {
      parts.push(`- [${entry.taskId}] ${entry.description}`)
      if (entry.filesChanged.length > 0) {
        parts.push(`  Files changed: ${entry.filesChanged.join(', ')}`)
      }
    }
  }

  parts.push(`\n## Codebase Context\n${contextContent}`)

  if (reviewerFeedback) {
    parts.push(`\n## REVIEWER FEEDBACK (Previous Attempt Failed)\nFix the following issues:\n${reviewerFeedback}`)
  }

  return parts.join('\n')
}

/**
 * Executes a single agent loop: reads memory, builds context, calls the LLM,
 * parses the response, executes actions, and writes memory.
 *
 * @param config - Agent configuration (project root, API key, model, permissions)
 * @param task - The task for this agent to complete
 * @param reviewerFeedback - Optional feedback from a reviewer if this is a retry
 * @returns AgentResult with success status, actions count, and any error
 */
export async function runAgent(
  config: AgentConfig,
  task: AgentTask,
  reviewerFeedback?: string
): Promise<AgentResult> {
  try {
    /* Step 1: Read relevant memory */
    const allMemory = await readMemory(config.projectRoot)
    const relevantMemory = allMemory.filter((entry) =>
      entry.filesChanged.some((file) => task.filesLikelyAffected.includes(file))
    )

    /* Step 2: Build context */
    const contextResult = await buildContext(config.projectRoot, {
      description: task.description,
      filesLikelyAffected: task.filesLikelyAffected,
    })
    const contextContent = formatContextForPrompt(contextResult)

    /* Step 3: Build prompt */
    const userPrompt = buildUserPrompt(task, contextContent, relevantMemory, reviewerFeedback)

    /* Step 4: Call LLM */
    const responseText = await callLLM(
      config.llmConfig,
      [{ role: 'user', content: userPrompt }],
      AGENT_SYSTEM_PROMPT
    )

    /* Step 5: Parse response */
    const parseResult = parseLlmOutput(responseText)
    if (!parseResult.success) {
      return { success: false, actionsExecuted: 0, error: `Parse error: ${parseResult.error}`, actionResults: [] }
    }

    if (parseResult.actions.length === 0) {
      return { success: true, actionsExecuted: 0, actionResults: [] }
    }

    /* Step 6: Execute actions */
    const actionResults = await executeActions(
      parseResult.actions,
      config.projectRoot,
      config.permissionLevel
    )

    const allSucceeded = actionResults.every((result) => result.success)
    const failedResult = actionResults.find((result) => !result.success)

    /* Step 7: Write memory entry */
    const filesChanged = parseResult.actions
      .filter((action): action is Action & { path: string } => action.path !== undefined)
      .map((action) => action.path)

    await writeMemoryEntry(config.projectRoot, {
      taskId: task.id,
      timestamp: Date.now(),
      description: task.description,
      filesChanged: [...new Set(filesChanged)],
      decision: allSucceeded
        ? `Completed task: ${task.description}`
        : `Partially completed task: ${task.description}. Error: ${failedResult?.error ?? 'unknown'}`,
    })

    const combinedResults = actionResults.map((result, idx) => ({
      ...result,
      action: parseResult.actions[idx],
    }))

    return {
      success: allSucceeded,
      actionsExecuted: combinedResults.filter((result) => result.success).length,
      error: failedResult?.error,
      actionResults: combinedResults,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, actionsExecuted: 0, error: `Agent execution failed: ${message}`, actionResults: [] }
  }
}
