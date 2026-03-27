# DREX Core

Autonomous multi-agent AI coding engine built for Bun.

DREX Core is the engine behind DREX, providing high-performance context retrieval, action execution with safety layers, and automated code review with execution verification.

## Features

- **Model Agnostic**: OpenAI-compatible LLM layer using native `fetch`.
- **Hybrid Context Retrieval**: Semantic RAG (TF-IDF) combined with exact symbol matching (Grep).
- **Execution Verification**: Automatically validates agent actions by re-running commands and checking imports.
- **Priority Task Queue**: Manages complex dependencies between coding tasks.
- **Safety First**: Path traversal protection and blocked command patterns.

## Installation

```bash
bun add drex-core
```

## Usage

```typescript
import { Drex } from 'drex-core'

const drex = new Drex({
  projectRoot: '/path/to/your/project',
  apiKey: 'your-api-key',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o',
})

// Run a task headlessly
const summary = await drex.run('Add a logout button to the navbar', {
  headless: true
})

console.log(`Task completed: ${summary.tasksDone}/${summary.tasksTotal}`)
```

## Advanced Configuration

You can pass provider-specific parameters using `extraBody`:

```typescript
const drex = new Drex({
  // ...
  extraBody: {
    thinking: { type: 'enabled' },
    max_tokens: 4096
  }
})
```

## License

MIT
