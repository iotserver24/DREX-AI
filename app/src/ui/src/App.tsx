import { useState } from 'react'
import Dashboard from './components/Dashboard.tsx'
import TaskDetail from './components/TaskDetail.tsx'
import Settings from './components/Settings.tsx'

type Screen = 'dashboard' | 'taskDetail' | 'settings'
type NavItem = { id: Screen; label: string; icon: string }

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'taskDetail', label: 'Tasks', icon: '⚡' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const navigate = (s: Screen, taskId?: string) => {
    if (taskId) setSelectedTaskId(taskId)
    setScreen(s)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--surface-low)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 8px',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '8px 14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px',
          }}>D</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px', color: 'var(--on-surface)' }}>DREX</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--on-surface-muted)', fontFamily: 'var(--font-mono)' }}>v1.0</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item ${screen === item.id || (screen === 'taskDetail' && item.id === 'taskDetail') ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom user avatar */}
        <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(71,70,86,0.2)', paddingTop: 14 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: 'var(--on-primary)',
          }}>A</div>
          <div style={{ fontSize: 12 }}>
            <div style={{ color: 'var(--on-surface)', fontWeight: 500 }}>Developer</div>
            <div style={{ color: 'var(--on-surface-muted)' }}>Pro</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {screen === 'dashboard' && <Dashboard onSelectTask={(id) => navigate('taskDetail', id)} />}
        {screen === 'taskDetail' && <TaskDetail taskId={selectedTaskId} onBack={() => navigate('dashboard')} />}
        {screen === 'settings' && <Settings />}
      </main>
    </div>
  )
}
