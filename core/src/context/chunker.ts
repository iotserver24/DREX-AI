/**
 * File chunking utility for the DREX context system.
 * Splits source files into overlapping chunks for independent scoring.
 */

/** Default number of lines per chunk. */
const DEFAULT_CHUNK_SIZE = 50

/** Default number of overlapping lines between consecutive chunks. */
const DEFAULT_OVERLAP = 10

/**
 * A raw chunk of a source file before scoring.
 */
export interface RawChunk {
  filePath: string
  content: string
  startLine: number
  endLine: number
}

/**
 * Splits a file's content into chunks of a fixed line count with overlap.
 * Each chunk is independently scorable and retrievable.
 *
 * @param filePath - Relative path to the file
 * @param content - Full text content of the file
 * @param chunkSize - Number of lines per chunk (default 50)
 * @param overlap - Number of overlapping lines between chunks (default 10)
 * @returns Array of RawChunk objects
 */
export function chunkFile(
  filePath: string,
  content: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_OVERLAP
): RawChunk[] {
  const lines = content.split('\n')

  if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
    return []
  }

  /* If the file fits in a single chunk, return it as-is */
  if (lines.length <= chunkSize) {
    return [{
      filePath,
      content: lines.join('\n'),
      startLine: 1,
      endLine: lines.length,
    }]
  }

  const chunks: RawChunk[] = []
  const step = chunkSize - overlap
  let start = 0

  while (start < lines.length) {
    const end = Math.min(start + chunkSize, lines.length)
    const chunkLines = lines.slice(start, end)

    chunks.push({
      filePath,
      content: chunkLines.join('\n'),
      startLine: start + 1,
      endLine: end,
    })

    if (end >= lines.length) {
      break
    }

    start += step
  }

  return chunks
}
