/**
 * configStore — Reads and writes the DREX application configuration.
 * Stores config at <home>/.drex/config.json (outside any project).
 */
import { resolve } from 'path'
import { homedir } from 'os'
import { mkdir } from 'fs/promises'
import type { AppConfig } from '../renderer/lib/types'

const CONFIG_DIR = resolve(homedir(), '.drex')
const CONFIG_PATH = resolve(CONFIG_DIR, 'config.json')

const DEFAULT_CONFIG: AppConfig = {
  providers: [],
  activeProvider: 'openai',
  activeModel: 'gpt-4o',
  maxConcurrentAgents: 3,
  permissionLevel: 'moderate',
  recentProjects: [],
  autoApprovePlans: false,
}

/** Ensures the ~/.drex directory exists. */
async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true })
}

/**
 * Loads the application configuration from disk.
 * Returns default config if the file does not exist.
 */
export async function loadConfig(): Promise<AppConfig> {
  try {
    await ensureConfigDir()
    const file = Bun.file(CONFIG_PATH)
    const exists = await file.exists()
    if (!exists) return { ...DEFAULT_CONFIG }
    const raw = await file.text()
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return { ...DEFAULT_CONFIG, ...parsed }
  } catch (err) {
    console.error('[configStore] Failed to load config:', err)
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * Saves a partial config update to disk, merging with existing config.
 *
 * @param updates - Partial config fields to persist
 */
export async function saveConfig(updates: Partial<AppConfig>): Promise<void> {
  try {
    await ensureConfigDir()
    const current = await loadConfig()
    const merged: AppConfig = { ...current, ...updates }
    await Bun.write(CONFIG_PATH, JSON.stringify(merged, null, 2))
  } catch (err) {
    console.error('[configStore] Failed to save config:', err)
    throw new Error(`Config save failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}
