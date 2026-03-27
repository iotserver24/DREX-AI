import { BrowserView, Electrobun } from 'electrobun/main'
import { Drex } from 'drex-core'
import { resolve, join, relative } from 'path'
import { readdir, readFile, writeFile, stat } from 'fs/promises'

// Initialize DREX Core with user config (will be loaded from settings file)
let drexInstance: ReturnType<typeof createDrex> | null = null

function createDrex(config: { apiKey: string; baseURL: string; model: string }) {
  return new Drex({
    projectRoot: process.cwd(),
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
    permissionLevel: 'moderate',
  })
}

// Main Electrobun app entry point
const app = new Electrobun({
  appName: 'DREX-AI',
})

app.on('ready', () => {
  const mainView = new BrowserView({
    url: resolve(import.meta.dir, '../ui/dist/index.html'),
    width: 1400,
    height: 900,
    title: 'DREX-AI',
    minWidth: 1024,
    minHeight: 700,
  })

  mainView.show()

  // Handle messages from UI via Electrobun RPC
  mainView.on('run-task', async (payload: { intent: string; projectPath: string }) => {
    try {
      if (!drexInstance) {
        mainView.send('error', { message: 'LLM not configured. Please go to Settings.' })
        return
      }

      const drex = drexInstance

      drex.on('plan:ready', (plan) => {
        mainView.send('plan:ready', { planId: plan.id, tasks: plan.tasks })
      })

      drex.on('task:start', (task) => {
        mainView.send('task:start', { task })
      })

      drex.on('task:done', (task, result) => {
        mainView.send('task:done', { task, result })
      })

      drex.on('review:fail', (task, feedback, attempt) => {
        mainView.send('review:fail', { task, feedback, attempt })
      })

      drex.on('done', (summary) => {
        mainView.send('done', { summary })
      })

      drex.on('error', (err) => {
        mainView.send('error', { message: err.message })
      })

      await drex.run(payload.intent, { headless: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      mainView.send('error', { message })
    }
  })

  mainView.on('configure-llm', (config: { apiKey: string; baseURL: string; model: string }) => {
    drexInstance = createDrex(config)
    mainView.send('llm-configured', { success: true, model: config.model })
  })

  // File System RPCs
  mainView.on('read-file', async (payload: { path: string }) => {
    try {
      const content = await readFile(payload.path, 'utf-8')
      mainView.send('file-content', { path: payload.path, content })
    } catch (err) {
      mainView.send('error', { message: `Failed to read file: ${payload.path}` })
    }
  })

  mainView.on('save-file', async (payload: { path: string; content: string }) => {
    try {
      await writeFile(payload.path, payload.content, 'utf-8')
      mainView.send('file-saved', { path: payload.path })
    } catch (err) {
      mainView.send('error', { message: `Failed to save file: ${payload.path}` })
    }
  })

  mainView.on('get-project-tree', async (payload: { root: string }) => {
    try {
      const tree = await buildFileTree(payload.root)
      mainView.send('project-tree', { tree })
    } catch (err) {
      mainView.send('error', { message: 'Failed to build project tree' })
    }
  })
})

async function buildFileTree(dir: string, baseDir: string = dir): Promise<any[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const result = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue

    const fullPath = join(dir, entry.name)
    const relPath = relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      result.push({
        name: entry.name,
        path: fullPath,
        relPath,
        type: 'directory',
        children: await buildFileTree(fullPath, baseDir)
      })
    } else {
      result.push({
        name: entry.name,
        path: fullPath,
        relPath,
        type: 'file'
      })
    }
  }

  return result.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name)
    return a.type === 'directory' ? -1 : 1
  })
}

app.run()
