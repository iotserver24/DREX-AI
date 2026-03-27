import electrobun, { BrowserWindow, defineElectrobunRPC } from 'electrobun';
import { Drex } from 'drex-core'
import { join, dirname } from 'node:path';
import { relative } from 'path'
import { readdir, readFile } from 'node:fs/promises';
import { writeFile } from 'fs/promises'
import { existsSync } from 'node:fs';

// --- RPC Schema ---
// --- RPC Schema ---
export type DrexRPCSchema = {
  bun: {
    requests: {
      'run-task': { params: { intent: string; projectPath: string }, response: void };
      'configure-llm': { params: { apiKey: string; baseURL: string; model: string }, response: { success: boolean; model: string } };
      'read-file': { params: { path: string }, response: { content: string } };
      'save-file': { params: { path: string; content: string }, response: { success: boolean } };
      'get-project-tree': { params: { root: string }, response: { tree: any[] } };
    };
    messages: Record<string, never>;
  };
  webview: {
    requests: Record<string, never>;
    messages: {
      'plan:ready': { planId: string; tasks: any[] };
      'task:start': { task: any };
      'task:done': { task: any; result: any };
      'review:fail': { task: any; feedback: string; attempt: number };
      'done': { summary: any };
      'error': { message: string };
    };
  };
}

let drexInstance: Drex | null = null

// Initialize RPC for Bun side
const rpc: any = defineElectrobunRPC<DrexRPCSchema>('bun', {
  handlers: {
    requests: {
      'run-task': async ({ intent, projectPath: _projectPath }: { intent: string, projectPath: string }) => {
        if (!drexInstance) throw new Error('DREX not configured')
        
        // Forward events to webview via RPC messages
        drexInstance.on('plan:ready', (plan) => (rpc.send as any)['plan:ready']({ planId: plan.id, tasks: plan.tasks }))
        drexInstance.on('task:start', (task) => (rpc.send as any)['task:start']({ task }))
        drexInstance.on('task:done', (task, result) => (rpc.send as any)['task:done']({ task, result }))
        drexInstance.on('review:fail', (task, feedback, attempt) => (rpc.send as any)['review:fail']({ task, feedback, attempt }))
        drexInstance.on('done', (summary) => (rpc.send as any)['done']({ summary }))
        drexInstance.on('error', (err) => (rpc.send as any)['error']({ message: err.message }))

        await drexInstance.run(intent, { headless: true })
      },
      'configure-llm': async (config: { apiKey: string, baseURL: string, model: string }) => {
        drexInstance = new Drex({
          projectRoot: process.cwd(),
          ...config,
          permissionLevel: 'moderate'
        })
        return { success: true, model: config.model }
      },
      'read-file': async ({ path }: { path: string }) => {
        const content = await readFile(path, 'utf-8')
        return { content }
      },
      'save-file': async ({ path, content }: { path: string, content: string }) => {
        await writeFile(path, content, 'utf-8')
        return { success: true }
      },
      'get-project-tree': async ({ root }: { root: string }) => {
        const tree = await buildFileTree(root)
        return { tree }
      }
    }
  }
})

// Robust path resolution for both dev and packaged environments
const possiblePaths = [
  join(import.meta.dir, '..', 'index.html'), 
  join(import.meta.dir, '..', 'ui', 'dist', 'index.html'),
];

let finalPath = '';
for (const p of possiblePaths) {
  if (existsSync(p)) {
    finalPath = p;
    break;
  }
}

const viewsRoot = finalPath ? dirname(finalPath) : join(import.meta.dir, '../ui/dist');

// Pre-build the Electrobun preload script to inject into our HTTP-served index.html
// This is required on Linux because the native layer doesn't automatically inject the bridge for HTTP URLs
let preloadScript = '';
try {
    const electrobunPkgPath = import.meta.resolve('electrobun/package.json');
    const electrobunDir = dirname(new URL(electrobunPkgPath).pathname);
    const preloadPath = join(electrobunDir, 'dist/api/bun/preload/index.ts');
    
    console.log(`DEBUG: Bundling preload from: ${preloadPath}`);

    const build = await Bun.build({
        entrypoints: [preloadPath],
        target: 'browser',
    });
    preloadScript = await build.outputs[0].text();
    console.log("DEBUG: Electrobun preload script bundled successfully");
} catch (err) {
    console.error("DEBUG: Failed to bundle Electrobun preload script", err);
}

let mainWin: any;

// Start a local static file server to serve the UI
const uiServer = Bun.serve({
  port: 0,
  async fetch(req) {
    const url = new URL(req.url);
    let pathName = url.pathname;
    if (pathName === '/') pathName = '/index.html';
    
    const filePath = join(viewsRoot, pathName);
    const exists = existsSync(filePath);
    
    console.log(`DEBUG: UI Server request: ${pathName} - File: ${filePath} - Exists: ${exists}`);
    
    if (exists) {
      if (pathName === '/index.html' && mainWin) {
          // Inject Electrobun bridge variables and the preload script
          let content = await readFile(filePath, 'utf-8');
          const bridgeInjection = `
          <script>
            window.__electrobunWebviewId = ${mainWin.webviewId};
            window.__electrobunRpcSocketPort = ${electrobun.Socket.rpcPort};
            window.__electrobunSecretKeyBytes = [${mainWin.webview.secretKey.join(',')}];
            ${preloadScript}
            console.log("DEBUG: Electrobun bridge injected and initialized");
          </script>
          `;
          content = content.replace('<head>', '<head>' + bridgeInjection);
          return new Response(content, { headers: { 'Content-Type': 'text/html' } });
      }

      const file = Bun.file(filePath);
      const response = new Response(file);
      
      // Explicitly set MIME types for Linux WebKitGTK
      if (pathName.endsWith('.js')) {
        response.headers.set('Content-Type', 'text/javascript');
      } else if (pathName.endsWith('.css')) {
        response.headers.set('Content-Type', 'text/css');
      } else if (pathName.endsWith('.html')) {
        response.headers.set('Content-Type', 'text/html');
      }
      
      return response;
    }
    
    return new Response('Not Found', { status: 404 });
  }
});

console.log(`DEBUG: UI Server started at ${uiServer.url}`);

mainWin = new BrowserWindow({
  title: 'DREX-AI',
  url: `${uiServer.url}index.html`, 
  viewsRoot: null,
  frame: {
    width: 1400,
    height: 900,
    x: 100,
    y: 100
  },
  rpc
})

void mainWin;

async function buildFileTree(dir: string, baseDir: string = dir): Promise<any[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const result = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue
    const fullPath = join(dir, entry.name)
    const relPath = relative(baseDir, fullPath)
    if (entry.isDirectory()) {
      result.push({
        name: entry.name,
        path: fullPath,
        relPath,
        type: 'directory',
        children: await buildFileTree(fullPath, baseDir)
      })
    } else {
      result.push({
        name: entry.name,
        path: fullPath,
        relPath,
        type: 'file'
      })
    }
  }

  return result.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name)
    return a.type === 'directory' ? -1 : 1
  })
}
