import { resolve } from 'path'
import { unlink } from 'fs/promises'

/**
 * Result of a delete file action.
 */
export interface DeleteFileResult {
  success: boolean
  error?: string
}

/**
 * Deletes a file from the project directory.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @param filePath - Relative path to the file within the project
 * @returns Result indicating success or failure with error message
 */
export async function deleteFile(
  projectRoot: string,
  filePath: string
): Promise<DeleteFileResult> {
  try {
    const absolutePath = resolve(projectRoot, filePath)

    if (!absolutePath.startsWith(resolve(projectRoot))) {
      return { success: false, error: `Path traversal detected: ${filePath} resolves outside project root` }
    }

    const file = Bun.file(absolutePath)
    const exists = await file.exists()

    if (!exists) {
      return { success: false, error: `File does not exist: ${filePath}` }
    }

    await unlink(absolutePath)

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to delete file ${filePath}: ${message}` }
  }
}
