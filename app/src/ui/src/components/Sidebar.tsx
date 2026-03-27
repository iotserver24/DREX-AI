import React, { useEffect, useState } from 'react';
import { FolderTree, ListChecks, Settings, FileCode, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { rpc } from '../rpc';

interface FileNode {
  name: string;
  path: string;
  relPath: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface SidebarProps {
  onSelectFile: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectFile }) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { tree } = await rpc.request['get-project-tree']({ root: '.' });
        setTree(tree);
      } catch (err) {
        console.error('Failed to fetch tree:', err);
      }
    };

    fetchTree();
    
    const onTreeUpdate = (payload: { tree: any[] }) => setTree(payload.tree);
    rpc.addMessageListener('project-tree', onTreeUpdate);

    return () => {
      rpc.removeMessageListener('project-tree', onTreeUpdate);
    };
  }, []);

  const toggle = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded[node.path];
    const isDir = node.type === 'directory';

    return (
      <div key={node.path}>
        <div 
          className="nav-item" 
          style={{ 
            paddingLeft: `${depth * 14 + 12}px`, 
            fontSize: '12px',
            gap: '8px'
          }}
          onClick={() => isDir ? toggle(node.path) : onSelectFile(node.path)}
        >
          {isDir ? (
            <>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={14} color="#818cf8" fill="#818cf855" />
            </>
          ) : (
            <FileCode size={14} className="muted" />
          )}
          <span>{node.name}</span>
        </div>
        
        {isDir && isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="pane-header">
        <span>Explorer</span>
        <FolderTree size={14} />
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {tree.map(node => renderNode(node))}
      </div>

      <div style={{ padding: '12px', background: 'var(--surface-container)' }}>
        <div className="nav-item">
          <ListChecks size={16} />
          <span>Tasks</span>
        </div>
        <div className="nav-item">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
};
