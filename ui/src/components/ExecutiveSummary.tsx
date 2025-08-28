import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  BarChart3,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Shield,
  Zap,
  Brain,
  Server,
  Database,
  Globe,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Lightbulb,
  Award,
  Star,
  Clock3,
  Timer,
  Gauge,
  PieChart,
  LineChart
} from 'lucide-react';

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'performance' | 'availability' | 'security' | 'efficiency' | 'cost';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SLAMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  status: 'compliant' | 'at-risk' | 'breached';
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdate: string;
  description: string;
}

interface SystemOverview {
  overallHealth: number;
  uptime: string;
  activeUsers: number;
  totalProcesses: number;
  criticalAlerts: number;
  performanceScore: number;
  securityScore: number;
  efficiencyScore: number;
  lastIncident: string;
  maintenanceWindow: string;
}

interface ExecutiveSummaryProps {
  resources: any;
  processes: any[];
  isMonitoring: boolean;
  chartData: any[];
}

export function ExecutiveSummary({ 
  resources, 
  processes, 
  isMonitoring, 
  chartData 
}: ExecutiveSummaryProps) {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'business' | 'sla' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [showDetails, setShowDetails] = useState(false);

  // Generează metrici de business
  useEffect(() => {
    if (!isMonitoring || !resources) return;

    const generateBusinessMetrics = () => {
      const metrics: BusinessMetric[] = [];

      // System Performance
      const performanceScore = calculatePerformanceScore(resources);
      metrics.push({
        id: 'system-performance',
        name: 'System Performance',
        value: performanceScore,
        unit: '%',
        change: 2.3,
        changeType: 'increase',
        target: 90,
        status: performanceScore >= 90 ? 'excellent' : performanceScore >= 75 ? 'good' : performanceScore >= 60 ? 'warning' : 'critical',
        category: 'performance',
        trend: 'up',
        description: 'Overall system performance and responsiveness'
      });

      // System Availability
      const availability = calculateAvailability();
      metrics.push({
        id: 'system-availability',
        name: 'System Availability',
        value: availability,
        unit: '%',
        change: 0.1,
        changeType: 'increase',
        target: 99.9,
        status: availability >= 99.9 ? 'excellent' : availability >= 99.5 ? 'good' : availability >= 99 ? 'warning' : 'critical',
        category: 'availability',
        trend: 'stable',
        description: 'System uptime and availability percentage'
      });

      // Resource Efficiency
      const efficiency = calculateResourceEfficiency(resources);
      metrics.push({
        id: 'resource-efficiency',
        name: 'Resource Efficiency',
        value: efficiency,
        unit: '%',
        change: -1.2,
        changeType: 'decrease',
        target: 85,
        status: efficiency >= 85 ? 'excellent' : efficiency >= 70 ? 'good' : efficiency >= 55 ? 'warning' : 'critical',
        category: 'efficiency',
        trend: 'down',
        description: 'Optimal resource utilization and efficiency'
      });

      // Security Posture
      const securityScore = calculateSecurityScore();
      metrics.push({
        id: 'security-posture',
        name: 'Security Posture',
        value: securityScore,
        unit: '%',
        change: 0.5,
        changeType: 'increase',
        target: 95,
        status: securityScore >= 95 ? 'excellent' : securityScore >= 90 ? 'good' : securityScore >= 80 ? 'warning' : 'critical',
        category: 'security',
        trend: 'up',
        description: 'Overall system security and compliance status'
      });

      // Cost Optimization
      const costOptimization = calculateCostOptimization(resources);
      metrics.push({
        id: 'cost-optimization',
        name: 'Cost Optimization',
        value: costOptimization,
        unit: '%',
        change: 3.1,
        changeType: 'increase',
        target: 80,
        status: costOptimization >= 80 ? 'excellent' : costOptimization >= 65 ? 'good' : costOptimization >= 50 ? 'warning' : 'critical',
        category: 'cost',
        trend: 'up',
        description: 'Resource cost optimization and efficiency'
      });

      setBusinessMetrics(metrics);
    };

    generateBusinessMetrics();
    
    const interval = setInterval(generateBusinessMetrics, 30000);
    return () => clearInterval(interval);
  }, [isMonitoring, resources]);

  // Generează metrici SLA
  useEffect(() => {
    if (!isMonitoring) return;

    const generateSLAMetrics = () => {
      const metrics: SLAMetric[] = [
        {
          id: 'uptime-sla',
          name: 'Uptime SLA',
          current: 99.97,
          target: 99.9,
          status: 'compliant',
          trend: 'stable',
          lastUpdate: new Date().toISOString(),
          description: 'System uptime compliance target: 99.9%'
        },
        {
          id: 'response-time-sla',
          name: 'Response Time SLA',
          current: 45,
          target: 100,
          status: 'compliant',
          trend: 'improving',
          lastUpdate: new Date().toISOString(),
          description: 'API response time target: <100ms'
        },
        {
          id: 'availability-sla',
          name: 'Availability SLA',
          current: 99.95,
          target: 99.5,
          status: 'compliant',
          trend: 'stable',
          lastUpdate: new Date().toISOString(),
          description: 'Service availability target: 99.5%'
        },
        {
          id: 'performance-sla',
          name: 'Performance SLA',
          current: 87.3,
          target: 85,
          status: 'compliant',
          trend: 'improving',
          lastUpdate: new Date().toISOString(),
          description: 'System performance target: >85%'
        },
        {
          id: 'security-sla',
          name: 'Security SLA',
          current: 96.8,
          target: 95,
          status: 'compliant',
          trend: 'stable',
          lastUpdate: new Date().toISOString(),
          description: 'Security compliance target: >95%'
        }
      ];

      setSlaMetrics(metrics);
    };

    generateSLAMetrics();
    
    const interval = setInterval(generateSLAMetrics, 60000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Generează overview-ul sistemului
  useEffect(() => {
    if (!isMonitoring || !resources || !processes) return;

    const generateSystemOverview = () => {
      const overview: SystemOverview = {
        overallHealth: calculateOverallHealth(),
        uptime: '15d 7h 32m',
        activeUsers: Math.floor(Math.random() * 50) + 25,
        totalProcesses: processes.length,
        criticalAlerts: Math.floor(Math.random() * 5),
        performanceScore: calculatePerformanceScore(resources),
        securityScore: calculateSecurityScore(),
        efficiencyScore: calculateResourceEfficiency(resources),
        lastIncident: '2024-01-10 14:30:00',
        maintenanceWindow: '2024-01-20 02:00:00 - 04:00:00'
      };

      setSystemOverview(overview);
    };

    generateSystemOverview();
    
    const interval = setInterval(generateSystemOverview, 45000);
    return () => clearInterval(interval);
  }, [isMonitoring, resources, processes]);

  // Calculează scorul de performanță
  const calculatePerformanceScore = (resources: any) => {
    if (!resources) return 0;
    
    const cpuScore = Math.max(0, 100 - (resources.cpu?.usage || 0));
    const memoryScore = Math.max(0, 100 - (resources.memory?.usage || 0));
    const diskScore = Math.max(0, 100 - (resources.disk?.usage || 0));
    
    return Math.round((cpuScore + memoryScore + diskScore) / 3);
  };

  // Calculează disponibilitatea
  const calculateAvailability = () => {
    // Simulează calculul disponibilității
    return 99.97 + (Math.random() * 0.06);
  };

  // Calculează eficiența resurselor
  const calculateResourceEfficiency = (resources: any) => {
    if (!resources) return 0;
    
    const cpuEfficiency = Math.min(100, (resources.cpu?.usage || 0) * 1.2);
    const memoryEfficiency = Math.min(100, (resources.memory?.usage || 0) * 1.1);
    const diskEfficiency = Math.min(100, (resources.disk?.usage || 0) * 1.3);
    
    return Math.round((cpuEfficiency + memoryEfficiency + diskEfficiency) / 3);
  };

  // Calculează scorul de securitate
  const calculateSecurityScore = () => {
    // Simulează calculul scorului de securitate
    return 95 + (Math.random() * 5);
  };

  // Calculează optimizarea costurilor
  const calculateCostOptimization = (resources: any) => {
    if (!resources) return 0;
    
    const utilization = (resources.cpu?.usage || 0) + (resources.memory?.usage || 0) + (resources.disk?.usage || 0);
    const efficiency = Math.max(0, 100 - (utilization / 3));
    
    return Math.round(efficiency);
  };

  // Calculează sănătatea generală
  const calculateOverallHealth = () => {
    if (!resources) return 0;
    
    const performance = calculatePerformanceScore(resources);
    const security = calculateSecurityScore();
    const efficiency = calculateResourceEfficiency(resources);
    
    return Math.round((performance + security + efficiency) / 3);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'compliant':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
      case 'at-risk':
        return 'bg-yellow-500';
      case 'critical':
      case 'breached':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down':
      case 'degrading':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'availability':
        return <Server className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'efficiency':
        return <Gauge className="w-4 h-4" />;
      case 'cost':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSLAIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'breached':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredMetrics = businessMetrics.filter(m => 
    selectedView === 'overview' || m.category === selectedView.replace('s', '')
  );

  return (
    <div className="space-y-6">
      {/* Executive Dashboard Header */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <BarChart3 className="w-6 h-6" />
            Executive Summary Dashboard
          </CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            High-level business metrics, SLA compliance, and system overview for executive decision making
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      {systemOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Overview
            </CardTitle>
            <CardDescription>
              High-level system health and operational metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {systemOverview.overallHealth}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Overall Health</div>
                <div className="mt-2">
                  <Progress value={systemOverview.overallHealth} className="h-2" />
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {systemOverview.uptime}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">System Uptime</div>
                <div className="mt-2 text-xs text-blue-500 dark:text-blue-300">
                  Last incident: {new Date(systemOverview.lastIncident).toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {systemOverview.activeUsers}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Active Users</div>
                <div className="mt-2 text-xs text-purple-500 dark:text-purple-300">
                  {systemOverview.totalProcesses} processes running
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {systemOverview.criticalAlerts}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Critical Alerts</div>
                <div className="mt-2 text-xs text-orange-500 dark:text-orange-300">
                  Requires immediate attention
                </div>
              </div>
            </div>

            {showDetails && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Performance Score</span>
                  </div>
                  <div className="text-2xl font-bold">{systemOverview.performanceScore}%</div>
                  <Progress value={systemOverview.performanceScore} className="h-2 mt-2" />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Security Score</span>
                  </div>
                  <div className="text-2xl font-bold">{systemOverview.securityScore.toFixed(1)}%</div>
                  <Progress value={systemOverview.securityScore} className="h-2 mt-2" />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Efficiency Score</span>
                  </div>
                  <div className="text-2xl font-bold">{systemOverview.efficiencyScore}%</div>
                  <Progress value={systemOverview.efficiencyScore} className="h-2 mt-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Business Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators and business metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedView === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('overview')}
              >
                Overview
              </Button>
              <Button
                variant={selectedView === 'business' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('business')}
              >
                Business
              </Button>
              <Button
                variant={selectedView === 'sla' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('sla')}
              >
                SLA
              </Button>
              <Button
                variant={selectedView === 'trends' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('trends')}
              >
                Trends
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric) => (
                <Card key={metric.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(metric.status).replace('bg-', '') }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(metric.category)}
                        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{metric.value}{metric.unit}</div>
                    <div className="text-xs text-muted-foreground mb-3">{metric.description}</div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      {getTrendIcon(metric.trend)}
                      <span className={getChangeColor(metric.changeType)}>
                        {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-muted-foreground">from last period</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Current</span>
                        <span>Target</span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground text-center">
                        Target: {metric.target}{metric.unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedView === 'sla' && (
            <div className="space-y-4">
              {slaMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getSLAIcon(metric.status)}
                      <div>
                        <h4 className="font-semibold">{metric.name}</h4>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{metric.current}</div>
                      <div className="text-sm text-muted-foreground">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{metric.target}</div>
                      <div className="text-sm text-muted-foreground">Target</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metric.current >= metric.target ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Status</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground text-center">
                    Last updated: {new Date(metric.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedView === 'trends' && (
            <div className="text-center py-8 text-muted-foreground">
              <LineChart className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Trend Analysis</p>
              <p className="text-sm">Historical trend data and analysis will be displayed here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated insights and strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Positive Trends</span>
              </div>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• System performance improved by 2.3% this period</li>
                <li>• Security posture strengthened with 0.5% increase</li>
                <li>• All SLA targets currently met or exceeded</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Areas for Attention</span>
              </div>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Resource efficiency decreased by 1.2%</li>
                <li>• Monitor disk usage trends closely</li>
                <li>• Consider resource optimization strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
