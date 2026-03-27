import React, { useEffect, useState } from 'react';
import { FileCode, X, Cpu, FileBox } from 'lucide-react';
import { rpc } from '../rpc';

interface EditorProps {
  activeFile: string | null;
  isThinking: boolean;
}

export const Editor: React.FC<EditorProps> = ({ activeFile, isThinking }) => {
  const [content, setContent] = useState<string>('');
  const [editingFile, setEditingFile] = useState<string | null>(null);

  useEffect(() => {
    if (activeFile) {
      rpc.request['read-file']({ path: activeFile })
        .then(res => {
          setContent(res.content);
          setEditingFile(activeFile);
        })
        .catch(err => setContent(`Error reading file: ${err.message}`));
    }
  }, [activeFile]);

  if (!editingFile) {
    return (
      <div className="center-pane" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-muted)' }}>
        <FileBox size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
        <p>No file selected. Select a file from the explorer to view code.</p>
      </div>
    );
  }

  const fileName = editingFile.split('/').pop() || '';

  return (
    <div className="center-pane">
      <div className="pane-header" style={{ background: 'var(--surface-low)', padding: '0', height: '36px' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className="nav-item active" style={{ borderRadius: 0, padding: '0 12px', gap: '6px' }}>
            <FileCode size={14} />
            <span>{fileName}</span>
            <X size={12} style={{ marginLeft: '4px', opacity: 0.5 }} />
          </div>
        </div>
      </div>

      <div className="editor-container">
        <div style={{ display: 'flex', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          {/* Gutter */}
          <div style={{ width: '40px', background: 'var(--surface-low)', color: 'var(--on-surface-muted)', textAlign: 'right', padding: '16px 8px', userSelect: 'none' }}>
            {content.split('\n').map((_, i) => (
              <div key={i} style={{ height: '20px' }}>{i + 1}</div>
            ))}
          </div>
          
          {/* Code Content */}
          <div 
            style={{ flex: 1, padding: '16px', color: 'var(--on-surface)', whiteSpace: 'pre', overflowX: 'auto' }}
            dangerouslySetInnerHTML={{ __html: formatCode(content) }}
          />
        </div>

        {/* Thinking Overlay */}
        {isThinking && (
          <div className="glass" style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '12px 20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 10 }}>
            <div className="pulse-indicator"></div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>DREX is thinking...</div>
          </div>
        )}
      </div>

      <div className="terminal-pane">
        <div className="pane-header">
          <span>Integrated Terminal</span>
          <Cpu size={14} />
        </div>
        <div style={{ flex: 1, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--on-surface-muted)', overflow: 'auto' }}>
          <div style={{ color: 'var(--on-surface)' }}>$ <span className="pulse-indicator" style={{ display: 'inline-block', width: 6, height: 12, borderRadius: 0 }}></span></div>
        </div>
      </div>
    </div>
  );
};

// Extremely simple "syntax highlighting" via regex for demo
function formatCode(code: string) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(import|from|export|default|const|let|var|function|return|if|else|for|while|await|async|new|type|interface|class)\b/g, '<span style="color: #A855F7">$1</span>')
    .replace(/'(.*?)'/g, '<span style="color: #ce9178">\'$1\'</span>')
    .replace(/"(.*?)"/g, '<span style="color: #ce9178">"$1"</span>');
}
