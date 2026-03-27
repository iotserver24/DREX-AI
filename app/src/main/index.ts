import { BrowserView, Electrobun } from 'electrobun/main'
import { Drex } from 'drex-core'
import { resolve } from 'path'

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
})

app.run()
