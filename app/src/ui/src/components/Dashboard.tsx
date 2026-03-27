import { useState } from 'react'

type Task = {
  id: string
  name: string
  agent: 'code' | 'test' | 'review'
  status: 'running' | 'done' | 'failed' | 'pending'
  progress: number
  duration: string
}

const MOCK_TASKS: Task[] = [
  { id: 't1', name: 'Refactor Auth Module', agent: 'code', status: 'running', progress: 62, duration: '4m 20s' },
  { id: 't2', name: 'Write Unit Tests for API', agent: 'test', status: 'done', progress: 100, duration: '2m 11s' },
  { id: 't3', name: 'Update OpenAPI Spec', agent: 'code', status: 'failed', progress: 38, duration: '1m 05s' },
  { id: 't4', name: 'Review PR #241', agent: 'review', status: 'pending', progress: 0, duration: '—' },
  { id: 't5', name: 'Add JWT Middleware', agent: 'code', status: 'pending', progress: 0, duration: '—' },
]

const MOCK_LOGS = [
  { time: '19:31:02', level: 'INFO', msg: 'Agent started on task: Refactor Auth Module' },
  { time: '19:31:05', level: 'INFO', msg: 'Analyzing codebase context (TF-IDF)...' },
  { time: '19:31:11', level: 'SUCCESS', msg: 'Context retrieved: 18 relevant chunks' },
  { time: '19:31:14', level: 'INFO', msg: 'Calling LLM (GLM-5) for plan generation...' },
  { time: '19:31:22', level: 'SUCCESS', msg: 'Plan ready: 4 tasks queued' },
  { time: '19:32:01', level: 'INFO', msg: 'Executing: create_file → src/auth/service.ts' },
  { time: '19:32:09', level: 'SUCCESS', msg: 'Created: src/auth/service.ts' },
  { time: '19:32:14', level: 'INFO', msg: 'Executing: edit_file → src/auth/controller.ts' },
  { time: '19:33:01', level: 'ERROR', msg: 'Test failed: TokenValidation.spec.ts → Assertion error' },
]

const levelColor: Record<string, string> = {
  INFO: 'var(--info)',
  SUCCESS: 'var(--success)',
  ERROR: 'var(--error)',
  WARN: 'var(--warning)',
}

export default function Dashboard({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const [newTask, setNewTask] = useState('')
  const [showInput, setShowInput] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(71,70,86,0.2)' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px' }}>Agent Dashboard</h1>
          <p style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>DREX-AI Autonomous Coding Engine v1.0.0</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInput(!showInput)}>
          ＋ New Task
        </button>
      </div>

      {/* New task input */}
      {showInput && (
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(71,70,86,0.15)', display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Describe the task for DREX... (e.g. 'Add a logout button to the navbar')"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Run Agent</button>
          <button className="btn btn-ghost" onClick={() => setShowInput(false)}>Cancel</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '16px 24px' }}>
        {[
          { label: 'Tasks Completed', value: '124', icon: '✓', color: 'var(--success)' },
          { label: 'Active Agents', value: '1', icon: '⚡', color: 'var(--primary-light)' },
          { label: 'Avg Review Time', value: '4m 20s', icon: '◷', color: 'var(--info)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 22, color: stat.color }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: Task Queue + Log */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 12, padding: '0 24px 16px', overflow: 'hidden' }}>
        {/* Task Queue */}
        <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(71,70,86,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Task Queue</span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>{MOCK_TASKS.length} tasks</span>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {MOCK_TASKS.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(71,70,86,0.1)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-high)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{task.name}</span>
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)' }}>{task.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--on-surface-muted)', textTransform: 'uppercase' }}>{task.agent}</span>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)', width: 32, textAlign: 'right' }}>{task.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Agent Log */}
        <div style={{ background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(71,70,86,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }} />
            <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--on-surface-muted)' }}>Live Agent Log</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.7 }}>
            {MOCK_LOGS.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: levelColor[log.level] ?? 'var(--on-surface-muted)', flexShrink: 0, width: 52 }}>[{log.level}]</span>
                <span style={{ color: 'var(--on-surface)' }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
