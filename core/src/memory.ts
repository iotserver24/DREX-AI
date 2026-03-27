import { resolve } from 'path'
import { mkdir } from 'fs/promises'

/**
 * A single memory entry tracking what an agent did.
 */
export interface MemoryEntry {
  taskId: string
  timestamp: number
  description: string
  filesChanged: string[]
  decision: string
}

/** Name of the DREX state directory within the project root. */
const DREX_DIR = '.drex'

/** Filename for the memory JSON storage. */
const MEMORY_FILE = 'memory.json'

/** Filename for the architecture summary. */
const ARCHITECTURE_FILE = 'architecture.md'

/** Filename for the decisions log. */
const DECISIONS_FILE = 'decisions.md'

/**
 * Ensures the .drex directory exists within the project root.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Absolute path to the .drex directory
 */
async function ensureDrexDir(projectRoot: string): Promise<string> {
  const drexPath = resolve(projectRoot, DREX_DIR)
  await mkdir(drexPath, { recursive: true })
  return drexPath
}

/**
 * Reads all memory entries from .drex/memory.json.
 * Returns an empty array if the file doesn't exist.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Array of memory entries
 */
export async function readMemory(projectRoot: string): Promise<MemoryEntry[]> {
  try {
    const memoryPath = resolve(projectRoot, DREX_DIR, MEMORY_FILE)
    const file = Bun.file(memoryPath)
    const exists = await file.exists()

    if (!exists) {
      return []
    }

    const content = await file.text()
    const parsed: unknown = JSON.parse(content)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as MemoryEntry[]
  } catch {
    return []
  }
}

/**
 * Appends a new memory entry to .drex/memory.json.
 *
 * @param projectRoot - Absolute path to the project root
 * @param entry - Memory entry to append
 */
export async function writeMemoryEntry(projectRoot: string, entry: MemoryEntry): Promise<void> {
  const drexPath = await ensureDrexDir(projectRoot)
  const memoryPath = resolve(drexPath, MEMORY_FILE)

  const existing = await readMemory(projectRoot)
  existing.push(entry)

  await Bun.write(memoryPath, JSON.stringify(existing, null, 2))
}

/**
 * Reads the architecture summary from .drex/architecture.md.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Architecture summary content, or empty string if not found
 */
export async function readArchitecture(projectRoot: string): Promise<string> {
  try {
    const archPath = resolve(projectRoot, DREX_DIR, ARCHITECTURE_FILE)
    const file = Bun.file(archPath)
    const exists = await file.exists()

    if (!exists) {
      return ''
    }

    return await file.text()
  } catch {
    return ''
  }
}

/**
 * Writes the architecture summary to .drex/architecture.md.
 * Overwrites the previous summary.
 *
 * @param projectRoot - Absolute path to the project root
 * @param content - New architecture summary content
 */
export async function writeArchitecture(projectRoot: string, content: string): Promise<void> {
  const drexPath = await ensureDrexDir(projectRoot)
  const archPath = resolve(drexPath, ARCHITECTURE_FILE)
  await Bun.write(archPath, content)
}

/**
 * Appends a decision entry to .drex/decisions.md.
 * Decisions are append-only and never overwritten.
 *
 * @param projectRoot - Absolute path to the project root
 * @param decision - Decision text to append
 */
export async function appendDecision(projectRoot: string, decision: string): Promise<void> {
  const drexPath = await ensureDrexDir(projectRoot)
  const decisionPath = resolve(drexPath, DECISIONS_FILE)

  let existing = ''
  try {
    const file = Bun.file(decisionPath)
    const exists = await file.exists()
    if (exists) {
      existing = await file.text()
    }
  } catch {
    /* file doesn't exist yet, start fresh */
  }

  const timestamp = new Date().toISOString()
  const entry = `\n## ${timestamp}\n${decision}\n`
  await Bun.write(decisionPath, existing + entry)
}

/**
 * Filters memory entries to only those relevant to the given files.
 *
 * @param entries - All memory entries
 * @param relevantFiles - Files to filter by
 * @returns Entries that touched any of the relevant files
 */
export function filterRelevantMemory(entries: MemoryEntry[], relevantFiles: string[]): MemoryEntry[] {
  const fileSet = new Set(relevantFiles)
  return entries.filter((entry) =>
    entry.filesChanged.some((file) => fileSet.has(file))
  )
}
