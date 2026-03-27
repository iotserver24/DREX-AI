import { Electroview, type ElectrobunRPCSchema } from 'electrobun/view'

// --- Shared Schema (must match Main process) ---
export interface DrexRPCSchema extends ElectrobunRPCSchema {
  bun: {
    requests: {
      'run-task': { params: { intent: string; projectPath: string }, response: void };
      'configure-llm': { params: { apiKey: string; baseURL: string; model: string }, response: { success: boolean; model: string } };
      'read-file': { params: { path: string }, response: { content: string } };
      'save-file': { params: { path: string; content: string }, response: { success: boolean } };
      'get-project-tree': { params: { root: string }, response: { tree: any[] } };
    };
    messages: {};
  };
  webview: {
    requests: {};
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

// In Electrobun, defineRPC handles the transport setup automatically via internal bridges
export const rpc = Electroview.defineRPC<DrexRPCSchema>({
  handlers: {
    messages: {
        // Handlers for messages coming FROM Bun
        'plan:ready': (payload) => {
            window.dispatchEvent(new CustomEvent('drex:plan:ready', { detail: payload }));
        },
        'task:start': (payload) => {
            window.dispatchEvent(new CustomEvent('drex:task:start', { detail: payload }));
        },
        'task:done': (payload) => {
            window.dispatchEvent(new CustomEvent('drex:task:done', { detail: payload }));
        },
        'review:fail': (payload) => {
            window.dispatchEvent(new CustomEvent('drex:review:fail', { detail: payload }));
        },
        'done': (payload) => {
            window.dispatchEvent(new CustomEvent('drex:done', { detail: payload }));
        },
        'error': (payload) => {
            window.dispatchEvent(new CustomEvent('drex:error', { detail: payload }));
        }
    }
  }
})
