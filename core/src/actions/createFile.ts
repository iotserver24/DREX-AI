import { resolve, dirname } from 'path'
import { mkdir } from 'fs/promises'

/**
 * Result of a create file action.
 */
export interface CreateFileResult {
  success: boolean
  error?: string
}

/**
 * Creates a new file with the given content, creating intermediate directories as needed.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @param filePath - Relative path to the file within the project
 * @param content - Content to write to the new file
 * @returns Result indicating success or failure with error message
 */
export async function createFile(
  projectRoot: string,
  filePath: string,
  content: string
): Promise<CreateFileResult> {
  try {
    const absolutePath = resolve(projectRoot, filePath)

    if (!absolutePath.startsWith(resolve(projectRoot))) {
      return { success: false, error: `Path traversal detected: ${filePath} resolves outside project root` }
    }

    const dir = dirname(absolutePath)
    await mkdir(dir, { recursive: true })

    await Bun.write(absolutePath, content)

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to create file ${filePath}: ${message}` }
  }
}
