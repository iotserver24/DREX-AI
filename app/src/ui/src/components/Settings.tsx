import { useState } from 'react'

const CATEGORIES = ['LLM Provider', 'Agent Behavior', 'Permissions', 'Appearance', 'About DREX']

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState('LLM Provider')
  const [baseURL, setBaseURL] = useState('https://api.z.ai/api/paas/v4')
  const [apiKey, setApiKey] = useState('699f4387e52c4f9998c0533db1a44bfc.2brWflrejIYPDF6J')
  const [model, setModel] = useState('GLM-5')
  const [showKey, setShowKey] = useState(false)
  const [thinkingMode, setThinkingMode] = useState(true)
  const [maxTokens, setMaxTokens] = useState('4096')
  const [temp, setTemp] = useState(0)
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('success')

  const testConnection = async () => {
    setStatus('testing')
    setTimeout(() => setStatus('success'), 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(71,70,86,0.2)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>Configure DREX-AI engine and appearance.</p>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
        {/* Category nav */}
        <nav style={{ background: 'var(--surface-low)', padding: '12px 8px', borderRight: '1px solid rgba(71,70,86,0.2)', overflow: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', marginBottom: 2 }}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Content pane */}
        <div style={{ overflow: 'auto', padding: '24px 28px', maxWidth: 560 }}>
          {activeCategory === 'LLM Provider' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>LLM Provider</h2>
                <p style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>Configure any OpenAI-compatible endpoint.</p>
              </div>

              {/* Fields */}
              {[
                { label: 'API Base URL', value: baseURL, setValue: setBaseURL, placeholder: 'https://api.openai.com/v1', mono: true },
                { label: 'Model Name', value: model, setValue: setModel, placeholder: 'gpt-4o / GLM-5 / deepseek-coder', mono: true },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ color: 'var(--on-surface-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}>{f.label}</label>
                  <input
                    className="input"
                    value={f.value}
                    onChange={e => f.setValue(e.target.value)}
                    placeholder={f.placeholder}
                    style={f.mono ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : undefined}
                  />
                </div>
              ))}

              {/* API Key with toggle */}
              <div>
                <label style={{ fontSize: 10.5, color: 'var(--on-surface-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Key</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12, paddingRight: 40 }}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', fontSize: 14 }}
                  >{showKey ? '🙈' : '👁'}</button>
                </div>
              </div>

              {/* Advanced */}
              <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advanced Options</div>

                {/* Thinking toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13 }}>Enable Thinking Mode</div>
                    <div style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>Passes extraBody: &#123; thinking: &#123; type: "enabled" &#125; &#125;</div>
                  </div>
                  <div
                    onClick={() => setThinkingMode(!thinkingMode)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                      background: thinkingMode ? 'var(--primary)' : 'var(--surface-highest)',
                      position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, transition: 'left 0.2s',
                      left: thinkingMode ? 18 : 3,
                    }} />
                  </div>
                </div>

                {/* Max tokens */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <label style={{ fontSize: 13, flexShrink: 0 }}>Max Tokens</label>
                  <input className="input" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} style={{ width: 90, fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'center' }} />
                </div>

                {/* Temperature */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span>Temperature</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-light)' }}>{temp.toFixed(1)}</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.1} value={temp}
                    onChange={e => setTemp(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={testConnection} disabled={status === 'testing'}>
                  {status === 'testing' ? '⟳ Testing...' : '⚡ Test Connection'}
                </button>
                <button className="btn btn-primary">Save Settings</button>
              </div>

              {/* Status indicator */}
              {status === 'success' && (
                <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✓</span> Last connection test: <strong>Success</strong> ({model})
                </div>
              )}
              {status === 'error' && (
                <div style={{ fontSize: 12, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✗</span> Connection failed. Check your API key and base URL.
                </div>
              )}
            </div>
          )}

          {activeCategory !== 'LLM Provider' && (
            <div style={{ color: 'var(--on-surface-muted)', fontSize: 13, marginTop: 20 }}>
              {activeCategory} settings coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
