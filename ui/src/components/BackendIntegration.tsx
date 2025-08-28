import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  Zap,
  Settings,
  BarChart3,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface BackendStatus {
  server: 'online' | 'offline' | 'connecting' | 'error';
  database: 'connected' | 'disconnected' | 'connecting' | 'error';
  api: 'healthy' | 'degraded' | 'down' | 'maintenance';
  lastSync: string;
  syncInterval: number;
  dataLatency: number;
  errorCount: number;
  successRate: number;
}

interface APIEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCall: string;
  callCount: number;
  errorCount: number;
}

interface DataSync {
  id: string;
  type: 'processes' | 'resources' | 'logs' | 'metrics';
  status: 'syncing' | 'completed' | 'failed' | 'pending';
  progress: number;
  lastSync: string;
  nextSync: string;
  dataSize: number;
  error?: string;
}

interface BackendIntegrationProps {
  isMonitoring: boolean;
}

export function BackendIntegration({ isMonitoring }: BackendIntegrationProps) {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [dataSyncs, setDataSyncs] = useState<DataSync[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simulează status-ul backend-ului
  useEffect(() => {
    if (!isMonitoring) return;

    const updateBackendStatus = () => {
      const status: BackendStatus = {
        server: Math.random() > 0.1 ? 'online' : 'error',
        database: Math.random() > 0.05 ? 'connected' : 'error',
        api: Math.random() > 0.15 ? 'healthy' : 'degraded',
        lastSync: new Date().toISOString(),
        syncInterval: 30,
        dataLatency: Math.floor(Math.random() * 100) + 20,
        errorCount: Math.floor(Math.random() * 5),
        successRate: Math.random() * 20 + 80
      };

      setBackendStatus(status);
    };

    updateBackendStatus();
    
    const interval = setInterval(updateBackendStatus, 10000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Generează endpoint-uri API
  useEffect(() => {
    const endpoints: APIEndpoint[] = [
      {
        name: 'System Processes',
        url: '/api/system/processes',
        method: 'GET',
        status: 'healthy',
        responseTime: 45,
        lastCall: new Date().toISOString(),
        callCount: 1247,
        errorCount: 3
      },
      {
        name: 'Resource Usage',
        url: '/api/system/resources',
        method: 'GET',
        status: 'healthy',
        responseTime: 32,
        lastCall: new Date().toISOString(),
        callCount: 2156,
        errorCount: 1
      },
      {
        name: 'System Logs',
        url: '/api/system/logs',
        method: 'GET',
        status: 'degraded',
        responseTime: 89,
        lastCall: new Date().toISOString(),
        callCount: 892,
        errorCount: 12
      },
      {
        name: 'Performance Metrics',
        url: '/api/system/metrics',
        method: 'POST',
        status: 'healthy',
        responseTime: 67,
        lastCall: new Date().toISOString(),
        callCount: 567,
        errorCount: 2
      },
      {
        name: 'AI Engine Status',
        url: '/api/ai/status',
        method: 'GET',
        status: 'healthy',
        responseTime: 23,
        lastCall: new Date().toISOString(),
        callCount: 445,
        errorCount: 0
      }
    ];

    setApiEndpoints(endpoints);
  }, []);

  // Generează sincronizări de date
  useEffect(() => {
    if (!isMonitoring) return;

    const generateDataSyncs = () => {
      const syncs: DataSync[] = [
        {
          id: 'sync-1',
          type: 'processes',
          status: 'completed',
          progress: 100,
          lastSync: new Date().toISOString(),
          nextSync: new Date(Date.now() + 30000).toISOString(),
          dataSize: 1024 * 50 // 50KB
        },
        {
          id: 'sync-2',
          type: 'resources',
          status: 'syncing',
          progress: 67,
          lastSync: new Date().toISOString(),
          nextSync: new Date(Date.now() + 15000).toISOString(),
          dataSize: 1024 * 128 // 128KB
        },
        {
          id: 'sync-3',
          type: 'logs',
          status: 'pending',
          progress: 0,
          lastSync: new Date(Date.now() - 60000).toISOString(),
          nextSync: new Date(Date.now() + 45000).toISOString(),
          dataSize: 1024 * 256 // 256KB
        },
        {
          id: 'sync-4',
          type: 'metrics',
          status: 'completed',
          progress: 100,
          lastSync: new Date().toISOString(),
          nextSync: new Date(Date.now() + 20000).toISOString(),
          dataSize: 1024 * 75 // 75KB
        }
      ];

      setDataSyncs(syncs);
    };

    generateDataSyncs();
    
    const interval = setInterval(generateDataSyncs, 15000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Conectează la backend
  const connectToBackend = async () => {
    setIsConnecting(true);
    
    // Simulează conexiunea
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setBackendStatus(prev => prev ? { ...prev, server: 'online', database: 'connected' } : null);
    setIsConnecting(false);
  };

  // Testează endpoint-ul
  const testEndpoint = async (endpoint: APIEndpoint) => {
    const updatedEndpoints = apiEndpoints.map(ep => 
      ep.name === endpoint.name 
        ? { ...ep, status: 'healthy' as const, responseTime: Math.floor(Math.random() * 50) + 20 }
        : ep
    );
    
    setApiEndpoints(updatedEndpoints);
  };

  // Forțează sincronizarea
  const forceSync = (syncId: string) => {
    setDataSyncs(prev => 
      prev.map(sync => 
        sync.id === syncId 
          ? { ...sync, status: 'syncing' as const, progress: 0 }
          : sync
      )
    );

    // Simulează sincronizarea
    setTimeout(() => {
      setDataSyncs(prev => 
        prev.map(sync => 
          sync.id === syncId 
            ? { ...sync, status: 'completed' as const, progress: 100 }
            : sync
        )
      );
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'healthy':
      case 'completed':
        return 'bg-green-500';
      case 'connecting':
      case 'syncing':
        return 'bg-blue-500';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
      case 'disconnected':
      case 'down':
      case 'error':
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'healthy':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'connecting':
      case 'syncing':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'offline':
      case 'disconnected':
      case 'down':
      case 'error':
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const overallHealth = backendStatus ? 
    (backendStatus.server === 'online' && backendStatus.database === 'connected' && backendStatus.api === 'healthy') : false;

  return (
    <div className="space-y-6">
      {/* Backend Status Overview */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Server className="w-6 h-6" />
            Backend Integration Status
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Real-time connection status and API health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backendStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getStatusIcon(backendStatus.server)}
                  <span className="text-sm font-medium">Server</span>
                </div>
                <Badge className={getStatusColor(backendStatus.server)}>
                  {backendStatus.server.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getStatusIcon(backendStatus.database)}
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge className={getStatusColor(backendStatus.database)}>
                  {backendStatus.database.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getStatusIcon(backendStatus.api)}
                  <span className="text-sm font-medium">API</span>
                </div>
                <Badge className={getStatusColor(backendStatus.api)}>
                  {backendStatus.api.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {backendStatus.dataLatency}ms
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Latency</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <WifiOff className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-muted-foreground">Backend status unavailable</p>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className={overallHealth ? 'bg-green-500' : 'bg-red-500'}>
                  {overallHealth ? 'HEALTHY' : 'ISSUES DETECTED'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last sync: {backendStatus?.lastSync ? new Date(backendStatus.lastSync).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={connectToBackend}
                disabled={isConnecting}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Endpoints Health
          </CardTitle>
          <CardDescription>
            Real-time monitoring of API endpoint performance and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(endpoint.status)}
                    <div>
                      <h4 className="font-semibold">{endpoint.name}</h4>
                      <p className="text-sm text-muted-foreground">{endpoint.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <Badge className={getStatusColor(endpoint.status)}>
                      {endpoint.status.toUpperCase()}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testEndpoint(endpoint)}
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Response Time:</span>
                    <div className="font-medium">{endpoint.responseTime}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Calls:</span>
                    <div className="font-medium">{endpoint.callCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <div className="font-medium">{endpoint.errorCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Call:</span>
                    <div className="font-medium">{new Date(endpoint.lastCall).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Synchronization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Real-time data sync status and progress monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSyncEnabled(!syncEnabled)}
              >
                {syncEnabled ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {syncEnabled ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoReconnect(!autoReconnect)}
              >
                <Wifi className="w-4 h-4 mr-2" />
                Auto-reconnect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataSyncs.map((sync) => (
              <div key={sync.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sync.status)}
                    <div>
                      <h4 className="font-semibold capitalize">{sync.type} Sync</h4>
                      <p className="text-sm text-muted-foreground">
                        {sync.status === 'syncing' ? 'In progress...' : 
                         sync.status === 'completed' ? 'Last sync completed' :
                         sync.status === 'failed' ? 'Sync failed' : 'Waiting for next sync'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(sync.status)}>
                      {sync.status.toUpperCase()}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => forceSync(sync.id)}
                      disabled={sync.status === 'syncing'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{sync.progress}%</span>
                  </div>
                  <Progress value={sync.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Data Size:</span>
                    <div className="font-medium">{formatBytes(sync.dataSize)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Sync:</span>
                    <div className="font-medium">{new Date(sync.lastSync).toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Sync:</span>
                    <div className="font-medium">{new Date(sync.nextSync).toLocaleTimeString()}</div>
                  </div>
                </div>
                
                {sync.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium text-sm">Error</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{sync.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Configuration
            </CardTitle>
            <CardDescription>
              Advanced backend integration settings and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Connection Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-reconnect</span>
                    <Button
                      variant={autoReconnect ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoReconnect(!autoReconnect)}
                    >
                      {autoReconnect ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data sync</span>
                    <Button
                      variant={syncEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSyncEnabled(!syncEnabled)}
                    >
                      {syncEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Performance Metrics</h4>
                {backendStatus && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate:</span>
                      <span className="font-medium">{backendStatus.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Count:</span>
                      <span className="font-medium">{backendStatus.errorCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sync Interval:</span>
                      <span className="font-medium">{backendStatus.syncInterval}s</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
