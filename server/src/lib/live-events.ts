export type LiveLogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface LiveLogEvent {
  id: string;
  timestamp: string;
  level: LiveLogLevel;
  message: string;
  source?: string;
  details?: any;
}

type Subscriber = (event: LiveLogEvent) => void;

const subscribers = new Set<Subscriber>();
const ringBuffer: LiveLogEvent[] = [];
const MAX_BUFFER = 200;
let ticker: NodeJS.Timeout | null = null;

function startTickerIfNeeded() {
  if (ticker || subscribers.size === 0) return;
  // Emit a lightweight info event every second while there are subscribers
  ticker = setInterval(() => {
    try {
      publishLiveEvent({
        id: `${Date.now()}-tick`,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'live tick',
        source: 'system-monitor',
        details: {
          uptimeSec: typeof process !== 'undefined' && process.uptime ? Math.floor(process.uptime()) : undefined,
        },
      });
    } catch {}
  }, 1000);
}

function stopTickerIfIdle() {
  if (subscribers.size === 0 && ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

export function publishLiveEvent(event: LiveLogEvent) {
  const normalized: LiveLogEvent = {
    id: event.id || `${Date.now()}-${Math.random()}`,
    timestamp: event.timestamp || new Date().toISOString(),
    level: (event.level || 'info') as LiveLogLevel,
    message: event.message || '',
    source: event.source || 'server',
    details: event.details,
  };

  ringBuffer.push(normalized);
  if (ringBuffer.length > MAX_BUFFER) {
    ringBuffer.splice(0, ringBuffer.length - MAX_BUFFER);
  }

  for (const fn of subscribers) {
    try { fn(normalized); } catch {}
  }
}

export function getRecentEvents(): LiveLogEvent[] {
  return [...ringBuffer];
}

export function subscribeLiveEvents(handler: Subscriber): () => void {
  subscribers.add(handler);
  startTickerIfNeeded();
  return () => {
    subscribers.delete(handler);
    stopTickerIfIdle();
  };
}

export function createSSEStream() {
  // Shared cleanup reference so both start() and cancel() can access it
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;

      const write = (data: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // If enqueue throws, assume the stream is closed and perform cleanup
          if (!isClosed) {
            isClosed = true;
          }
          if (cleanup) cleanup();
          return;
        }
      };

      // Send initial comments to establish the stream
      write(`: connected\n\n`);

      // Send recent buffered events first
      for (const ev of getRecentEvents()) {
        write(`data: ${JSON.stringify(ev)}\n\n`);
      }

      // Subscribe to future events
      const unsubscribe = subscribeLiveEvents((ev) => {
        write(`data: ${JSON.stringify(ev)}\n\n`);
      });

      // Heartbeat to keep the connection alive through proxies
      const heartbeat = setInterval(() => {
        write(`: heartbeat ${Date.now()}\n\n`);
      }, 15000);

      // Define cleanup and expose to cancel()
      cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try { controller.close(); } catch {}
      };
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  return new Response(stream, { headers });
}


