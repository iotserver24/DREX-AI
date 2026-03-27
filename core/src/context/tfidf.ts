/**
 * TF-IDF indexing and semantic search for the DREX context system.
 * Computes term-frequency / inverse-document-frequency vectors natively
 * (zero external dependencies). Stores index in .drex/index/tfidf.json.
 */

import { resolve } from 'path'
import { mkdir } from 'fs/promises'
import type { RawChunk } from './chunker.js'

/**
 * A single entry in the TF-IDF index.
 */
export interface TfidfEntry {
  filePath: string
  startLine: number
  endLine: number
  content: string
  tfidfVector: Record<string, number>
}

/**
 * The stored TF-IDF index with file modification timestamps.
 */
export interface TfidfIndex {
  version: number
  createdAt: number
  fileMtimes: Record<string, number>
  entries: TfidfEntry[]
  idf: Record<string, number>
}

/** Current index format version. */
const INDEX_VERSION = 1

/** Path to the stored index relative to project root. */
const INDEX_DIR = '.drex/index'
const INDEX_FILE = 'tfidf.json'

/**
 * Tokenizes text into lowercase word tokens, filtering out noise.
 *
 * @param text - Raw text to tokenize
 * @returns Array of lowercase tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_$]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && token.length < 50)
}

/**
 * Computes term frequency for a list of tokens.
 *
 * @param tokens - Array of tokens
 * @returns Map of token to normalized frequency
 */
function computeTF(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {}

  for (const token of tokens) {
    freq[token] = (freq[token] ?? 0) + 1
  }

  const maxFreq = Math.max(...Object.values(freq), 1)

  const tf: Record<string, number> = {}
  for (const [term, count] of Object.entries(freq)) {
    tf[term] = count / maxFreq
  }

  return tf
}

/**
 * Computes inverse document frequency across all documents.
 *
 * @param documents - Array of token arrays (one per document)
 * @returns Map of term to IDF value
 */
function computeIDF(documents: string[][]): Record<string, number> {
  const docCount = documents.length
  const termDocCounts: Record<string, number> = {}

  for (const tokens of documents) {
    const uniqueTerms = new Set(tokens)
    for (const term of uniqueTerms) {
      termDocCounts[term] = (termDocCounts[term] ?? 0) + 1
    }
  }

  const idf: Record<string, number> = {}
  for (const [term, count] of Object.entries(termDocCounts)) {
    idf[term] = Math.log((docCount + 1) / (count + 1)) + 1
  }

  return idf
}

/**
 * Computes TF-IDF vector for a single document.
 *
 * @param tf - Term frequency map
 * @param idf - Inverse document frequency map
 * @returns TF-IDF vector as a sparse record
 */
function computeTfidfVector(
  tf: Record<string, number>,
  idf: Record<string, number>
): Record<string, number> {
  const vector: Record<string, number> = {}

  for (const [term, tfVal] of Object.entries(tf)) {
    const idfVal = idf[term] ?? 1
    vector[term] = tfVal * idfVal
  }

  return vector
}

/**
 * Computes cosine similarity between two sparse vectors.
 *
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (const [term, valA] of Object.entries(vecA)) {
    normA += valA * valA
    const valB = vecB[term]
    if (valB !== undefined) {
      dotProduct += valA * valB
    }
  }

  for (const valB of Object.values(vecB)) {
    normB += valB * valB
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  if (magnitude === 0) return 0

  return dotProduct / magnitude
}

/**
 * Builds a TF-IDF index from an array of raw chunks.
 *
 * @param chunks - Raw file chunks to index
 * @param fileMtimes - Map of filePath to modification time
 * @returns Complete TfidfIndex ready for storage
 */
export function buildTfidfIndex(
  chunks: RawChunk[],
  fileMtimes: Record<string, number>
): TfidfIndex {
  /* Tokenize all chunks */
  const tokenizedDocs = chunks.map((chunk) => tokenize(chunk.content))

  /* Compute IDF across all documents */
  const idf = computeIDF(tokenizedDocs)

  /* Build entries with TF-IDF vectors */
  const entries: TfidfEntry[] = chunks.map((chunk, i) => {
    const tf = computeTF(tokenizedDocs[i])
    const tfidfVector = computeTfidfVector(tf, idf)

    return {
      filePath: chunk.filePath,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      content: chunk.content,
      tfidfVector,
    }
  })

  return {
    version: INDEX_VERSION,
    createdAt: Date.now(),
    fileMtimes,
    entries,
    idf,
  }
}

/**
 * Saves a TF-IDF index to disk at .drex/index/tfidf.json.
 *
 * @param projectRoot - Absolute project root path
 * @param index - The index to save
 */
export async function saveTfidfIndex(
  projectRoot: string,
  index: TfidfIndex
): Promise<void> {
  try {
    const indexDir = resolve(projectRoot, INDEX_DIR)
    await mkdir(indexDir, { recursive: true })
    const indexPath = resolve(indexDir, INDEX_FILE)
    await Bun.write(indexPath, JSON.stringify(index))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to save TF-IDF index: ${message}`)
  }
}

/**
 * Loads a TF-IDF index from disk. Returns null if not found or invalid.
 *
 * @param projectRoot - Absolute project root path
 * @returns The loaded index, or null
 */
export async function loadTfidfIndex(
  projectRoot: string
): Promise<TfidfIndex | null> {
  try {
    const indexPath = resolve(projectRoot, INDEX_DIR, INDEX_FILE)
    const file = Bun.file(indexPath)
    const exists = await file.exists()

    if (!exists) return null

    const data = JSON.parse(await file.text()) as TfidfIndex

    if (data.version !== INDEX_VERSION || !Array.isArray(data.entries)) {
      return null
    }

    return data
  } catch {
    return null
  }
}

/**
 * Searches the TF-IDF index for chunks most similar to the query.
 *
 * @param query - Search query text
 * @param index - The TF-IDF index to search
 * @param topN - Maximum number of results to return
 * @returns Array of entries with similarity scores, sorted by score descending
 */
export function searchByEmbedding(
  query: string,
  index: TfidfIndex,
  topN: number = 30
): Array<{ entry: TfidfEntry; score: number }> {
  const queryTokens = tokenize(query)
  const queryTf = computeTF(queryTokens)
  const queryVector = computeTfidfVector(queryTf, index.idf)

  const scored = index.entries.map((entry) => ({
    entry,
    score: cosineSimilarity(queryVector, entry.tfidfVector),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, topN)
}
