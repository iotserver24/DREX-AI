/**
 * File tree builder and source file collector for the DREX context system.
 * Produces a formatted directory tree and collects indexable source files.
 */

import { resolve, relative, extname } from 'path'
import { readdir, stat } from 'fs/promises'

/** Directories to always skip when scanning. */
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.drex', 'dist', '.next', '__pycache__', '.cache',
])

/** Binary file extensions to skip. */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.exe', '.dll', '.so', '.dylib', '.o',
  '.lock', '.sqlite', '.db',
])

/** Maximum file size in bytes to include (200KB). */
const MAX_FILE_SIZE = 200 * 1024

/**
 * Information about a single source file for indexing.
 */
export interface SourceFileInfo {
  relativePath: string
  absolutePath: string
  mtime: number
  size: number
}

/**
 * Checks whether a file should be skipped based on its extension.
 *
 * @param filename - Name of the file to check
 * @returns True if the file has a binary extension
 */
function isBinaryFile(filename: string): boolean {
  return BINARY_EXTENSIONS.has(extname(filename).toLowerCase())
}

/**
 * Recursively builds a formatted file tree string.
 * Skips ignored directories and binary files.
 *
 * @param dirPath - Absolute directory path to scan
 * @param projectRoot - Absolute project root for relative paths
 * @param indent - Current indentation string
 * @returns Formatted tree string
 */
async function buildTreeRecursive(
  dirPath: string,
  projectRoot: string,
  indent: string = ''
): Promise<string> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    const sorted = entries.sort((a, b) => {
      /* Directories first, then alphabetical */
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })

    const parts: string[] = []

    for (const entry of sorted) {
      if (SKIP_DIRS.has(entry.name)) {
        continue
      }

      if (entry.isDirectory()) {
        parts.push(`${indent}${entry.name}/`)
        const subTree = await buildTreeRecursive(
          resolve(dirPath, entry.name),
          projectRoot,
          indent + '  '
        )
        if (subTree) {
          parts.push(subTree)
        }
      } else if (entry.isFile() && !isBinaryFile(entry.name)) {
        parts.push(`${indent}${entry.name}`)
      }
    }

    return parts.join('\n')
  } catch {
    return ''
  }
}

/**
 * Builds a formatted file tree string for the project.
 * Skips node_modules, .git, .drex, binary files, etc.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Formatted tree string
 */
export async function buildFileTree(projectRoot: string): Promise<string> {
  const resolvedRoot = resolve(projectRoot)
  return buildTreeRecursive(resolvedRoot, resolvedRoot)
}

/**
 * Collects all indexable source files from the project.
 * Skips ignored directories, binary files, and files over 200KB.
 *
 * @param projectRoot - Absolute path to the project root
 * @returns Array of SourceFileInfo objects
 */
export async function collectSourceFiles(projectRoot: string): Promise<SourceFileInfo[]> {
  const resolvedRoot = resolve(projectRoot)
  const files: SourceFileInfo[] = []

  async function walk(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) {
          continue
        }

        const fullPath = resolve(dirPath, entry.name)

        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.isFile() && !isBinaryFile(entry.name)) {
          try {
            const fileStat = await stat(fullPath)
            if (fileStat.size <= MAX_FILE_SIZE) {
              files.push({
                relativePath: relative(resolvedRoot, fullPath),
                absolutePath: fullPath,
                mtime: fileStat.mtimeMs,
                size: fileStat.size,
              })
            }
          } catch {
            /* skip unreadable files */
          }
        }
      }
    } catch {
      /* skip unreadable directories */
    }
  }

  await walk(resolvedRoot)
  return files
}
