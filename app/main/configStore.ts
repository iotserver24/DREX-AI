/**
 * configStore - Handles reading and writing application configuration
 */

import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import type { AppConfig } from '../renderer/lib/types'

const CONFIG_DIR = join(process.env.HOME || process.env.USERPROFILE || '', '.drex')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AppConfig = {
  providers: [],
  activeProviderId: 'openai',
  activeModel: 'gpt-4o',
  maxConcurrentAgents: 3,
  permissionLevel: 'moderate',
  recentProjects: [],
  autoApprovePlans: false,
}

/**
 * Reads the configuration from disk
 */
export async function readConfig(): Promise<AppConfig> {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8')
    const config = JSON.parse(data)
    return { ...DEFAULT_CONFIG, ...config }
  } catch (error) {
    // File doesn't exist or is invalid, return default
    return DEFAULT_CONFIG
  }
}

/**
 * Writes the configuration to disk
 */
export async function writeConfig(config: AppConfig): Promise<void> {
  try {
    // Ensure config directory exists
    await mkdir(CONFIG_DIR, { recursive: true })

    // Write config file
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to write config:', error)
    throw error
  }
}

/**
 * Updates a partial configuration
 */
export async function updateConfig(updates: Partial<AppConfig>): Promise<AppConfig> {
  const current = await readConfig()
  const updated = { ...current, ...updates }
  await writeConfig(updated)
  return updated
}
