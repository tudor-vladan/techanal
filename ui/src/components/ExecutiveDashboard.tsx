import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Clock,
  Activity,
  Gauge,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Brain,
  Shield,
  Rocket,
  Eye,
  Sparkles,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { SystemAlerts } from './SystemAlerts';

interface ExecutiveMetrics {
  overallHealth: number;
  systemStatus: 'optimal' | 'good' | 'fair' | 'poor' | 'critical';
  uptime: string;
  activeAlerts: number;
  criticalIssues: number;
  performanceScore: number;
  resourceEfficiency: number;
  securityStatus: 'secure' | 'warning' | 'at-risk';
  lastIncident: string;
  slaCompliance: number;
}

interface ExecutiveDashboardProps {
  resources: any;
  processes: any[];
  isMonitoring: boolean;
}

export function ExecutiveDashboard({ resources, processes }: Omit<ExecutiveDashboardProps, 'isMonitoring'>) {
  // Calculează metricile executive
  const calculateExecutiveMetrics = (): ExecutiveMetrics => {
    if (!resources) {
      return {
        overallHealth: 0,
        systemStatus: 'critical',
        uptime: '0h 0m',
        activeAlerts: 0,
        criticalIssues: 0,
        performanceScore: 0,
        resourceEfficiency: 0,
        securityStatus: 'at-risk',
        lastIncident: 'Never',
        slaCompliance: 0
      };
    }

    // Overall Health Score
    const healthScores = [
      resources.cpu?.usage < 80 ? 100 : Math.max(0, 100 - (resources.cpu?.usage - 80) * 2),
      resources.memory?.usage < 85 ? 100 : Math.max(0, 100 - (resources.memory?.usage - 85) * 2),
      resources.disk?.usage < 90 ? 100 : Math.max(0, 100 - (resources.disk?.usage - 90) * 2)
    ];
    const overallHealth = Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length);

    // System Status
    let systemStatus: 'optimal' | 'good' | 'fair' | 'poor' | 'critical';
    if (overallHealth >= 90) systemStatus = 'optimal';
    else if (overallHealth >= 75) systemStatus = 'good';
    else if (overallHealth >= 60) systemStatus = 'fair';
    else if (overallHealth >= 40) systemStatus = 'poor';
    else systemStatus = 'critical';

    // Performance Score
    const performanceScore = Math.round(
      (resources.cpu?.usage < 80 ? 100 : Math.max(0, 100 - (resources.cpu?.usage - 80) * 2)) * 0.4 +
      (resources.memory?.usage < 85 ? 100 : Math.max(0, 100 - (resources.memory?.usage - 85) * 2)) * 0.4 +
      (resources.disk?.usage < 90 ? 100 : Math.max(0, 100 - (resources.disk?.usage - 90) * 2)) * 0.2
    );

    // Resource Efficiency
    const resourceEfficiency = Math.round(
      (Math.min(resources.cpu?.usage || 0, 80) / 80) * 40 +
      (Math.min(resources.memory?.usage || 0, 85) / 85) * 40 +
      (Math.min(resources.disk?.usage || 0, 90) / 90) * 20
    );

    // Calculate real alerts based on resource thresholds
    let activeAlerts = 0;
    let criticalIssues = 0;
    
    if (resources.cpu?.usage > 80) {
      activeAlerts++;
      if (resources.cpu?.usage > 95) criticalIssues++;
    }
    if (resources.memory?.usage > 85) {
      activeAlerts++;
      if (resources.memory?.usage > 95) criticalIssues++;
    }
    if (resources.disk?.usage > 90) {
      activeAlerts++;
      if (resources.disk?.usage > 95) criticalIssues++;
    }
    if (resources.network?.connections > 75) {
      activeAlerts++;
      if (resources.network?.connections > 95) criticalIssues++;
    }

    // Security Status (based on overall health)
    const securityStatus: 'secure' | 'warning' | 'at-risk' = 
      overallHealth >= 80 ? 'secure' : overallHealth >= 60 ? 'warning' : 'at-risk';

    // SLA Compliance (based on overall health)
    const slaCompliance = overallHealth >= 90 ? 99.9 : overallHealth >= 75 ? 98.5 : overallHealth >= 60 ? 95.0 : 85.0;

    return {
      overallHealth,
      systemStatus,
      uptime: '2h 15m', // Mock data - could be enhanced with real uptime
      activeAlerts,
      criticalIssues,
      performanceScore,
      resourceEfficiency,
      securityStatus,
      lastIncident: activeAlerts > 0 ? new Date().toLocaleString() : 'Never',
      slaCompliance
    };
  };

  const metrics = calculateExecutiveMetrics();

  const getSecurityColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'at-risk':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSecurityIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'poor':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const runningProcesses = processes.filter(p => p.status === 'running').length;
  const stoppedProcesses = processes.filter(p => p.status === 'stopped').length;
  const errorProcesses = processes.filter(p => p.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-600" />
            Executive Dashboard
          </h2>
          <p className="text-muted-foreground">
            Overview executiv al sănătății și performanței sistemului
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">System Health</CardTitle>
            {getStatusIcon(metrics.systemStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.overallHealth}%</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Status: {metrics.systemStatus.toUpperCase()}
            </p>
            <Progress value={metrics.overallHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Performance</CardTitle>
            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.performanceScore}%</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Resource efficiency: {metrics.resourceEfficiency}%
            </p>
            <Progress value={metrics.performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Security</CardTitle>
            {getSecurityIcon(metrics.securityStatus)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityColor(metrics.securityStatus)}`}>
              {metrics.securityStatus.toUpperCase()}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Last incident: {metrics.lastIncident}
            </p>
            <Progress value={metrics.securityStatus === 'secure' ? 100 : metrics.securityStatus === 'warning' ? 60 : 30} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">SLA Compliance</CardTitle>
            <Gauge className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.slaCompliance}%</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Uptime: {metrics.uptime}
            </p>
            <Progress value={metrics.slaCompliance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
            <Activity className="w-6 h-6" />
            System Status Overview
          </CardTitle>
          <CardDescription className="text-indigo-700 dark:text-indigo-300">
            Status-ul complet al sistemului și proceselor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {runningProcesses}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Running Processes</div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {processes.length > 0 ? Math.round((runningProcesses / processes.length) * 100) : 0}%
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stoppedProcesses}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Stopped Processes</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                {processes.length > 0 ? Math.round((stoppedProcesses / processes.length) * 100) : 0}%
              </div>
            </div>
            <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {errorProcesses}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Error Processes</div>
              <div className="text-xs text-red-600 dark:text-red-400">
                {processes.length > 0 ? Math.round((errorProcesses / processes.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Metrici detaliate de performanță
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Performance:</span>
                    <span className="font-semibold">
                      {resources?.cpu?.usage < 80 ? 'Optimal' : 'Sub-optimal'}
                    </span>
                  </div>
                  <Progress value={resources?.cpu?.usage || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Performance:</span>
                    <span className="font-semibold">
                      {resources?.memory?.usage < 85 ? 'Optimal' : 'Sub-optimal'}
                    </span>
                  </div>
                  <Progress value={resources?.memory?.usage || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Performance:</span>
                    <span className="font-semibold">
                      {resources?.disk?.usage < 90 ? 'Optimal' : 'Sub-optimal'}
                    </span>
                  </div>
                  <Progress value={resources?.disk?.usage || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>
                  Status-ul securității și conformitatea SLA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm">SLA Compliance</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Meeting {metrics.slaCompliance}% of service level agreements
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">Security Status</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    System security is {metrics.securityStatus}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Uptime</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    System running for {metrics.uptime}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts & Issues
              </CardTitle>
              <CardDescription>
                Monitorizează alertele active și problemele critice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-semibold">Active Alerts</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{metrics.activeAlerts}</div>
                    <p className="text-sm text-muted-foreground">Requires attention</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-semibold">Critical Issues</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
                    <p className="text-sm text-muted-foreground">Immediate action required</p>
                  </div>
                </div>
                
                {/* Detailed Alerts */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 text-lg">Alert Details</h4>
                  <SystemAlerts 
                    resources={{
                      cpu: resources?.cpu?.usage || 0,
                      memory: resources?.memory?.usage || 0,
                      disk: resources?.disk?.usage || 0,
                      network: resources?.network?.connections || 0
                    }}
                    isMonitoring={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Executive Insights
              </CardTitle>
              <CardDescription>
                Insights și recomandări pentru management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">Performance Insight</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    System performance is {metrics.performanceScore >= 80 ? 'excellent' : metrics.performanceScore >= 60 ? 'good' : 'needs improvement'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm">Resource Optimization</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Resource efficiency at {metrics.resourceEfficiency}% - {metrics.resourceEfficiency >= 80 ? 'optimal utilization' : 'room for improvement'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm">Recommendation</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {metrics.overallHealth >= 90 ? 'System is performing optimally. Continue current practices.' : 
                     metrics.overallHealth >= 75 ? 'System is performing well. Monitor for potential issues.' : 
                     'System needs attention. Consider resource optimization and monitoring.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
