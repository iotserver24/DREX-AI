/**
 * OpenAI-compatible configuration for LLM calls.
 */
export interface LLMConfig {
  baseURL: string      // e.g. https://api.openai.com/v1
  apiKey: string       // user's API key
  model: string        // e.g. gpt-4o, claude-3-5-sonnet-20240620
  extraBody?: Record<string, any> // optional extra fields to send in the request body
}

/**
 * Message format for chat completions.
 */
export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Executes a chat completion request to an OpenAI-compatible endpoint using fetch.
 * This keeps the core logic agnostic of specific provider SDKs.
 *
 * @param config - LLM configuration (baseURL, apiKey, model)
 * @param messages - Array of chat messages
 * @param system - Optional system prompt (will be prepended if provided)
 * @returns The text content of the completion
 */
export async function callLLM(
  config: LLMConfig,
  messages: Message[],
  system?: string
): Promise<string> {
  const fullMessages = system 
    ? [{ role: 'system', content: system }, ...messages]
    : messages

  try {
    const res = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: fullMessages,
        temperature: 0, // default to 0 for consistency in coding tasks
        ...config.extraBody,
      })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(`LLM call failed (${res.status}): ${JSON.stringify(errorData)}`)
    }

    const data = await res.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error(`Unexpected LLM response format: ${JSON.stringify(data)}`)
    }

    return data.choices[0].message.content
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to call LLM: ${message}`)
  }
}
