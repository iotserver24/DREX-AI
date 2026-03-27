import { useState } from 'react'
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { AIChat } from './components/AIChat';
import { Cpu, Wifi, GitBranch } from 'lucide-react';
import { rpc } from './rpc';

const App: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  useEffect(() => {
    const onStart = () => setIsAgentRunning(true);
    const onDone = () => setIsAgentRunning(false);
    const onError = (payload: { message: string }) => {
      console.error('DREX Error:', payload.message);
      setIsAgentRunning(false);
    };

    rpc.addMessageListener('task:start', onStart);
    rpc.addMessageListener('done', onDone);
    rpc.addMessageListener('error', onError);

    return () => {
      rpc.removeMessageListener('task:start', onStart);
      rpc.removeMessageListener('done', onDone);
      rpc.removeMessageListener('error', onError);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Main Layout Area */}
      <div className="main-layout">
        <Sidebar onSelectFile={(path) => setActiveFile(path)} />
        
        <main className="center-pane">
          <Editor activeFile={activeFile} isThinking={isAgentRunning} />
        </main>

        <AIChat />
      </div>

      {/* Bottom Status Bar */}
      <footer className="status-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitBranch size={12} />
            <span>main</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={12} />
            <span>GLM-5 Connected</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={12} />
            <span>TASKS (2)</span>
          </div>
          <span>L:42, C:18</span>
          <span>UTF-8</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
