import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock,
  Unlock,
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Globe,
  Server,
  Database,
  FileText,
  Smartphone
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SecurityMetric {
  name: string;
  value: number;
  total: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  lastUpdated: Date;
}

interface SecurityAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

interface SecuritySummary {
  overallScore: number;
  activeThreats: number;
  vulnerabilities: number;
  compliance: number;
  lastScan: Date;
  nextScan: Date;
}

export function SecurityMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data generator pentru demo
  const generateMockData = useCallback(() => {
    const mockMetrics: SecurityMetric[] = [
      {
        name: 'MFA Adoption',
        value: 85,
        total: 100,
        status: 'good',
        trend: 'up',
        description: 'Percentage of users with MFA enabled',
        lastUpdated: new Date()
      },
      {
        name: 'Security Headers',
        value: 92,
        total: 100,
        status: 'good',
        trend: 'stable',
        description: 'Security headers compliance score',
        lastUpdated: new Date()
      },
      {
        name: 'Rate Limiting',
        value: 78,
        total: 100,
        status: 'warning',
        trend: 'up',
        description: 'API rate limiting effectiveness',
        lastUpdated: new Date()
      },
      {
        name: 'Audit Logging',
        value: 95,
        total: 100,
        status: 'good',
        trend: 'stable',
        description: 'Security event logging coverage',
        lastUpdated: new Date()
      },
      {
        name: 'PWA Security',
        value: 88,
        total: 100,
        status: 'good',
        trend: 'up',
        description: 'Progressive Web App security score',
        lastUpdated: new Date()
      },
      {
        name: 'Database Security',
        value: 82,
        total: 100,
        status: 'warning',
        trend: 'down',
        description: 'Database access and encryption',
        lastUpdated: new Date()
      }
    ];

    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Rate Limiting Threshold',
        message: 'API rate limiting is approaching threshold for /api/ai/analyze endpoint',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        acknowledged: false,
        source: 'Rate Limiting System'
      },
      {
        id: '2',
        type: 'info',
        title: 'Security Scan Completed',
        message: 'Automated security scan completed successfully. No critical vulnerabilities found.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        acknowledged: true,
        source: 'Security Scanner'
      },
      {
        id: '3',
        type: 'error',
        title: 'Failed Login Attempts',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        acknowledged: false,
        source: 'Authentication System'
      }
    ];

    const mockSummary: SecuritySummary = {
      overallScore: 87,
      activeThreats: 2,
      vulnerabilities: 3,
      compliance: 94,
      lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextScan: new Date(Date.now() + 6 * 60 * 60 * 1000)
    };

    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setSummary(mockSummary);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      generateMockData();
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100';
      case 'warning': return 'bg-orange-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getOverallScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  if (!summary) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Monitorizare unificată a tuturor aspectelor de securitate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
          >
            {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
      </div>

      {/* Overall Security Score */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Shield className="w-6 h-6" />
            Overall Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className={`text-3xl font-bold ${getOverallScoreColor(summary.overallScore)}`}>
                {summary.overallScore}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Security Score</div>
              <Badge className={`mt-2 ${getOverallScoreBadge(summary.overallScore)}`}>
                {summary.overallScore >= 90 ? 'Excellent' : 
                 summary.overallScore >= 75 ? 'Good' : 
                 summary.overallScore >= 60 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
            <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.activeThreats}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Active Threats</div>
            </div>
            <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {summary.vulnerabilities}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Vulnerabilities</div>
            </div>
            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.compliance}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{metric.name}</span>
                {getTrendIcon(metric.trend)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.value}%</span>
                  <Badge className={`${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </Badge>
                </div>
                <Progress value={metric.value} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {metric.description}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {metric.lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Alerts ({alerts.filter(a => !a.acknowledged).length} Active)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p>No active security alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${getAlertColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.source}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.message}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">MFA System</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Headers</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit Logging</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PWA Security</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>MFA verification successful</span>
                <span className="text-muted-foreground ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Rate limit warning triggered</span>
                <span className="text-muted-foreground ml-auto">15m ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Failed login attempt blocked</span>
                <span className="text-muted-foreground ml-auto">30m ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Security scan completed</span>
                <span className="text-muted-foreground ml-auto">2h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Security Scan Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Last Security Scan</Label>
              <div className="text-sm text-muted-foreground">
                {summary.lastScan.toLocaleString()}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Next Scheduled Scan</Label>
              <div className="text-sm text-muted-foreground">
                {summary.nextScan.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SecurityMonitoringDashboard;
