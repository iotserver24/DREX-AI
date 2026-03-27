import React, { useState, useEffect } from 'react';
import { Send, Cpu, CheckCircle2, Circle, MessageSquare } from 'lucide-react';
import { rpc } from '../rpc';

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system'; text: string }[]>([
    { role: 'system', text: 'Hello! I am DREX. I have analyzed your repository. How can I help you today?' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [planSteps, setPlanSteps] = useState<{ label: string; done: boolean }[]>([]);

  useEffect(() => {
    const onPlanReady = (payload: any) => {
      setPlanSteps(payload.tasks.map((t: any) => ({ label: t.intent, done: false })));
      addMessage('assistant', `I've prepared a plan with ${payload.tasks.length} tasks. Ready to execute?`);
    };
    const onTaskStart = (payload: any) => {
      setIsThinking(true);
      setPlanSteps(prev => prev.map(s => s.label === payload.task.intent ? { ...s, done: false } : s));
    };
    const onTaskDone = (payload: any) => {
      setPlanSteps(prev => prev.map(s => s.label === payload.task.intent ? { ...s, done: true } : s));
    };
    const onDone = () => {
      setIsThinking(false);
      addMessage('assistant', 'Task completed successfully! All changes verified.');
    };

    rpc.addMessageListener('plan:ready', onPlanReady);
    rpc.addMessageListener('task:start', onTaskStart);
    rpc.addMessageListener('task:done', onTaskDone);
    rpc.addMessageListener('done', onDone);

    return () => {
      rpc.removeMessageListener('plan:ready', onPlanReady);
      rpc.removeMessageListener('task:start', onTaskStart);
      rpc.removeMessageListener('task:done', onTaskDone);
      rpc.removeMessageListener('done', onDone);
    };
  }, []);

  const addMessage = (role: 'user' | 'assistant' | 'system', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    addMessage('user', input);
    
    try {
      setInput('');
      setIsThinking(true);
      await rpc.request['run-task']({ intent: input, projectPath: '.' });
    } catch (err: any) {
      addMessage('assistant', `Error: ${err.message}`);
      setIsThinking(false);
    }
  };

  return (
    <aside className="chat-pane">
      <div className="pane-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={14} />
          <span>DREX Assistant</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '10px' }}>Online</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            background: m.role === 'user' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.03)', 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '13px',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '90%',
            border: m.role === 'user' ? '1px solid rgba(168, 85, 247, 0.2)' : 'none'
          }}>
            <div className={m.role === 'user' ? 'text-primary' : 'muted'} style={{ fontSize: '10px', marginBottom: '4px' }}>
              {m.role === 'user' ? 'YOU' : 'DREX'}
            </div>
            {m.text}
          </div>
        ))}

        {/* Thinking Panel */}
        {isThinking && (
          <div className="glass" style={{ padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-indicator"></div>
              {planSteps.length > 0 ? 'EXECUTING...' : 'PLANNING...'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {planSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step.done ? 'var(--success)' : 'var(--on-surface-muted)' }}>
                  {step.done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  <span>{step.label}</span>
                </div>
              ))}
              {planSteps.length === 0 && <span className="muted">Analyzing context...</span>}
            </div>
          </div>
        )}
      </div>

      {/* Input / Footer */}
      <div style={{ padding: '16px', background: 'var(--surface-container-low)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            className="input" 
            placeholder="Ask DREX anything..." 
            style={{ paddingRight: '40px' }} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Send 
            size={16} 
            className="text-primary" 
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={handleSend}
          />
        </div>
      </div>
    </aside>
  );
};
