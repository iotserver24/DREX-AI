/**
 * main/index.ts — Electrobun main process entry point for the DREX desktop app.
 * Sets up the BrowserView window and registers all RPC handlers.
 */
import { BrowserView, Electrobun } from 'electrobun/main'
import { resolve } from 'path'
import { DrexBridge } from './drexBridge'
import { loadConfig, saveConfig } from './configStore'
import type { AppConfig, Answer, DrexEvent } from '../renderer/lib/types'

const app = new Electrobun({ appName: 'DREX' })

app.on('ready', async () => {
  // ─── Create main window ───────────────────────────────────────────────────
  const mainView = new BrowserView({
    url: resolve(import.meta.dir, '../renderer/.next/index.html'),
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'DREX',
    transparent: true,
  })

  mainView.show()

  // ─── Load initial config ──────────────────────────────────────────────────
  let appConfig: AppConfig = await loadConfig()

  // ─── DrexBridge instance ──────────────────────────────────────────────────
  const bridge = new DrexBridge((event: DrexEvent) => {
    mainView.send('drex:event', event)
  })

  // ─── Helper: get active provider LLM config ───────────────────────────────
  function getActiveLLMConfig() {
    const provider = appConfig.providers.find((p) => p.id === appConfig.activeProvider)
    if (!provider || !provider.apiKey) {
      throw new Error('No active provider with API key configured. Please go to Settings.')
    }
    return {
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
      model: appConfig.activeModel,
      maxConcurrentAgents: appConfig.maxConcurrentAgents,
    }
  }

  // ─── RPC: config:get ──────────────────────────────────────────────────────
  mainView.on('config:get', async () => {
    try {
      appConfig = await loadConfig()
      mainView.send('config:get:reply', appConfig)
    } catch (err) {
      mainView.send('error', { message: `Failed to load config: ${err instanceof Error ? err.message : String(err)}` })
    }
  })

  // ─── RPC: config:save ─────────────────────────────────────────────────────
  mainView.on('config:save', async (updates: Partial<AppConfig>) => {
    try {
      await saveConfig(updates)
      appConfig = await loadConfig()
      mainView.send('config:save:reply', { success: true })
    } catch (err) {
      mainView.send('error', { message: `Failed to save config: ${err instanceof Error ? err.message : String(err)}` })
    }
  })

  // ─── RPC: folder:pick ─────────────────────────────────────────────────────
  mainView.on('folder:pick', async () => {
    try {
      // Electrobun native dialog — returns path or null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dialog = (Electrobun as any).dialog ?? null
      let selectedPath: string | null = null
      if (dialog && typeof dialog.showOpenDialog === 'function') {
        const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
        selectedPath = result?.filePaths?.[0] ?? null
      }
      mainView.send('folder:pick:reply', selectedPath)
    } catch (err) {
      mainView.send('folder:pick:reply', null)
    }
  })

  // ─── RPC: drex:plan ───────────────────────────────────────────────────────
  mainView.on('drex:plan', async (payload: { intent: string; projectRoot: string }) => {
    try {
      const llmConfig = getActiveLLMConfig()
      await bridge.plan(payload.intent, payload.projectRoot, llmConfig)
    } catch (err) {
      mainView.send('drex:event', {
        type: 'error',
        payload: { message: err instanceof Error ? err.message : String(err) },
      } satisfies DrexEvent)
    }
  })

  // ─── RPC: drex:answerQuestions ────────────────────────────────────────────
  mainView.on('drex:answerQuestions', async (payload: { planId: string; answers: Answer[] }) => {
    try {
      await bridge.answerQuestions(payload.planId, payload.answers)
    } catch (err) {
      mainView.send('drex:event', {
        type: 'error',
        payload: { message: err instanceof Error ? err.message : String(err) },
      } satisfies DrexEvent)
    }
  })

  // ─── RPC: drex:approve ────────────────────────────────────────────────────
  mainView.on('drex:approve', async (payload: { planId: string }) => {
    try {
      await bridge.approve(payload.planId)
    } catch (err) {
      mainView.send('drex:event', {
        type: 'error',
        payload: { message: err instanceof Error ? err.message : String(err) },
      } satisfies DrexEvent)
    }
  })

  // ─── RPC: drex:run ────────────────────────────────────────────────────────
  mainView.on('drex:run', async (payload: { intent: string; projectRoot: string; options?: { headless?: boolean; dryRun?: boolean } }) => {
    try {
      const llmConfig = getActiveLLMConfig()
      await bridge.run(payload.intent, payload.projectRoot, llmConfig, payload.options)
    } catch (err) {
      mainView.send('drex:event', {
        type: 'error',
        payload: { message: err instanceof Error ? err.message : String(err) },
      } satisfies DrexEvent)
    }
  })

  // ─── RPC: drex:cancel ─────────────────────────────────────────────────────
  mainView.on('drex:cancel', () => {
    bridge.cancel()
  })
})

app.run()
