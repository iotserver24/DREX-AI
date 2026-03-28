/**
 * drexBridge - Integrates drex-core with the Electrobun app
 */

import { Drex } from 'drex-core'
import type { BrowserView } from 'electrobun/main'

interface DrexConfig {
  projectRoot: string
  apiKey: string
  baseURL: string
  model: string
  permissionLevel: 'safe' | 'moderate' | 'full'
}

/**
 * Creates and configures a DREX instance with event forwarding
 */
export function createDrexInstance(config: DrexConfig, view: BrowserView) {
  const drex = new Drex({
    projectRoot: config.projectRoot,
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
    permissionLevel: config.permissionLevel,
  })

  // Forward all DREX events to the renderer
  drex.on('plan:questions', (questions) => {
    view.send('drex:event', {
      type: 'plan:questions',
      payload: { questions },
    })
  })

  drex.on('plan:ready', (plan) => {
    view.send('drex:event', {
      type: 'plan:ready',
      payload: { plan },
    })
  })

  drex.on('task:start', (task) => {
    view.send('drex:event', {
      type: 'task:start',
      payload: { task },
    })
  })

  drex.on('task:done', (task, result) => {
    view.send('drex:event', {
      type: 'task:done',
      payload: { task, result },
    })
  })

  drex.on('review:fail', (task, feedback, attempt) => {
    view.send('drex:event', {
      type: 'review:fail',
      payload: { task, feedback, attempt },
    })
  })

  drex.on('done', (summary) => {
    view.send('drex:event', {
      type: 'done',
      payload: { summary },
    })
  })

  drex.on('error', (error) => {
    view.send('drex:event', {
      type: 'error',
      payload: { message: error instanceof Error ? error.message : String(error) },
    })
  })

  return drex
}
