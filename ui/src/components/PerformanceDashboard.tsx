import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Gauge,
  BarChart3,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Eye,
  Sparkles,
  Lightbulb,
  Rocket,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useMemo } from 'react';

interface PerformanceMetrics {
  cpu: {
    current: number;
    average: number;
    peak: number;
    trend: 'up' | 'down' | 'stable';
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    trend: 'up' | 'down' | 'stable';
  };
  disk: {
    current: number;
    average: number;
    peak: number;
    trend: 'up' | 'down' | 'stable';
  };
  network: {
    current: number;
    average: number;
    peak: number;
    trend: 'up' | 'down' | 'stable';
  };
  system: {
    uptime: string;
    loadAverage: number;
    responseTime: number;
    throughput: number;
  };
}

interface PerformanceDashboardProps {
  resources: any;
  chartData: any[];
  isMonitoring: boolean;
}

export function PerformanceDashboard({ resources, chartData }: Omit<PerformanceDashboardProps, 'isMonitoring'>) {
  // Calculează metricile de performanță
  const calculateMetrics = (): PerformanceMetrics => {
    if (!chartData.length || !resources) {
      return {
        cpu: { current: 0, average: 0, peak: 0, trend: 'stable' },
        memory: { current: 0, average: 0, peak: 0, trend: 'stable' },
        disk: { current: 0, average: 0, peak: 0, trend: 'stable' },
        network: { current: 0, average: 0, peak: 0, trend: 'stable' },
        system: { uptime: '0h 0m', loadAverage: 0, responseTime: 0, throughput: 0 }
      };
    }

    const cpuValues = chartData.map(d => d.cpu);
    const memoryValues = chartData.map(d => d.memory);
    const diskValues = chartData.map(d => d.disk);
    const networkValues = chartData.map(d => d.network);

    const calculateTrend = (values: number[]) => {
      if (values.length < 3) return 'stable';
      const recent = values.slice(-3);
      const older = values.slice(-6, -3);
      if (older.length === 0) return 'stable';
      
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      
      if (recentAvg > olderAvg * 1.05) return 'up';
      if (recentAvg < olderAvg * 0.95) return 'down';
      return 'stable';
    };

    return {
      cpu: {
        current: resources.cpu?.usage || 0,
        average: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
        peak: Math.max(...cpuValues),
        trend: calculateTrend(cpuValues)
      },
      memory: {
        current: resources.memory?.usage || 0,
        average: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
        peak: Math.max(...memoryValues),
        trend: calculateTrend(memoryValues)
      },
      disk: {
        current: resources.disk?.usage || 0,
        average: diskValues.reduce((a, b) => a + b, 0) / diskValues.length,
        peak: Math.max(...diskValues),
        trend: calculateTrend(diskValues)
      },
      network: {
        current: resources.network?.connections || 0,
        average: networkValues.reduce((a, b) => a + b, 0) / networkValues.length,
        peak: Math.max(...networkValues),
        trend: calculateTrend(networkValues)
      },
      system: {
        uptime: '2h 15m', // Mock data
        loadAverage: 1.2, // Mock data
        responseTime: 45, // Mock data
        throughput: 1250 // Mock data
      }
    };
  };

  const metrics = calculateMetrics();

  // Calculate trends
  const trends = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const recent = chartData.slice(-10);
    const older = chartData.slice(-20, -10);
    
    if (older.length === 0) return null;
    
    const calculateTrend = (path: string[]) => {
      const recentAvg = recent.reduce((sum, m) => {
        let value: any = m;
        for (const p of path) value = value[p];
        return sum + value;
      }, 0) / recent.length;
      
      const olderAvg = older.reduce((sum, m) => {
        let value: any = m;
        for (const p of path) value = value[p];
        return sum + value;
      }, 0) / older.length;
      
      return recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';
    };
    
    return {
      cpu: calculateTrend(['cpu', 'usage']),
      memory: calculateTrend(['memory', 'used']),
      disk: calculateTrend(['disk', 'used']),
      network: calculateTrend(['network', 'download']),
      app: calculateTrend(['app', 'responseTime'])
    };
  }, [chartData]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600" />; // Changed from TrendingDownIcon to TrendingUp
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />; // Changed from Minus to TrendingUp
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'text-green-600';
    if (value < threshold * 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'Optimal';
    if (value < threshold * 0.9) return 'Good';
    return 'High';
  };

  const overallPerformance = Math.round(
    (metrics.cpu.current < 80 ? 100 : Math.max(0, 100 - (metrics.cpu.current - 80) * 2)) * 0.4 +
    (metrics.memory.current < 85 ? 100 : Math.max(0, 100 - (metrics.memory.current - 85) * 2)) * 0.4 +
    (metrics.disk.current < 90 ? 100 : Math.max(0, 100 - (metrics.disk.current - 90) * 2)) * 0.2
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-600" />
            Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitorizare detaliată a performanței sistemului
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

      {/* Overall Performance Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Rocket className="w-6 h-6" />
            Overall System Performance
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Scorul general de performanță al sistemului
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallPerformance}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Overall Score</div>
            </div>
            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.system.uptime}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Uptime</div>
            </div>
            <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.system.loadAverage}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Load Average</div>
            </div>
            <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.system.responseTime}ms
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">CPU Performance</CardTitle>
            <Cpu className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.cpu.current}%</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Avg: {metrics.cpu.average.toFixed(1)}% • Peak: {metrics.cpu.peak.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metrics.cpu.trend)}
              <span className={`text-xs ${getTrendColor(metrics.cpu.trend)}`}>
                {metrics.cpu.trend.toUpperCase()}
              </span>
            </div>
            <Progress value={metrics.cpu.current} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Memory Performance</CardTitle>
            <MemoryStick className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.memory.current}%</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Avg: {metrics.memory.average.toFixed(1)}% • Peak: {metrics.memory.peak.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metrics.memory.trend)}
              <span className={`text-xs ${getTrendColor(metrics.memory.trend)}`}>
                {metrics.memory.trend.toUpperCase()}
              </span>
            </div>
            <Progress value={metrics.memory.current} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Disk Performance</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.disk.current}%</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Avg: {metrics.disk.average.toFixed(1)}% • Peak: {metrics.disk.peak.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metrics.disk.trend)}
              <span className={`text-xs ${getTrendColor(metrics.disk.trend)}`}>
                {metrics.disk.trend.toUpperCase()}
              </span>
            </div>
            <Progress value={metrics.disk.current} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Network Performance</CardTitle>
            <Network className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.network.current}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Avg: {metrics.network.average.toFixed(1)} • Peak: {metrics.network.peak.toFixed(1)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metrics.network.trend)}
              <span className={`text-xs ${getTrendColor(metrics.network.trend)}`}>
                {metrics.network.trend.toUpperCase()}
              </span>
            </div>
            <Progress value={(metrics.network.current / 100) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Details
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  CPU Performance Details
                </CardTitle>
                <CardDescription>
                  Analiza detaliată a performanței CPU
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage:</span>
                    <span className={`font-semibold ${getPerformanceColor(metrics.cpu.current, 80)}`}>
                      {metrics.cpu.current}%
                    </span>
                  </div>
                  <Progress value={metrics.cpu.current} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Average Usage:</span>
                    <span className="font-semibold">{metrics.cpu.average.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpu.average} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Peak Usage:</span>
                    <span className="font-semibold">{metrics.cpu.peak.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpu.peak} className="h-2" />
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">Performance Status</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    CPU performance is {getPerformanceStatus(metrics.cpu.current, 80)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Memory Performance Details
                </CardTitle>
                <CardDescription>
                  Analiza detaliată a performanței memoriei
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage:</span>
                    <span className={`font-semibold ${getPerformanceColor(metrics.memory.current, 85)}`}>
                      {metrics.memory.current}%
                    </span>
                  </div>
                  <Progress value={metrics.memory.current} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Average Usage:</span>
                    <span className="font-semibold">{metrics.memory.average.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memory.average} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Peak Usage:</span>
                    <span className="font-semibold">{metrics.memory.peak.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memory.peak} className="h-2" />
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm">Performance Status</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Memory performance is {getPerformanceStatus(metrics.memory.current, 85)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Analiza tendințelor de performanță în timp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">CPU Trends</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metrics.cpu.trend)}
                      <span className={`font-medium ${getTrendColor(metrics.cpu.trend)}`}>
                        {metrics.cpu.trend.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current: {metrics.cpu.current}% • Average: {metrics.cpu.average.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Memory Trends</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metrics.memory.trend)}
                      <span className={`font-medium ${getTrendColor(metrics.memory.trend)}`}>
                        {metrics.memory.trend.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current: {metrics.memory.current}% • Average: {metrics.memory.average.toFixed(1)}%
                    </p>
                  </div>
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
                Performance Insights
              </CardTitle>
              <CardDescription>
                Insights și recomandări pentru optimizarea performanței
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">CPU Optimization</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {metrics.cpu.current < 60 ? 'CPU usage is optimal. System has good headroom.' : 
                     metrics.cpu.current < 80 ? 'CPU usage is good. Monitor for potential bottlenecks.' : 
                     'CPU usage is high. Consider optimizing processes or scaling resources.'}
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm">Memory Management</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {metrics.memory.current < 70 ? 'Memory usage is optimal. Good resource management.' : 
                     metrics.memory.current < 85 ? 'Memory usage is acceptable. Monitor for memory leaks.' : 
                     'Memory usage is high. Consider memory optimization or expansion.'}
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm">System Recommendations</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {overallPerformance >= 90 ? 'System is performing excellently. Continue current practices.' : 
                     overallPerformance >= 75 ? 'System is performing well. Minor optimizations may help.' : 
                     'System needs attention. Focus on resource optimization and monitoring.'}
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

export default PerformanceDashboard;
