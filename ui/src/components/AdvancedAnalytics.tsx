import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Lightbulb,
  Gauge,
  Sparkles,
  Minus,
  Play,
  Pause
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'performance' | 'efficiency' | 'quality' | 'capacity';
}

interface MLInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'correlation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  actionable: boolean;
  recommendation: string;
}

interface AdvancedAnalyticsProps {
  chartData: any[];
  resources: any;
  isMonitoring: boolean;
}

export function AdvancedAnalytics({ chartData, isMonitoring }: Omit<AdvancedAnalyticsProps, 'resources'>) {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Generează metrici avansate
  useEffect(() => {
    if (!isMonitoring || !chartData.length) return;

    const generateAdvancedMetrics = () => {
      const newMetrics: AnalyticsMetric[] = [];

      // Performance Metrics
      if (chartData.length > 5) {
        const cpuValues = chartData.map(d => d.cpu);
        const memoryValues = chartData.map(d => d.memory);
        
        // CPU Efficiency
        const cpuEfficiency = calculateEfficiency(cpuValues);
        newMetrics.push({
          id: 'cpu-efficiency',
          name: 'CPU Efficiency',
          value: cpuEfficiency,
          unit: '%',
          trend: getTrend(cpuValues),
          change: calculateChange(cpuValues),
          target: 85,
          status: getStatus(cpuEfficiency, 85),
          category: 'efficiency'
        });

        // Memory Efficiency
        const memoryEfficiency = calculateEfficiency(memoryValues);
        newMetrics.push({
          id: 'memory-efficiency',
          name: 'Memory Efficiency',
          value: memoryEfficiency,
          unit: '%',
          trend: getTrend(memoryValues),
          change: calculateChange(memoryValues),
          target: 80,
          status: getStatus(memoryEfficiency, 80),
          category: 'efficiency'
        });

        // System Performance
        const systemPerformance = calculateSystemPerformance(chartData);
        newMetrics.push({
          id: 'system-performance',
          name: 'System Performance',
          value: systemPerformance,
          unit: '%',
          trend: getTrend(chartData.map(d => (d.cpu + d.memory) / 2)),
          change: calculateChange(chartData.map(d => (d.cpu + d.memory) / 2)),
          target: 90,
          status: getStatus(systemPerformance, 90),
          category: 'performance'
        });

        // Quality Score
        const qualityScore = calculateQualityScore(chartData);
        newMetrics.push({
          id: 'quality-score',
          name: 'Quality Score',
          value: qualityScore,
          unit: '%',
          trend: getTrend(chartData.map(d => d.cpu)),
          change: calculateChange(chartData.map(d => d.cpu)),
          target: 95,
          status: getStatus(qualityScore, 95),
          category: 'quality'
        });

        // Capacity Utilization
        const capacityUtilization = calculateCapacityUtilization(chartData);
        newMetrics.push({
          id: 'capacity-utilization',
          name: 'Capacity Utilization',
          value: capacityUtilization,
          unit: '%',
          trend: getTrend(chartData.map(d => d.memory)),
          change: calculateChange(chartData.map(d => d.memory)),
          target: 75,
          status: getStatus(capacityUtilization, 75),
          category: 'capacity'
        });
      }

      setMetrics(newMetrics);
    };

    generateAdvancedMetrics();
    
    // Update metrics every 10 seconds when monitoring
    const interval = setInterval(generateAdvancedMetrics, 10000);
    return () => clearInterval(interval);
  }, [isMonitoring, chartData]);

  // Generează insights ML
  useEffect(() => {
    if (!isMonitoring) return;

    const generateMLInsights = () => {
      const newInsights: MLInsight[] = [
        {
          id: 'insight-1',
          type: 'pattern',
          title: 'CPU Usage Pattern Detected',
          description: 'Identified consistent CPU usage pattern during peak hours',
          confidence: 87.3,
          impact: 'medium',
          timestamp: new Date().toISOString(),
          actionable: true,
          recommendation: 'Consider load balancing during 2-4 PM peak hours'
        },
        {
          id: 'insight-2',
          type: 'anomaly',
          title: 'Memory Spike Anomaly',
          description: 'Unusual memory usage spike detected at 3:15 PM',
          confidence: 92.1,
          impact: 'high',
          timestamp: new Date().toISOString(),
          actionable: true,
          recommendation: 'Investigate potential memory leak in background processes'
        },
        {
          id: 'insight-3',
          type: 'correlation',
          title: 'CPU-Memory Correlation',
          description: 'Strong correlation found between CPU and memory usage',
          confidence: 78.9,
          impact: 'low',
          timestamp: new Date().toISOString(),
          actionable: false,
          recommendation: 'Monitor for potential resource contention'
        },
        {
          id: 'insight-4',
          type: 'prediction',
          title: 'Performance Degradation Forecast',
          description: 'AI predicts 15% performance drop within 2 hours',
          confidence: 84.2,
          impact: 'high',
          timestamp: new Date().toISOString(),
          actionable: true,
          recommendation: 'Preemptively scale resources or restart services'
        }
      ];

      setInsights(newInsights);
    };

    generateMLInsights();
    
    // Update insights every 30 seconds
    const interval = setInterval(generateMLInsights, 30000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const calculateEfficiency = (values: number[]): number => {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(Math.min(100, (avg / 100) * 100));
  };

  const getTrend = (values: number[]): 'up' | 'down' | 'stable' => {
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

  const calculateChange = (values: number[]): number => {
    if (values.length < 2) return 0;
    const current = values[values.length - 1];
    const previous = values[values.length - 2];
    return Math.round(((current - previous) / previous) * 100);
  };

  const getStatus = (value: number, target: number): 'excellent' | 'good' | 'warning' | 'critical' => {
    if (value >= target * 1.1) return 'excellent';
    if (value >= target) return 'good';
    if (value >= target * 0.8) return 'warning';
    return 'critical';
  };

  const calculateSystemPerformance = (data: any[]): number => {
    if (data.length === 0) return 0;
    const avgCPU = data.reduce((sum, d) => sum + d.cpu, 0) / data.length;
    const avgMemory = data.reduce((sum, d) => sum + d.memory, 0) / data.length;
    return Math.round((avgCPU + avgMemory) / 2);
  };

  const calculateQualityScore = (data: any[]): number => {
    if (data.length === 0) return 0;
    const stability = data.filter(d => Math.abs(d.cpu - (data[0]?.cpu || 0)) < 10).length / data.length;
    return Math.round(stability * 100);
  };

  const calculateCapacityUtilization = (data: any[]): number => {
    if (data.length === 0) return 0;
    const maxMemory = Math.max(...data.map(d => d.memory));
    return Math.round((maxMemory / 100) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <BarChart3 className="w-4 h-4" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />;
      case 'correlation':
        return <Target className="w-4 h-4" />;
      case 'prediction':
        return <Brain className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const overallScore = metrics.length > 0 
    ? Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length)
    : 0;

  const excellentMetrics = metrics.filter(m => m.status === 'excellent').length;
  const criticalMetrics = metrics.filter(m => m.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Advanced Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Analiză avansată a performanței sistemului cu insights AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnalyzing(!isAnalyzing)}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Analysis
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Analysis
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Overall Score</CardTitle>
            <Gauge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{overallScore}%</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {metrics.length} metrics analyzed
            </p>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Excellent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{excellentMetrics}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {metrics.length > 0 ? Math.round((excellentMetrics / metrics.length) * 100) : 0}% of total
            </p>
            <Progress value={metrics.length > 0 ? (excellentMetrics / metrics.length) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {metrics.filter(m => m.status === 'warning').length}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Needs attention
            </p>
            <Progress value={metrics.length > 0 ? (metrics.filter(m => m.status === 'warning').length / metrics.length) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalMetrics}</div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Immediate action required
            </p>
            <Progress value={metrics.length > 0 ? (criticalMetrics / metrics.length) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends & Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by Category:</span>
            <div className="flex gap-2">
              {['all', 'performance', 'efficiency', 'quality', 'capacity'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{metric.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`}></div>
                  </div>
                  <CardDescription className="text-xs">
                    Target: {metric.target}{metric.unit}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <Progress value={Math.min((metric.value / metric.target) * 100, 100)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="capitalize">
                      {metric.status}
                    </Badge>
                    <span className="text-muted-foreground capitalize">
                      {metric.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Machine Learning Insights
              </CardTitle>
              <CardDescription>
                Insights și recomandări generate de AI pentru optimizarea sistemului
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(insight.type)}
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={insight.actionable ? 'default' : 'secondary'}>
                          {insight.actionable ? 'Actionable' : 'Informational'}
                        </Badge>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{insight.confidence}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{insight.type}</div>
                        <div className="text-xs text-muted-foreground">Type</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-sm text-muted-foreground">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Timestamp</div>
                      </div>
                    </div>

                    {insight.actionable && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-sm">Recommendation</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends & Patterns
              </CardTitle>
              <CardDescription>
                Analiza tendințelor și pattern-urilor de performanță
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Trend Analysis</h4>
                    <div className="space-y-3">
                      {metrics.filter(m => m.trend !== 'stable').map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            {getTrendIcon(metric.trend)}
                            <span className="font-medium">{metric.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.change >= 0 ? '+' : ''}{metric.change}%
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {metric.trend}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Excellent (90-100%)</span>
                        <span className="font-semibold text-green-600">
                          {metrics.filter(m => m.value >= 90).length}
                        </span>
                      </div>
                      <Progress value={metrics.length > 0 ? (metrics.filter(m => m.value >= 90).length / metrics.length) * 100 : 0} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Good (70-89%)</span>
                        <span className="font-semibold text-blue-600">
                          {metrics.filter(m => m.value >= 70 && m.value < 90).length}
                        </span>
                      </div>
                      <Progress value={metrics.length > 0 ? (metrics.filter(m => m.value >= 70 && m.value < 90).length / metrics.length) * 100 : 0} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Warning (50-69%)</span>
                        <span className="font-semibold text-yellow-600">
                          {metrics.filter(m => m.value >= 50 && m.value < 70).length}
                        </span>
                      </div>
                      <Progress value={metrics.length > 0 ? (metrics.filter(m => m.value >= 50 && m.value < 70).length / metrics.length) * 100 : 0} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Critical (&lt;50%)</span>
                        <span className="font-semibold text-red-600">
                          {metrics.filter(m => m.value < 50).length}
                        </span>
                      </div>
                      <Progress value={metrics.length > 0 ? (metrics.filter(m => m.value < 50).length / metrics.length) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
