// Lightweight client-side debug logger that forwards events to the server ingest endpoint
// without depending on serverComm to avoid circular imports.

type DebugLevel = 'info' | 'warning' | 'error' | 'debug';

export interface DebugLogPayload {
  level?: DebugLevel;
  message: string;
  source?: string;
  category?: string;
  details?: any;
  timestamp?: string;
}

function isEnabled(): boolean {
  // Prefer explicit Vite toggle; fallback to ENABLE_DEBUG_LOGGING; default to dev true
  const viteFlag = (import.meta as any)?.env?.VITE_DEBUG_LOGS;
  if (typeof viteFlag !== 'undefined') {
    return String(viteFlag) !== 'false';
  }
  const generic = (import.meta as any)?.env?.ENABLE_DEBUG_LOGGING;
  if (typeof generic !== 'undefined') {
    return String(generic) !== 'false';
  }
  return !!(import.meta as any)?.env?.DEV;
}

function computeApiBase(): string {
  const envUrl = (import.meta as any)?.env?.VITE_API_URL || (import.meta as any)?.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) return envUrl.trim();
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) {
      const currentPort = parseInt(port || '0', 10);
      const candidate = currentPort > 0 ? currentPort - 1 : 5500;
      return `${protocol}//${hostname}:${candidate || 5500}`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  return 'http://localhost:5500';
}

function getLocalToken(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.email || null;
  } catch {
    return null;
  }
}

async function sendToServer(payload: DebugLogPayload): Promise<void> {
  if (!isEnabled()) return;
  try {
    const token = getLocalToken();
    const headers = new Headers({ 'Content-Type': 'application/json', 'X-Debug-Ingest': '1' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    await fetch(`${computeApiBase()}/api/v1/logs/ingest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        level: (payload.level || 'info').toLowerCase(),
        source: payload.source || 'client',
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });
  } catch {
    // Swallow errors – logging must never break the app
  }
}

export const debugLogger = {
  log: (message: string, details?: any, category?: string) =>
    sendToServer({ level: 'info', message, details, category }),
  info: (message: string, details?: any, category?: string) =>
    sendToServer({ level: 'info', message, details, category }),
  warn: (message: string, details?: any, category?: string) =>
    sendToServer({ level: 'warning', message, details, category }),
  error: (message: string, details?: any, category?: string) =>
    sendToServer({ level: 'error', message, details, category }),
  debug: (message: string, details?: any, category?: string) =>
    sendToServer({ level: 'debug', message, details, category }),
};

export default debugLogger;


