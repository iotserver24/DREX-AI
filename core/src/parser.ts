import type { Action } from './actions/index.js'

/**
 * Result of parsing LLM output into structured actions.
 */
export interface ParseResult {
  success: boolean
  actions: Action[]
  error?: string
}

/**
 * Attempts to extract a JSON object from raw LLM text output.
 * Handles clean JSON, JSON inside markdown code fences, and JSON surrounded by text.
 *
 * @param raw - Raw text output from the LLM
 * @returns The parsed JSON object, or null if extraction fails
 */
function extractJson(raw: string): unknown {
  const trimmed = raw.trim()

  /* Attempt 1: raw string is already valid JSON */
  try {
    return JSON.parse(trimmed)
  } catch {
    /* fall through to next strategy */
  }

  /* Attempt 2: JSON inside markdown code fences (```json ... ``` or ``` ... ```) */
  const fencePattern = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/
  const fenceMatch = fencePattern.exec(trimmed)
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {
      /* fall through */
    }
  }

  /* Attempt 3: find first { and last } — extract the outermost JSON object */
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1)
    try {
      return JSON.parse(candidate)
    } catch {
      /* fall through */
    }
  }

  /* Attempt 4: find first [ and last ] — extract the outermost JSON array */
  const firstBracket = trimmed.indexOf('[')
  const lastBracket = trimmed.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.slice(firstBracket, lastBracket + 1)
    try {
      return JSON.parse(candidate)
    } catch {
      /* fall through */
    }
  }

  return null
}

/** Valid action type strings. */
const VALID_ACTION_TYPES = new Set<string>([
  'edit_file',
  'create_file',
  'delete_file',
  'run_command',
])

/**
 * Validates that a parsed action has the correct shape and required fields.
 *
 * @param action - The parsed action object to validate
 * @param index - Index of the action in the array (for error messages)
 * @returns Error message if invalid, null if valid
 */
function validateAction(action: unknown, index: number): string | null {
  if (typeof action !== 'object' || action === null) {
    return `Action at index ${index} is not an object`
  }

  const record = action as Record<string, unknown>

  if (typeof record['type'] !== 'string') {
    return `Action at index ${index} is missing "type" field`
  }

  if (!VALID_ACTION_TYPES.has(record['type'])) {
    return `Action at index ${index} has invalid type: "${record['type']}"`
  }

  const actionType = record['type'] as Action['type']

  switch (actionType) {
    case 'edit_file':
    case 'create_file': {
      if (typeof record['path'] !== 'string') {
        return `Action at index ${index} (${actionType}) is missing "path" field`
      }
      if (typeof record['content'] !== 'string') {
        return `Action at index ${index} (${actionType}) is missing "content" field`
      }
      break
    }
    case 'delete_file': {
      if (typeof record['path'] !== 'string') {
        return `Action at index ${index} (delete_file) is missing "path" field`
      }
      break
    }
    case 'run_command': {
      if (typeof record['cmd'] !== 'string') {
        return `Action at index ${index} (run_command) is missing "cmd" field`
      }
      break
    }
  }

  return null
}

/**
 * Parses raw LLM output text into a validated array of Action objects.
 * Handles various LLM output formats: clean JSON, markdown-wrapped JSON,
 * and JSON embedded in surrounding text.
 *
 * @param rawOutput - Raw text output from the LLM
 * @returns ParseResult with the actions array or an error message
 */
export function parseLlmOutput(rawOutput: string): ParseResult {
  if (!rawOutput.trim()) {
    return { success: false, actions: [], error: 'Empty LLM output' }
  }

  const parsed = extractJson(rawOutput)

  if (parsed === null) {
    return { success: false, actions: [], error: 'Failed to extract JSON from LLM output' }
  }

  /* Handle { actions: [...] } wrapper */
  let actionsArray: unknown[]

  if (Array.isArray(parsed)) {
    actionsArray = parsed
  } else if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as Record<string, unknown>
    if (Array.isArray(record['actions'])) {
      actionsArray = record['actions']
    } else {
      return { success: false, actions: [], error: 'Parsed JSON does not contain an "actions" array' }
    }
  } else {
    return { success: false, actions: [], error: 'Parsed JSON is not an object or array' }
  }

  if (actionsArray.length === 0) {
    return { success: true, actions: [] }
  }

  /* Validate each action */
  const validatedActions: Action[] = []

  for (let index = 0; index < actionsArray.length; index++) {
    const validationError = validateAction(actionsArray[index], index)
    if (validationError) {
      return { success: false, actions: [], error: validationError }
    }

    const raw = actionsArray[index] as Record<string, unknown>
    validatedActions.push({
      type: raw['type'] as Action['type'],
      path: typeof raw['path'] === 'string' ? raw['path'] : undefined,
      content: typeof raw['content'] === 'string' ? raw['content'] : undefined,
      cmd: typeof raw['cmd'] === 'string' ? raw['cmd'] : undefined,
    })
  }

  return { success: true, actions: validatedActions }
}
