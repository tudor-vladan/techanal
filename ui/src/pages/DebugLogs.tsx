import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchWithAuth, API_BASE_URL, getLocalAuthToken } from '@/lib/serverComm';
import { AlertTriangle, RefreshCw, Trash2, Bug, Filter, Copy, Check, Download } from 'lucide-react';

interface DebugEntry {
  id: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  timestamp: string;
  details?: any;
}

export default function DebugLogsPage() {
  const RING_LIMIT = 1000;
  const [logs, setLogs] = useState<DebugEntry[]>([]);
  const [filterText, setFilterText] = useState(() => localStorage.getItem('debug.filterText') || '');
  const [level, setLevel] = useState<'all' | 'error' | 'warning' | 'info'>(() => (localStorage.getItem('debug.level') as any) || 'all');
  const [source, setSource] = useState<'all' | string>(() => localStorage.getItem('debug.source') || 'all');
  const listenerAttached = useRef(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const addLog = useCallback((entry: DebugEntry) => {
    if (paused) return;
    setLogs(prev => [{ ...entry, id: `${Date.now()}-${Math.random()}` }, ...prev].slice(0, RING_LIMIT));
  }, [paused]);

  const fetchServerLogs = useCallback(async () => {
    if (paused) return;
    try {
      const resp = await fetchWithAuth('/api/system/logs');
      if (!resp.ok) return;
      const data = await resp.json();
      const items: DebugEntry[] = (data.logs || []).map((l: any) => ({
        id: `srv-${l.id || Math.random()}`,
        level: (l.level || 'info').toLowerCase(),
        source: l.source || 'server',
        message: l.message || '',
        timestamp: l.timestamp || new Date().toISOString(),
        details: l.details,
      }));
      setLogs(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = items.filter(item => !existingIds.has(item.id));
        return [...newItems, ...prev].slice(0, RING_LIMIT);
      });
    } catch {}
  }, [paused]);

  useEffect(() => {
    if (listenerAttached.current) return;
    listenerAttached.current = true;

    const onError = (event: ErrorEvent) => {
      addLog({
        id: `${Date.now()}`,
        level: 'error',
        source: 'client',
        message: event.message,
        timestamp: new Date().toISOString(),
        details: { filename: event.filename, lineno: event.lineno, colno: event.colno }
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      addLog({
        id: `${Date.now()}`,
        level: 'error',
        source: 'client-unhandled',
        message: String(event.reason),
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    let es: EventSource | null = null;
    (async () => {
      try {
        const token = await getLocalAuthToken();
        const qs = token ? `?token=${encodeURIComponent(token)}` : '';
        es = new EventSource(`${API_BASE_URL}/api/system/logs/stream${qs}`);
        esRef.current = es;
        es.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            addLog({
              id: `sse-${data.id || Math.random()}`,
              level: (data.level || 'info').toLowerCase(),
              source: data.source || 'server',
              message: data.message || '',
              timestamp: data.timestamp || new Date().toISOString(),
              details: data.details,
            });
          } catch {}
        };
        es.onerror = () => {
          // fallback to polling on error
          fetchServerLogs();
        };
      } catch {
        // fallback to polling if SSE fails
        fetchServerLogs();
      }
    })();

    const timer = setInterval(fetchServerLogs, 15000);
    fetchServerLogs();

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      clearInterval(timer);
      if (es) {
        es.close();
        es = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [addLog, fetchServerLogs]);

  useEffect(() => {
    localStorage.setItem('debug.filterText', filterText);
  }, [filterText]);
  useEffect(() => {
    localStorage.setItem('debug.level', level);
  }, [level]);
  useEffect(() => {
    localStorage.setItem('debug.source', source);
  }, [source]);

  const sources = Array.from(new Set(logs.map(l => l.source).filter(Boolean))); 
  const filtered = logs.filter(l => (level === 'all' || l.level === level) && (source === 'all' || l.source === source) && (filterText === '' || (l.message||'').toLowerCase().includes(filterText.toLowerCase()) || (l.source||'').toLowerCase().includes(filterText.toLowerCase())));

  const handleCopy = useCallback((entry: DebugEntry) => {
    const text = JSON.stringify(entry, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    }).catch(() => {
      // ignore
    });
  }, []);

  const handleCopyAll = useCallback(() => {
    const text = JSON.stringify(filtered, null, 2);
    navigator.clipboard.writeText(text);
  }, [filtered]);

  const download = (filename: string, data: string, type = 'application/json') => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = useCallback(() => {
    download('debug-logs.json', JSON.stringify(filtered, null, 2));
  }, [filtered]);

  const exportCSV = useCallback(() => {
    const header = ['timestamp','level','source','message'];
    const rows = filtered.map(l => [l.timestamp, l.level, l.source || '', (l.message || '').replace(/\n/g,' ').replace(/"/g,'""')]);
    const csv = [header.join(','), ...rows.map(r => r.map(x => `"${String(x)}"`).join(','))].join('\n');
    download('debug-logs.csv', csv, 'text/csv');
  }, [filtered]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="w-7 h-7" /> Debug Console
          </h1>
          <p className="text-muted-foreground">Erori și warnings live din client și server</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchServerLogs()} className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
          <Button variant="outline" onClick={() => setLogs([])} className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear</Button>
          <Button variant="outline" onClick={handleCopyAll} className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy All</Button>
          <Button variant="outline" onClick={exportJSON} className="flex items-center gap-2"><Download className="w-4 h-4" /> JSON</Button>
          <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2"><Download className="w-4 h-4" /> CSV</Button>
          <Button variant={paused ? 'default' : 'outline'} onClick={() => setPaused(p => {
            const next = !p;
            if (!next && !esRef.current) {
              // resume: force a fetch to get latest
              fetchServerLogs();
            }
            return next;
          })} className="flex items-center gap-2">
            {paused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Filtre</CardTitle>
          <CardDescription>Filtrează mesajele afișate</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={level} onChange={(e) => setLevel(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="all">Toate nivelele</option>
            <option value="error">Erori</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
          </select>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="all">Toate sursele</option>
            {sources.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Input placeholder="Caută în mesaj/sursă" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesaje ({filtered.length})</CardTitle>
          <CardDescription>Ultimele 500 de evenimente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((l) => {
              const duplicateCount = logs.filter(x => x.message === l.message && x.source === l.source).length;
              const containerTone = l.level === 'error'
                ? 'border-destructive/50 bg-destructive/10 dark:bg-destructive/20'
                : l.level === 'warning'
                ? 'border-yellow-500/40 bg-yellow-500/10 dark:bg-yellow-950/20'
                : 'bg-muted/5';
              const textTone = l.level === 'error'
                ? 'text-destructive'
                : l.level === 'warning'
                ? 'text-yellow-700 dark:text-yellow-400'
                : 'text-foreground';
              return (
                <div key={l.id} className={`p-3 border rounded-md ${containerTone} ${duplicateCount > 3 ? 'ring-1 ring-amber-500/30 dark:ring-amber-400/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={l.level === 'error' ? 'destructive' : l.level === 'warning' ? 'secondary' : 'outline'} className="text-xs">
                        {l.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">{l.source}</div>
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleCopy(l)} title="Copy entry">
                        {copiedId === l.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className={`mt-2 text-sm ${textTone}`}>
                    {l.message || '(no message)'} {duplicateCount > 1 && (
                      <Badge variant="secondary" className="ml-2 text-xs">x{duplicateCount}</Badge>
                    )}
                  </div>
                  {l.details && (
                    <pre className="mt-2 text-xs text-muted-foreground bg-muted/10 rounded p-2 whitespace-pre-wrap overflow-auto">{JSON.stringify(l.details, null, 2)}</pre>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                Nicio înregistrare de afișat.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
