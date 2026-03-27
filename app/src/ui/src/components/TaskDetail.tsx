const ACTIONS = [
  { type: 'create_file', file: 'src/auth/service.ts', status: 'success' },
  { type: 'edit_file', file: 'src/auth/controller.ts', status: 'success' },
  { type: 'run_command', file: 'bun test src/auth', status: 'failed' },
]

const LOG_LINES = [
  { time: '19:31:02', level: 'INFO', msg: 'Analyzing AST for potential side effects...' },
  { time: '19:32:09', level: 'SUCCESS', msg: 'Migration manifest generated successfully.' },
  { time: '19:33:01', level: 'ERROR', msg: 'Token validation failed in test suite.' },
  { time: '19:33:05', level: 'WARN', msg: 'High latency detected in us-east-1 region.' },
  { time: '19:33:12', level: 'INFO', msg: 'Waiting for next event...' },
]

const levelColor: Record<string, string> = {
  INFO: 'var(--info)', SUCCESS: 'var(--success)',
  ERROR: 'var(--error)', WARN: 'var(--warning)',
}

export default function TaskDetail({ taskId, onBack }: { taskId: string | null; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(71,70,86,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={onBack}>← Back</button>
          <span style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>Dashboard › Task Queue ›</span>
          <span style={{ fontSize: 12, color: 'var(--on-surface)' }}>Refactor Auth Module</span>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px', marginTop: 8 }}>Task Detail</h1>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        <div style={{ overflow: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Metadata card */}
          <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Refactor Auth Module</h2>
              <span className="badge badge-running">● RUNNING</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '8px 24px', fontSize: 12 }}>
              {[
                ['Agent', 'code'],
                ['Created', '19:20:12'],
                ['Duration', '4m 20s'],
                ['Dependencies', 'PR-2940, auth-service'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: 'var(--on-surface-muted)', marginBottom: 2, textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ fontFamily: k === 'Dependencies' ? 'var(--font-mono)' : undefined, fontSize: 12.5 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(71,70,86,0.2)', fontSize: 13, fontWeight: 600 }}>Agent Actions Taken</div>
            {ACTIONS.map((a, i) => (
              <div key={i} style={{ padding: '11px 16px', borderBottom: '1px solid rgba(71,70,86,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600,
                  background: 'var(--surface-highest)', color: 'var(--primary-light)', fontFamily: 'var(--font-mono)',
                }}>{a.type}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, flex: 1, color: 'var(--on-surface-muted)' }}>{a.file}</span>
                <span style={{ fontSize: 13, color: a.status === 'success' ? 'var(--success)' : 'var(--error)' }}>
                  {a.status === 'success' ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Reviewer Feedback */}
        <div style={{ background: 'var(--surface-low)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '1px solid rgba(71,70,86,0.2)', overflow: 'auto' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Reviewer Feedback</div>
          <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="badge badge-failed">Needs Revision</span>
              <span style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>Attempt 1/3</span>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--on-surface-muted)' }}>
              The authentication logic lacks proper token expiration handling in the new service layer.
              Please verify the JWT middleware integration and ensure proper error handling.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>⟳ Retry Task</button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Force Approve</button>
          </div>
        </div>
      </div>

      {/* Bottom terminal */}
      <div style={{ background: '#000', borderTop: '1px solid rgba(71,70,86,0.3)', padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.7 }}>
        {LOG_LINES.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: 'var(--on-surface-muted)' }}>{log.time}</span>
            <span style={{ color: levelColor[log.level], width: 56 }}>[{log.level}]</span>
            <span style={{ color: 'var(--on-surface)' }}>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
