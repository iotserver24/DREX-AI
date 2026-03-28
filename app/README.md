# DREX Desktop Application

The official Electrobun desktop application for DREX (Developer Reasoning and EXecution).

## Tech Stack

- **Desktop Framework**: Electrobun (Bun-native, NOT Electron)
- **UI Framework**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Main Process**: Bun + TypeScript
- **Core Engine**: drex-core (workspace package)

## Features

### 🎨 Glassmorphism Design
Beautiful glass-morphic UI with:
- Deep dark background (#0a0a0f)
- Frosted glass surfaces with backdrop blur
- Electric violet (#7c3aed) and cyan (#06b6d4) accents
- Smooth animations and transitions

### 📂 Project Picker
- Browse and select recent projects
- Native folder picker integration
- Project history with last used timestamps

### ⚙️ Provider Management
- Pre-configured support for 8 major AI providers:
  - OpenAI (GPT-4o, GPT-4-turbo, o1, o3-mini)
  - Anthropic (Claude Opus/Sonnet/Haiku 4.5)
  - Google Gemini (2.0 Flash, 2.5 Pro)
  - DeepSeek (Chat, Coder, Reasoner)
  - Groq (Llama 3.3, Mixtral, Gemma2)
  - xAI Grok (Grok-2, Grok-beta)
  - OpenRouter (Multi-provider routing)
  - Ollama (Local models)
- Add custom providers
- Secure API key storage
- Model switching on-the-fly

### 🚀 Run Screen
Multi-state execution interface:
1. **IDLE**: Large intent input
2. **PLANNING**: Answer clarifying questions
3. **AWAITING_APPROVAL**: Review plan before execution
4. **EXECUTING**: Real-time log streaming
5. **DONE**: Execution summary with stats

Three-panel layout:
- Left: Task checklist with status indicators
- Center: Main interaction area (intent input, logs, summary)
- Right: Selected task details

## Project Structure

```
app/
├── main/                    # Electrobun main process
│   ├── index.ts            # Entry point, window setup, RPC handlers
│   ├── drexBridge.ts       # drex-core integration + event forwarding
│   └── configStore.ts      # Config persistence (~/.drex/config.json)
├── renderer/               # Next.js app
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Redirects to /projects
│   │   ├── projects/page.tsx
│   │   ├── run/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/            # Glass primitives
│   │   ├── layout/        # Sidebar, TopBar, AppShell
│   │   ├── projects/      # ProjectCard, FolderPicker
│   │   ├── run/           # IntentInput, PlanChecklist, LogStream, etc.
│   │   └── settings/      # ProviderManager, ProviderRow
│   ├── store/             # Zustand stores
│   │   ├── providerStore.ts
│   │   ├── projectStore.ts
│   │   └── sessionStore.ts
│   └── lib/
│       ├── types.ts       # Shared TypeScript types
│       ├── providers.ts   # Default provider configs
│       └── rpc.ts         # Typed Electrobun RPC helpers
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## Development

```bash
# Install dependencies
bun install

# Build drex-core first
cd ../core
bun run build
cd ../app

# Run in development mode
bun run dev

# Build for production
bun run build

# Start production build
bun run start
```

## Configuration

Config stored at: `~/.drex/config.json`

```json
{
  "providers": [...],
  "activeProviderId": "openai",
  "activeModel": "gpt-4o",
  "maxConcurrentAgents": 3,
  "permissionLevel": "moderate",
  "recentProjects": [...],
  "autoApprovePlans": false
}
```

## Design System

### Glass Card
```tsx
<GlassCard hover active className="p-6">
  Content
</GlassCard>
```

### Glass Button
```tsx
<GlassButton variant="primary" size="lg" onClick={...}>
  Click Me
</GlassButton>
```

### Glass Input
```tsx
<GlassInput
  value={text}
  onChange={setText}
  placeholder="Enter text..."
  multiline
  rows={4}
/>
```

### Glass Badge
```tsx
<GlassBadge variant="success" pulse>
  RUNNING
</GlassBadge>
```

### Glass Modal
```tsx
<GlassModal
  isOpen={open}
  onClose={close}
  title="Modal Title"
  footer={<Buttons />}
>
  Modal content
</GlassModal>
```

## RPC Methods

Main process exposes these RPC methods:

- `config:get` - Load app config
- `config:save` - Save app config
- `folder:pick` - Open native folder picker
- `drex:plan` - Create execution plan
- `drex:answerQuestions` - Answer planning questions
- `drex:approve` - Approve and execute plan
- `drex:run` - One-shot execution

Events sent to renderer:
- `drex:event` with types:
  - `plan:questions`
  - `plan:ready`
  - `task:start`
  - `task:done`
  - `review:fail`
  - `done`
  - `error`

## License

MIT
