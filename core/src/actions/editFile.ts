import { resolve } from 'path'

/**
 * Result of an edit file action.
 */
export interface EditFileResult {
  success: boolean
  error?: string
}

/**
 * Edits an existing file by replacing its entire content.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @param filePath - Relative path to the file within the project
 * @param content - New content to write to the file
 * @returns Result indicating success or failure with error message
 */
export async function editFile(
  projectRoot: string,
  filePath: string,
  content: string
): Promise<EditFileResult> {
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

    await Bun.write(absolutePath, content)

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to edit file ${filePath}: ${message}` }
  }
}
