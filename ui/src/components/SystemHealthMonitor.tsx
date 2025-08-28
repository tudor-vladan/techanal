import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  Gauge,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Server,
  Database,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Lightbulb
} from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  trend: 'improving' | 'stable' | 'degrading';
  lastCheck: string;
  threshold: {
    warning: number;
    critical: number;
  };
  description: string;
  category: 'system' | 'network' | 'security' | 'performance' | 'storage';
}

interface HealthAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  autoResolved: boolean;
  metricId: string;
  recommendation: string;
}

interface SystemHealth {
  overallScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  lastUpdate: string;
  uptime: string;
  activeAlerts: number;
  criticalIssues: number;
  performanceTrend: 'improving' | 'stable' | 'degrading';
}

interface SystemHealthMonitorProps {
  isMonitoring: boolean;
  resources: any;
  processes: any[];
  chartData: any[];
}

export function SystemHealthMonitor({ 
  isMonitoring, 
  resources, 
  processes, 
  chartData 
}: SystemHealthMonitorProps) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isHealthCheckRunning, setIsHealthCheckRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoResolveEnabled, setAutoResolveEnabled] = useState(true);

  // Generează metrici de sănătate
  const generateHealthMetrics = useCallback(() => {
    if (!resources) return [];

    const metrics: HealthMetric[] = [];

    // CPU Health
    const cpuHealth = calculateCPUHealth(resources.cpu?.usage || 0);
    metrics.push({
      id: 'cpu-health',
      name: 'CPU Health',
      value: cpuHealth.score,
      unit: '%',
      status: cpuHealth.status,
      trend: cpuHealth.trend,
      lastCheck: new Date().toISOString(),
      threshold: { warning: 80, critical: 95 },
      description: 'CPU utilization and performance health',
      category: 'performance'
    });

    // Memory Health
    const memoryHealth = calculateMemoryHealth(resources.memory?.usage || 0);
    metrics.push({
      id: 'memory-health',
      name: 'Memory Health',
      value: memoryHealth.score,
      unit: '%',
      status: memoryHealth.status,
      trend: memoryHealth.trend,
      lastCheck: new Date().toISOString(),
      threshold: { warning: 85, critical: 95 },
      description: 'Memory usage and availability health',
      category: 'performance'
    });

    // Disk Health
    const diskHealth = calculateDiskHealth(resources.disk?.usage || 0);
    metrics.push({
      id: 'disk-health',
      name: 'Disk Health',
      value: diskHealth.score,
      unit: '%',
      status: diskHealth.status,
      trend: diskHealth.trend,
      lastCheck: new Date().toISOString(),
      threshold: { warning: 85, critical: 95 },
      description: 'Disk space and I/O performance health',
      category: 'storage'
    });

    // Network Health
    const networkHealth = calculateNetworkHealth(resources.network?.connections || 0);
    metrics.push({
      id: 'network-health',
      name: 'Network Health',
      value: networkHealth.score,
      unit: '%',
      status: networkHealth.status,
      trend: networkHealth.trend,
      lastCheck: new Date().toISOString(),
      threshold: { warning: 70, critical: 90 },
      description: 'Network connectivity and performance health',
      category: 'network'
    });

    // Process Health
    const processHealth = calculateProcessHealth(processes);
    metrics.push({
      id: 'process-health',
      name: 'Process Health',
      value: processHealth.score,
      unit: '%',
      status: processHealth.status,
      trend: processHealth.trend,
      lastCheck: new Date().toISOString(),
      threshold: { warning: 75, critical: 90 },
      description: 'System process stability and performance',
      category: 'system'
    });

    // Security Health
    const securityHealth = calculateSecurityHealth();
    metrics.push({
      id: 'security-health',
      name: 'Security Health',
      value: securityHealth.score,
      unit: '%',
      status: securityHealth.status,
      trend: securityHealth.trend,
      lastCheck: new Date().toISOString(),
      threshold: { warning: 80, critical: 90 },
      description: 'System security and access control health',
      category: 'security'
    });

    return metrics;
  }, [resources, processes]);

  // Calculează sănătatea CPU
  const calculateCPUHealth = (usage: number) => {
    let score = 100;
    let status: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (usage > 95) {
      score = 20;
      status = 'critical';
      trend = 'degrading';
    } else if (usage > 80) {
      score = 60;
      status = 'warning';
      trend = 'degrading';
    } else if (usage > 60) {
      score = 80;
      status = 'healthy';
      trend = 'stable';
    } else {
      score = 95;
      status = 'healthy';
      trend = 'improving';
    }

    return { score, status, trend };
  };

  // Calculează sănătatea memoriei
  const calculateMemoryHealth = (usage: number) => {
    let score = 100;
    let status: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (usage > 95) {
      score = 15;
      status = 'critical';
      trend = 'degrading';
    } else if (usage > 85) {
      score = 50;
      status = 'warning';
      trend = 'degrading';
    } else if (usage > 70) {
      score = 75;
      status = 'healthy';
      trend = 'stable';
    } else {
      score = 90;
      status = 'healthy';
      trend = 'improving';
    }

    return { score, status, trend };
  };

  // Calculează sănătatea discului
  const calculateDiskHealth = (usage: number) => {
    let score = 100;
    let status: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (usage > 95) {
      score = 10;
      status = 'critical';
      trend = 'degrading';
    } else if (usage > 85) {
      score = 40;
      status = 'warning';
      trend = 'degrading';
    } else if (usage > 70) {
      score = 70;
      status = 'healthy';
      trend = 'stable';
    } else {
      score = 85;
      status = 'healthy';
      trend = 'improving';
    }

    return { score, status, trend };
  };

  // Calculează sănătatea rețelei
  const calculateNetworkHealth = (connections: number) => {
    let score = 100;
    let status: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (connections > 1000) {
      score = 30;
      status = 'warning';
      trend = 'degrading';
    } else if (connections > 500) {
      score = 60;
      status = 'healthy';
      trend = 'stable';
    } else {
      score = 85;
      status = 'healthy';
      trend = 'improving';
    }

    return { score, status, trend };
  };

  // Calculează sănătatea proceselor
  const calculateProcessHealth = (processes: any[]) => {
    if (!processes.length) return { score: 0, status: 'offline' as const, trend: 'degrading' as const };

    const totalProcesses = processes.length;
    const healthyProcesses = processes.filter(p => p.status === 'running').length;
    const ratio = healthyProcesses / totalProcesses;
    
    let score = Math.round(ratio * 100);
    let status: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (score < 50) {
      status = 'critical';
      trend = 'degrading';
    } else if (score < 75) {
      status = 'warning';
      trend = 'degrading';
    } else if (score < 90) {
      status = 'healthy';
      trend = 'stable';
    } else {
      status = 'healthy';
      trend = 'improving';
    }

    return { score, status, trend };
  };

  // Calculează sănătatea securității
  const calculateSecurityHealth = () => {
    // Simulează verificări de securitate
    const securityScore = Math.random() * 20 + 80; // 80-100
    let status: 'healthy' | 'warning' | 'critical' | 'offline' = 'healthy';
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (securityScore < 85) {
      status = 'warning';
      trend = 'degrading';
    } else if (securityScore < 90) {
      status = 'healthy';
      trend = 'stable';
    } else {
      status = 'healthy';
      trend = 'improving';
    }

    return { score: Math.round(securityScore), status, trend };
  };

  // Generează alert-uri de sănătate
  const generateHealthAlerts = useCallback((metrics: HealthMetric[]) => {
    const alerts: HealthAlert[] = [];

    metrics.forEach(metric => {
      if (metric.status === 'critical') {
        alerts.push({
          id: `alert-${metric.id}-${Date.now()}`,
          severity: 'critical',
          title: `Critical: ${metric.name} Health`,
          message: `${metric.name} is in critical condition (${metric.value}${metric.unit})`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          autoResolved: false,
          metricId: metric.id,
          recommendation: `Immediate action required. Check ${metric.name.toLowerCase()} and resolve issues.`
        });
      } else if (metric.status === 'warning') {
        alerts.push({
          id: `alert-${metric.id}-${Date.now()}`,
          severity: 'warning',
          title: `Warning: ${metric.name} Health`,
          message: `${metric.name} requires attention (${metric.value}${metric.unit})`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          autoResolved: false,
          metricId: metric.id,
          recommendation: `Monitor ${metric.name.toLowerCase()} closely and consider preventive measures.`
        });
      }
    });

    return alerts;
  }, []);

  // Calculează sănătatea generală a sistemului
  const calculateSystemHealth = useCallback((metrics: HealthMetric[], alerts: HealthAlert[]) => {
    if (metrics.length === 0) return null;

    const totalScore = metrics.reduce((sum, metric) => sum + metric.value, 0);
    const averageScore = Math.round(totalScore / metrics.length);
    
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'excellent';
    let performanceTrend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (averageScore >= 90) {
      status = 'excellent';
      performanceTrend = 'improving';
    } else if (averageScore >= 75) {
      status = 'good';
      performanceTrend = 'stable';
    } else if (averageScore >= 60) {
      status = 'fair';
      performanceTrend = 'stable';
    } else if (averageScore >= 40) {
      status = 'poor';
      performanceTrend = 'degrading';
    } else {
      status = 'critical';
      performanceTrend = 'degrading';
    }

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const activeAlerts = alerts.filter(a => !a.acknowledged).length;

    return {
      overallScore: averageScore,
      status,
      lastUpdate: new Date().toISOString(),
      uptime: '15d 7h 32m', // Simulated uptime
      activeAlerts,
      criticalIssues: criticalAlerts,
      performanceTrend
    };
  }, []);

  // Rulează verificarea de sănătate
  const runHealthCheck = useCallback(async () => {
    setIsHealthCheckRunning(true);
    
    // Simulează verificarea de sănătate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const metrics = generateHealthMetrics();
    const alerts = generateHealthAlerts(metrics);
    const health = calculateSystemHealth(metrics, alerts);
    
    setHealthMetrics(metrics);
    setHealthAlerts(prev => [...prev, ...alerts]);
    setSystemHealth(health);
    
    setIsHealthCheckRunning(false);
  }, [generateHealthMetrics, generateHealthAlerts, calculateSystemHealth]);

  // Auto-resolve alert-uri
  useEffect(() => {
    if (!autoResolveEnabled || !isMonitoring) return;

    const interval = setInterval(() => {
      setHealthAlerts(prev => 
        prev.map(alert => {
          if (alert.autoResolved) return alert;
          
          // Auto-resolve warning alerts after 5 minutes
          if (alert.severity === 'warning' && 
              Date.now() - new Date(alert.timestamp).getTime() > 5 * 60 * 1000) {
            return { ...alert, autoResolved: true };
          }
          
          return alert;
        })
      );
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoResolveEnabled, isMonitoring]);

  // Actualizează metricile de sănătate
  useEffect(() => {
    if (!isMonitoring) return;

    const updateHealth = () => {
      const metrics = generateHealthMetrics();
      const alerts = generateHealthAlerts(metrics);
      const health = calculateSystemHealth(metrics, alerts);
      
      setHealthMetrics(metrics);
      setHealthAlerts(prev => [...prev, ...alerts]);
      setSystemHealth(health);
    };

    updateHealth();
    
    const interval = setInterval(updateHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [isMonitoring, generateHealthMetrics, generateHealthAlerts, calculateSystemHealth]);

  // Acknowledges un alert
  const acknowledgeAlert = (alertId: string) => {
    setHealthAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
        return 'bg-green-500';
      case 'warning':
      case 'fair':
        return 'bg-yellow-500';
      case 'critical':
      case 'poor':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'fair':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'offline':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'degrading':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-600';
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? healthMetrics 
    : healthMetrics.filter(m => m.category === selectedCategory);

  const activeAlerts = healthAlerts.filter(a => !a.acknowledged && !a.autoResolved);

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      {systemHealth && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Heart className="w-6 h-6" />
              System Health Overview
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Real-time system health monitoring and automated health checks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {systemHealth.overallScore}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Health Score</div>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {systemHealth.uptime}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Uptime</div>
              </div>
              <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {activeAlerts.length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Active Alerts</div>
              </div>
              <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {systemHealth.criticalIssues}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Critical Issues</div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(systemHealth.status)}>
                  {systemHealth.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(systemHealth.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={runHealthCheck}
                  disabled={isHealthCheckRunning}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isHealthCheckRunning ? 'animate-spin' : ''}`} />
                  {isHealthCheckRunning ? 'Checking...' : 'Run Health Check'}
                </Button>
                <Button
                  onClick={() => setAutoResolveEnabled(!autoResolveEnabled)}
                  variant={autoResolveEnabled ? "default" : "outline"}
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Auto-resolve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Health Metrics
              </CardTitle>
              <CardDescription>
                Real-time health status of system components
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="performance">Performance</option>
                <option value="network">Network</option>
                <option value="security">Security</option>
                <option value="storage">Storage</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(metric.status).replace('bg-', '') }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(metric.status)}
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{metric.value}{metric.unit}</div>
                  <div className="text-xs text-muted-foreground mb-3">{metric.description}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Current</span>
                      <span>{metric.value}{metric.unit}</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                      <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last check: {new Date(metric.lastCheck).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Health Alerts
          </CardTitle>
          <CardDescription>
            Active health alerts and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-sm">Recommendation</span>
                          </div>
                          <p className="text-sm">{alert.recommendation}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                          <span>Metric: {alert.metricId}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="font-medium">No active alerts</p>
              <p className="text-sm">All systems are healthy</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
