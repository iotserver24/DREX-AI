/**
 * Main process entry point for DREX Desktop Application
 */

import { Electrobun, BrowserView } from 'electrobun/main'
import { resolve } from 'path'
import { readConfig, writeConfig } from './configStore'
import { createDrexInstance } from './drexBridge'
import type { AppConfig, RPCPlanRequest, RPCAnswerQuestionsRequest, RPCApproveRequest, RPCRunRequest } from '../renderer/lib/types'

// Track active DREX instance
let drexInstance: ReturnType<typeof createDrexInstance> | null = null

/**
 * Main Electrobun application
 */
const app = new Electrobun({
  appName: 'DREX',
})

app.on('ready', () => {
  // Create the main window
  const mainView = new BrowserView({
    url: resolve(import.meta.dir, '../renderer/.next/index.html'),
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'DREX - Developer Reasoning and EXecution',
    titleBarStyle: 'hidden',
    transparent: true,
  })

  mainView.show()

  // ============================================================================
  // RPC Handlers
  // ============================================================================

  /**
   * Get application config
   */
  mainView.on('config:get', async () => {
    try {
      const config = await readConfig()
      return config
    } catch (error) {
      console.error('Failed to read config:', error)
      throw error
    }
  })

  /**
   * Save application config
   */
  mainView.on('config:save', async (config: AppConfig) => {
    try {
      await writeConfig(config)
      return { success: true }
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  })

  /**
   * Open folder picker dialog
   */
  mainView.on('folder:pick', async () => {
    try {
      // TODO: Implement native folder picker using Electrobun APIs
      // For now, return a mock response
      return {
        path: '/tmp/mock-project',
        cancelled: false,
      }
    } catch (error) {
      console.error('Failed to pick folder:', error)
      return {
        path: '',
        cancelled: true,
      }
    }
  })

  /**
   * Create a plan with DREX
   */
  mainView.on('drex:plan', async (request: RPCPlanRequest) => {
    try {
      const config = await readConfig()

      // Get active provider configuration
      const provider = config.providers.find((p) => p.id === config.activeProviderId)
      if (!provider || !provider.apiKey) {
        throw new Error('No active provider configured. Please add an API key in Settings.')
      }

      // Create DREX instance if not exists
      if (!drexInstance) {
        drexInstance = createDrexInstance(
          {
            projectRoot: request.projectRoot,
            apiKey: provider.apiKey,
            baseURL: provider.baseURL,
            model: config.activeModel,
            permissionLevel: config.permissionLevel,
          },
          mainView
        )
      }

      // Start planning
      const planId = await drexInstance.plan(request.intent)

      return { planId }
    } catch (error) {
      console.error('Failed to create plan:', error)
      throw error
    }
  })

  /**
   * Answer planning questions
   */
  mainView.on('drex:answerQuestions', async (request: RPCAnswerQuestionsRequest) => {
    try {
      if (!drexInstance) {
        throw new Error('DREX instance not initialized')
      }

      await drexInstance.answerQuestions(request.planId, request.answers)
      return { success: true }
    } catch (error) {
      console.error('Failed to answer questions:', error)
      throw error
    }
  })

  /**
   * Approve and execute a plan
   */
  mainView.on('drex:approve', async (request: RPCApproveRequest) => {
    try {
      if (!drexInstance) {
        throw new Error('DREX instance not initialized')
      }

      await drexInstance.approve(request.planId)
      return { success: true }
    } catch (error) {
      console.error('Failed to approve plan:', error)
      throw error
    }
  })

  /**
   * Run DREX with an intent (one-shot)
   */
  mainView.on('drex:run', async (request: RPCRunRequest) => {
    try {
      const config = await readConfig()

      // Get active provider configuration
      const provider = config.providers.find((p) => p.id === config.activeProviderId)
      if (!provider || !provider.apiKey) {
        throw new Error('No active provider configured. Please add an API key in Settings.')
      }

      // Create DREX instance
      drexInstance = createDrexInstance(
        {
          projectRoot: request.projectRoot,
          apiKey: provider.apiKey,
          baseURL: provider.baseURL,
          model: config.activeModel,
          permissionLevel: config.permissionLevel,
        },
        mainView
      )

      // Run DREX
      await drexInstance.run(request.intent, request.options || {})

      return { success: true }
    } catch (error) {
      console.error('Failed to run DREX:', error)
      throw error
    }
  })

  // Handle window close
  mainView.on('close', () => {
    drexInstance = null
    app.quit()
  })
})

// Start the application
app.run()
