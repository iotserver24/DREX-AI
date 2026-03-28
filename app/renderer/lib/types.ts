/**
 * Shared TypeScript types for DREX Desktop Application
 */

// ============================================================================
// Provider & Model Types
// ============================================================================

export interface Provider {
  id: string
  name: string
  baseURL: string
  logo: string
  models: string[]
  apiKey?: string
  isActive?: boolean
  isCustom?: boolean
}

export interface Model {
  name: string
  providerId: string
  contextWindow?: number
}

// ============================================================================
// Project Types
// ============================================================================

export interface RecentProject {
  path: string
  name: string
  lastUsed: number
  taskCount?: number
}

// ============================================================================
// DREX Core Types (matching drex-core interfaces)
// ============================================================================

export type OrchestratorState =
  | 'IDLE'
  | 'PLANNING'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'DONE'
  | 'FAILED'

export interface Question {
  id: string
  question: string
  answer?: string
}

export interface Task {
  id: string
  description: string
  agentType: string
  filesLikelyAffected: string[]
  status: 'pending' | 'running' | 'done' | 'failed' | 'escalated'
  retryCount?: number
  reviewFeedback?: string
  actions?: TaskAction[]
  llmOutput?: string
}

export interface TaskAction {
  type: 'edit_file' | 'run_command' | 'read_file' | 'create_file'
  target: string
  details?: string
}

export interface Plan {
  id: string
  tasks: Task[]
  createdAt: number
}

export interface Summary {
  totalTasks: number
  doneTasks: number
  failedTasks: number
  escalatedTasks: number
  duration: number
  errors: string[]
}

// ============================================================================
// Log & Event Types
// ============================================================================

export type LogType =
  | 'task:start'
  | 'task:done'
  | 'review:fail'
  | 'command'
  | 'error'
  | 'info'

export interface LogEntry {
  id: string
  timestamp: number
  type: LogType
  message: string
  taskId?: string
  details?: unknown
}

export interface DrexEvent {
  type: 'plan:questions' | 'plan:ready' | 'task:start' | 'task:done' | 'review:fail' | 'done' | 'error'
  payload: unknown
}

// ============================================================================
// Config Types
// ============================================================================

export type PermissionLevel = 'safe' | 'moderate' | 'full'

export interface AppConfig {
  providers: Provider[]
  activeProviderId: string
  activeModel: string
  maxConcurrentAgents: number
  permissionLevel: PermissionLevel
  recentProjects: RecentProject[]
  autoApprovePlans?: boolean
}

// ============================================================================
// RPC Types
// ============================================================================

export interface RPCPlanRequest {
  intent: string
  projectRoot: string
}

export interface RPCAnswerQuestionsRequest {
  planId: string
  answers: Record<string, string>
}

export interface RPCApproveRequest {
  planId: string
}

export interface RPCRunRequest {
  intent: string
  projectRoot: string
  options?: {
    headless?: boolean
    autoApprove?: boolean
  }
}

export interface RPCFolderPickResult {
  path: string
  cancelled: boolean
}
