/**
 * Grep-based exact search for the DREX context system.
 * Extracts symbol names from task descriptions and searches
 * the codebase for exact matches, returning surrounding context.
 */

import { resolve } from 'path'
import type { SourceFileInfo } from './fileTree.js'

/**
 * Result of a grep search — a matched chunk with surrounding context.
 */
export interface GrepMatch {
  filePath: string
  content: string
  startLine: number
  endLine: number
  matchedSymbol: string
}

/** Maximum lines of context to include around a match. */
const CONTEXT_LINES = 50

/**
 * Extracts likely symbol names (function names, class names, variable names)
 * from a task description string.
 *
 * @param text - Task description or query text
 * @returns Array of unique symbol strings
 */
export function extractSymbols(text: string): string[] {
  const symbols = new Set<string>()

  /* Match camelCase / PascalCase identifiers */
  const camelPattern = /\b[a-zA-Z_$][a-zA-Z0-9_$]{2,}\b/g
  let match: RegExpExecArray | null

  while ((match = camelPattern.exec(text)) !== null) {
    const word = match[0]

    /* Filter out common English words and noise */
    if (!isCommonWord(word) && !isAllLowerShort(word)) {
      symbols.add(word)
    }
  }

  /* Match dotted paths like path.to.module */
  const dottedPattern = /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)+\b/g
  while ((match = dottedPattern.exec(text)) !== null) {
    const parts = match[0].split('.')
    for (const part of parts) {
      if (part.length > 2 && !isCommonWord(part)) {
        symbols.add(part)
      }
    }
  }

  /* Match file paths referenced in text */
  const pathPattern = /(?:src\/|\.\/|\.\.\/)[a-zA-Z0-9_/.-]+\.(?:ts|js|tsx|jsx)/g
  while ((match = pathPattern.exec(text)) !== null) {
    /* Extract the filename without extension as a symbol */
    const pathStr = match[0]
    const basename = pathStr.split('/').pop()?.replace(/\.[^.]+$/, '')
    if (basename && basename.length > 2) {
      symbols.add(basename)
    }
  }

  return [...symbols]
}

/**
 * Checks if a word is a common English word that should be skipped.
 *
 * @param word - Word to check
 * @returns True if it's a common word
 */
function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will',
    'can', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'does',
    'not', 'but', 'all', 'each', 'every', 'any', 'some', 'their', 'them',
    'then', 'than', 'when', 'what', 'which', 'where', 'who', 'how', 'why',
    'into', 'also', 'just', 'only', 'should', 'would', 'could', 'must',
    'use', 'new', 'add', 'get', 'set', 'run', 'file', 'code', 'make',
    'create', 'update', 'delete', 'edit', 'implement', 'function', 'class',
    'type', 'import', 'export', 'return', 'const', 'let', 'var', 'string',
    'number', 'boolean', 'null', 'undefined', 'true', 'false', 'async',
    'await', 'promise', 'void', 'error', 'result', 'data', 'value',
    'array', 'object', 'interface', 'default', 'using', 'test', 'check',
  ])
  return commonWords.has(word.toLowerCase())
}

/**
 * Checks if a word is all lowercase and short (likely a common word).
 *
 * @param word - Word to check
 * @returns True if all lowercase and 4 chars or fewer
 */
function isAllLowerShort(word: string): boolean {
  return word.length <= 4 && word === word.toLowerCase()
}

/**
 * Searches source files for exact symbol matches and returns surrounding context.
 * For each match, returns the enclosing function/class body or ±CONTEXT_LINES.
 *
 * @param projectRoot - Absolute project root path
 * @param symbols - Symbol names to search for
 * @param files - Source files to search in
 * @param maxResults - Maximum number of results to return
 * @returns Array of GrepMatch objects with surrounding context
 */
export async function grepForSymbols(
  projectRoot: string,
  symbols: string[],
  files: SourceFileInfo[],
  maxResults: number = 30
): Promise<GrepMatch[]> {
  if (symbols.length === 0) return []

  const matches: GrepMatch[] = []
  const seen = new Set<string>() /* dedupe key: filePath:startLine */

  for (const fileInfo of files) {
    if (matches.length >= maxResults) break

    try {
      const file = Bun.file(resolve(projectRoot, fileInfo.relativePath))
      const content = await file.text()
      const lines = content.split('\n')

      for (const symbol of symbols) {
        if (matches.length >= maxResults) break

        for (let i = 0; i < lines.length; i++) {
          if (matches.length >= maxResults) break

          if (!lines[i].includes(symbol)) continue

          /* Compute context window */
          const contextStart = Math.max(0, i - Math.floor(CONTEXT_LINES / 2))
          const contextEnd = Math.min(lines.length, contextStart + CONTEXT_LINES)

          const dedupeKey = `${fileInfo.relativePath}:${contextStart}`
          if (seen.has(dedupeKey)) continue
          seen.add(dedupeKey)

          const contextLines = lines.slice(contextStart, contextEnd)

          matches.push({
            filePath: fileInfo.relativePath,
            content: contextLines.join('\n'),
            startLine: contextStart + 1,
            endLine: contextEnd,
            matchedSymbol: symbol,
          })

          /* Skip ahead to avoid overlapping matches in the same file */
          i = contextEnd
        }
      }
    } catch {
      /* skip unreadable files */
    }
  }

  return matches
}
