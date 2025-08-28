import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Bell, 
  Settings,
  Zap
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  isAcknowledged: boolean;
  autoResolve?: boolean;
  threshold?: number;
  currentValue?: number;
}

interface SystemAlertsProps {
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  isMonitoring: boolean;
}

export function SystemAlerts({ resources, isMonitoring }: SystemAlertsProps) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    cpuThreshold: 80,
    memoryThreshold: 85,
    diskThreshold: 90,
    networkThreshold: 75,
    enableAutoAlerts: true,
    enableSound: false
  });

  // Generează alert-uri inteligente bazate pe resursele curente
  useEffect(() => {
    if (!isMonitoring) return;

    const newAlerts: SystemAlert[] = [];
    const now = new Date().toISOString();

    // CPU Alerts
    if (resources.cpu > alertSettings.cpuThreshold) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: resources.cpu > 95 ? 'critical' : 'warning',
        title: 'CPU Usage High',
        message: `CPU usage is at ${resources.cpu.toFixed(1)}%, exceeding threshold of ${alertSettings.cpuThreshold}%`,
        timestamp: now,
        source: 'system-monitor',
        isAcknowledged: false,
        threshold: alertSettings.cpuThreshold,
        currentValue: resources.cpu
      });
    }

    // Memory Alerts
    if (resources.memory > alertSettings.memoryThreshold) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: resources.memory > 95 ? 'critical' : 'warning',
        title: 'Memory Usage High',
        message: `Memory usage is at ${resources.memory.toFixed(1)}%, exceeding threshold of ${alertSettings.memoryThreshold}%`,
        timestamp: now,
        source: 'system-monitor',
        isAcknowledged: false,
        threshold: alertSettings.memoryThreshold,
        currentValue: resources.memory
      });
    }

    // Disk Alerts
    if (resources.disk > alertSettings.diskThreshold) {
      newAlerts.push({
        id: `disk-${Date.now()}`,
        type: resources.disk > 95 ? 'critical' : 'warning',
        title: 'Disk Space Low',
        message: `Disk usage is at ${resources.disk.toFixed(1)}%, exceeding threshold of ${alertSettings.diskThreshold}%`,
        timestamp: now,
        source: 'system-monitor',
        isAcknowledged: false,
        threshold: alertSettings.diskThreshold,
        currentValue: resources.disk
      });
    }

    // Network Alerts
    if (resources.network > alertSettings.networkThreshold) {
      newAlerts.push({
        id: `network-${Date.now()}`,
        type: resources.network > 95 ? 'critical' : 'warning',
        title: 'Network Activity High',
        message: `Network activity is at ${resources.network.toFixed(1)}%, exceeding threshold of ${alertSettings.networkThreshold}%`,
        timestamp: now,
        source: 'system-monitor',
        isAcknowledged: false,
        threshold: alertSettings.networkThreshold,
        currentValue: resources.network
      });
    }

    // Adaugă alert-urile noi
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }

    // Auto-resolve pentru alert-urile care nu mai sunt relevante
    setAlerts(prev => prev.filter(alert => {
      if (alert.autoResolve) {
        const source = alert.source.split('-')[0];
        const currentValue = resources[source as keyof typeof resources];
        const threshold = alert.threshold || 0;
        
        if (currentValue <= threshold) {
          return false; // Remove alert
        }
      }
      return true;
    }));

  }, [resources, isMonitoring, alertSettings]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isAcknowledged: true }
        : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.isAcknowledged);
  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.type === 'warning');

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              System Alerts
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitorizează și gestionează alert-urile sistemului
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {criticalAlerts.length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Critical</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {warningAlerts.length}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeAlerts.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Active</div>
            </div>
          </div>

          {/* Alert Settings */}
          {showSettings && (
            <div className="border rounded-lg p-4 mb-4 bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Alert Thresholds
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">CPU %</label>
                  <input
                    type="number"
                    value={alertSettings.cpuThreshold}
                    onChange={(e) => setAlertSettings(prev => ({
                      ...prev,
                      cpuThreshold: parseInt(e.target.value) || 80
                    }))}
                    className="w-full p-2 border rounded text-sm"
                    min="50"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Memory %</label>
                  <input
                    type="number"
                    value={alertSettings.memoryThreshold}
                    onChange={(e) => setAlertSettings(prev => ({
                      ...prev,
                      memoryThreshold: parseInt(e.target.value) || 85
                    }))}
                    className="w-full p-2 border rounded text-sm"
                    min="50"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Disk %</label>
                  <input
                    type="number"
                    value={alertSettings.diskThreshold}
                    onChange={(e) => setAlertSettings(prev => ({
                      ...prev,
                      diskThreshold: parseInt(e.target.value) || 90
                    }))}
                    className="w-full p-2 border rounded text-sm"
                    min="50"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Network %</label>
                  <input
                    type="number"
                    value={alertSettings.networkThreshold}
                    onChange={(e) => setAlertSettings(prev => ({
                      ...prev,
                      networkThreshold: parseInt(e.target.value) || 75
                    }))}
                    className="w-full p-2 border rounded text-sm"
                    min="50"
                    max="100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="text-lg font-medium">No Active Alerts</p>
              <p className="text-sm">System is running normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.type)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge className={getAlertBadgeColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                        <AlertDescription>{alert.message}</AlertDescription>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Source: {alert.source}</span>
                          <span>Time: {new Date(alert.timestamp).toLocaleTimeString()}</span>
                          {alert.threshold && alert.currentValue && (
                            <span>
                              Current: {alert.currentValue.toFixed(1)}% | Threshold: {alert.threshold}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
