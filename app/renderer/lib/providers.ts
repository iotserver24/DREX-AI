/**
 * Default LLM provider definitions shipped with DREX.
 * These are always shown in settings and cannot be deleted.
 */
import type { Provider } from './types'

/** All default providers bundled with DREX. */
export const DEFAULT_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    logo: '🟢',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o3-mini'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    logo: '🟤',
    models: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    logo: '🔵',
    models: ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    logo: '🔷',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    logo: '⚡',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    baseURL: 'https://api.x.ai/v1',
    logo: '✖️',
    models: ['grok-2', 'grok-2-mini', 'grok-beta'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    logo: '🔀',
    models: ['auto', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-pro'],
    isDefault: true,
    isActive: true,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    baseURL: 'http://localhost:11434/v1',
    logo: '🦙',
    models: ['llama3', 'codellama', 'mistral', 'deepseek-coder'],
    isDefault: true,
    isActive: true,
  },
]
