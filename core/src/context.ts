/**
 * Context system for the DREX autonomous coding engine.
 * Two-layer retrieval: RAG (TF-IDF semantic search) + Grep (exact symbol search).
 * Merges results, deduplicates, and enforces hard limits.
 */

import { resolve } from 'path'
import { chunkFile } from './context/chunker.js'
import { buildFileTree, collectSourceFiles } from './context/fileTree.js'
import {
  buildTfidfIndex,
  loadTfidfIndex,
  saveTfidfIndex,
  searchByEmbedding,
} from './context/tfidf.js'
import { extractSymbols, grepForSymbols } from './context/grep.js'
import type { RawChunk } from './context/chunker.js'

/**
 * A scored chunk of relevant source code.
 */
export interface ContextChunk {
  filePath: string
  content: string
  startLine: number
  endLine: number
  score: number
  source: 'rag' | 'grep'
}

/**
 * Complete context result for an agent task.
 */
export interface ContextResult {
  chunks: ContextChunk[]
  fileTree: string
  totalTokensEstimate: number
}

/**
 * Minimal task interface needed by buildContext.
 */
interface ContextTask {
  description: string
  filesLikelyAffected: string[]
}

/** Default maximum number of chunks to return. */
const DEFAULT_MAX_CHUNKS = 30

/** Default maximum lines per chunk. */
const DEFAULT_MAX_LINES = 50

/** Minimum score threshold — chunks below this are excluded. */
const MIN_SCORE_THRESHOLD = 0.1

/**
 * Estimates token count from text content.
 * Uses ~4 characters per token heuristic.
 *
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Creates a deduplication key for a chunk based on file path and line range.
 *
 * @param filePath - Relative file path
 * @param startLine - Start line number
 * @returns Deduplication key string
 */
function chunkKey(filePath: string, startLine: number): string {
  return `${filePath}:${startLine}`
}

/**
 * Determines which files need reindexing by comparing current mtimes
 * against the stored index mtimes.
 *
 * @param currentMtimes - Current file modification times
 * @param storedMtimes - Previously stored modification times
 * @returns Set of file paths that need reindexing
 */
function getStaleFiles(
  currentMtimes: Record<string, number>,
  storedMtimes: Record<string, number>
): Set<string> {
  const staleFiles = new Set<string>()

  for (const [filePath, mtime] of Object.entries(currentMtimes)) {
    if (storedMtimes[filePath] === undefined || storedMtimes[filePath] < mtime) {
      staleFiles.add(filePath)
    }
  }

  /* Also check for deleted files */
  for (const filePath of Object.keys(storedMtimes)) {
    if (currentMtimes[filePath] === undefined) {
      staleFiles.add(filePath)
    }
  }

  return staleFiles
}

/**
 * Builds scoped context for an agent task using two-layer retrieval.
 * Never returns full files — only relevant chunks.
 *
 * Layer 1 — Semantic Search (RAG): TF-IDF cosine similarity
 * Layer 2 — Exact Search (Grep): symbol extraction + exact matching
 *
 * @param projectRoot - Absolute path to the project root
 * @param task - The task with description and filesLikelyAffected
 * @param options - Optional configuration for chunk limits and reindexing
 * @returns ContextResult with scored chunks, file tree, and token estimate
 */
export async function buildContext(
  projectRoot: string,
  task: ContextTask,
  options?: {
    maxChunks?: number
    maxLinesPerChunk?: number
    reindex?: boolean
  }
): Promise<ContextResult> {
  const maxChunks = options?.maxChunks ?? DEFAULT_MAX_CHUNKS
  const maxLinesPerChunk = options?.maxLinesPerChunk ?? DEFAULT_MAX_LINES
  const forceReindex = options?.reindex ?? false

  const resolvedRoot = resolve(projectRoot)

  try {
    /* Step 1: Build file tree (always included) */
    const fileTree = await buildFileTree(resolvedRoot)

    /* Step 2: Collect source files */
    const sourceFiles = await collectSourceFiles(resolvedRoot)
    const currentMtimes: Record<string, number> = {}
    for (const file of sourceFiles) {
      currentMtimes[file.relativePath] = file.mtime
    }

    /* Step 3: Build or load TF-IDF index */
    let index = forceReindex ? null : await loadTfidfIndex(resolvedRoot)
    let needsFullReindex = forceReindex || index === null

    if (!needsFullReindex && index !== null) {
      const staleFiles = getStaleFiles(currentMtimes, index.fileMtimes)
      if (staleFiles.size > 0) {
        /* Incremental reindex: remove stale entries, add new ones */
        const freshEntries = index.entries.filter(
          (entry) => !staleFiles.has(entry.filePath)
        )

        /* Chunk only the changed files */
        const staleChunks: RawChunk[] = []
        for (const file of sourceFiles) {
          if (staleFiles.has(file.relativePath)) {
            const content = await Bun.file(file.absolutePath).text()
            const chunks = chunkFile(file.relativePath, content, maxLinesPerChunk)
            staleChunks.push(...chunks)
          }
        }

        /* Rebuild full index with merged chunks */
        const allChunks: RawChunk[] = [
          ...freshEntries.map((e) => ({
            filePath: e.filePath,
            content: e.content,
            startLine: e.startLine,
            endLine: e.endLine,
          })),
          ...staleChunks,
        ]

        index = buildTfidfIndex(allChunks, currentMtimes)
        await saveTfidfIndex(resolvedRoot, index)
      }
    }

    if (needsFullReindex) {
      /* Full reindex: chunk all files */
      const allChunks: RawChunk[] = []
      for (const file of sourceFiles) {
        try {
          const content = await Bun.file(file.absolutePath).text()
          const chunks = chunkFile(file.relativePath, content, maxLinesPerChunk)
          allChunks.push(...chunks)
        } catch {
          /* skip unreadable files */
        }
      }

      index = buildTfidfIndex(allChunks, currentMtimes)
      await saveTfidfIndex(resolvedRoot, index)
    }

    /* Step 4: Layer 1 — RAG search */
    if (!index) {
      throw new Error('TF-IDF index is unexpectedly null after build/load')
    }
    const ragResults = searchByEmbedding(task.description, index, maxChunks)
    const seen = new Set<string>()
    const mergedChunks: ContextChunk[] = []

    for (const result of ragResults) {
      const key = chunkKey(result.entry.filePath, result.entry.startLine)

      /* Apply score threshold, but bypass for filesLikelyAffected */
      const isAffectedFile = task.filesLikelyAffected.some(
        (f) => result.entry.filePath === f || result.entry.filePath.endsWith(`/${f}`)
      )

      if (result.score < MIN_SCORE_THRESHOLD && !isAffectedFile) {
        continue
      }

      if (seen.has(key)) continue
      seen.add(key)

      mergedChunks.push({
        filePath: result.entry.filePath,
        content: result.entry.content,
        startLine: result.entry.startLine,
        endLine: result.entry.endLine,
        score: result.score,
        source: 'rag',
      })
    }

    /* Step 5: Layer 2 — Grep search */
    const symbols = extractSymbols(task.description)
    const grepResults = await grepForSymbols(
      resolvedRoot,
      symbols,
      sourceFiles,
      maxChunks
    )

    for (const grepMatch of grepResults) {
      const key = chunkKey(grepMatch.filePath, grepMatch.startLine)
      if (seen.has(key)) continue
      seen.add(key)

      mergedChunks.push({
        filePath: grepMatch.filePath,
        content: grepMatch.content,
        startLine: grepMatch.startLine,
        endLine: grepMatch.endLine,
        score: 0.5, /* grep matches get a fixed relevance score */
        source: 'grep',
      })
    }

    /* Step 6: Sort by score descending and enforce limits */
    mergedChunks.sort((a, b) => b.score - a.score)
    const finalChunks = mergedChunks.slice(0, maxChunks)

    /* Step 7: Estimate total tokens */
    const allContent = finalChunks.map((c) => c.content).join('\n')
    const totalTokensEstimate = estimateTokens(allContent + fileTree)

    return {
      chunks: finalChunks,
      fileTree,
      totalTokensEstimate,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to build context: ${message}`)
  }
}
