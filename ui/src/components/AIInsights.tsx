import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'performance' | 'optimization' | 'warning' | 'prediction';
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
  isActionable: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
  timeToResolve?: string;
  relatedMetrics?: string[];
}

interface AIInsightsProps {
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  processes: any[];
  chartData: any[];
  isMonitoring: boolean;
}

export function AIInsights({ resources, chartData, isMonitoring }: Omit<AIInsightsProps, 'processes'>) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Generează insights AI bazate pe datele de sistem
  useEffect(() => {
    if (!isMonitoring || !resources) return;

    const generateInsights = async () => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      // Simulează analiza AI în etape
      const analysisSteps = [
        'Analizare date CPU...',
        'Analizare utilizare memorie...',
        'Analizare performanță disk...',
        'Analizare activitate rețea...',
        'Generare insights...',
        'Calculare confidență...'
      ];

      for (let i = 0; i < analysisSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setAnalysisProgress(((i + 1) / analysisSteps.length) * 100);
      }

      const newInsights: AIInsight[] = [];

      // CPU Insights
      if (resources.cpu > 80) {
        newInsights.push({
          id: `cpu-${Date.now()}`,
          type: 'warning',
          category: 'cpu',
          severity: resources.cpu > 95 ? 'critical' : 'high',
          title: 'CPU Usage Optimization Needed',
          description: `CPU usage is consistently high at ${resources.cpu.toFixed(1)}%, which may impact system performance.`,
          recommendation: 'Consider optimizing CPU-intensive processes, implementing caching, or scaling resources.',
          confidence: 92,
          timestamp: new Date().toISOString(),
          isActionable: true,
          estimatedImpact: 'high',
          timeToResolve: '2-4 hours',
          relatedMetrics: ['CPU Temperature', 'Process Count', 'Load Average']
        });
      }

      if (resources.cpu < 30 && chartData.length > 5) {
        newInsights.push({
          id: `cpu-opt-${Date.now()}`,
          type: 'optimization',
          category: 'cpu',
          severity: 'low',
          title: 'CPU Underutilization Detected',
          description: 'CPU usage is consistently low, indicating potential resource waste.',
          recommendation: 'Consider consolidating workloads or implementing more CPU-intensive tasks to improve efficiency.',
          confidence: 78,
          timestamp: new Date().toISOString(),
          isActionable: true,
          estimatedImpact: 'medium',
          timeToResolve: '1-2 hours',
          relatedMetrics: ['Process Efficiency', 'Resource Allocation']
        });
      }

      // Memory Insights
      if (resources.memory > 85) {
        newInsights.push({
          id: `memory-${Date.now()}`,
          type: 'warning',
          category: 'memory',
          severity: resources.memory > 95 ? 'critical' : 'high',
          title: 'Memory Pressure Detected',
          description: `Memory usage is at ${resources.memory.toFixed(1)}%, approaching critical levels.`,
          recommendation: 'Investigate memory leaks, optimize memory-intensive processes, or increase RAM capacity.',
          confidence: 89,
          timestamp: new Date().toISOString(),
          isActionable: true,
          estimatedImpact: 'high',
          timeToResolve: '1-3 hours',
          relatedMetrics: ['Memory Leaks', 'Process Memory Usage', 'Swap Usage']
        });
      }

      // Disk Insights
      if (resources.disk > 90) {
        newInsights.push({
          id: `disk-${Date.now()}`,
          type: 'warning',
          category: 'disk',
          severity: 'critical',
          title: 'Critical Disk Space Warning',
          description: `Disk usage is at ${resources.disk.toFixed(1)}%, which may cause system instability.`,
          recommendation: 'Immediately clean up unnecessary files, implement log rotation, or expand storage capacity.',
          confidence: 95,
          timestamp: new Date().toISOString(),
          isActionable: true,
          estimatedImpact: 'high',
          timeToResolve: '30 minutes - 2 hours',
          relatedMetrics: ['Disk I/O', 'File System Health', 'Log Sizes']
        });
      }

      // Performance Prediction
      if (chartData.length > 10) {
        const cpuTrend = calculateTrend(chartData.map(d => d.cpu));
        const memoryTrend = calculateTrend(chartData.map(d => d.memory));

        if (cpuTrend === 'increasing' && memoryTrend === 'increasing') {
          newInsights.push({
            id: `prediction-${Date.now()}`,
            type: 'prediction',
            category: 'system',
            severity: 'medium',
            title: 'Performance Degradation Predicted',
            description: 'Both CPU and memory usage are trending upward, suggesting potential performance issues.',
            recommendation: 'Monitor trends closely and prepare for resource scaling or optimization.',
            confidence: 81,
            timestamp: new Date().toISOString(),
            isActionable: true,
            estimatedImpact: 'medium',
            timeToResolve: '4-8 hours',
            relatedMetrics: ['Trend Analysis', 'Resource Forecasting', 'Capacity Planning']
          });
        }
      }

      // Optimization Opportunities
      if (resources.cpu < 50 && resources.memory < 60 && resources.disk < 70) {
        newInsights.push({
          id: `optimization-${Date.now()}`,
          type: 'optimization',
          category: 'system',
          severity: 'low',
          title: 'System Optimization Opportunity',
          description: 'System resources are well-balanced with room for optimization.',
          recommendation: 'Consider implementing additional workloads or services to maximize resource utilization.',
          confidence: 85,
          timestamp: new Date().toISOString(),
          isActionable: true,
          estimatedImpact: 'low',
          timeToResolve: '2-6 hours',
          relatedMetrics: ['Resource Efficiency', 'Performance Metrics', 'Capacity Utilization']
        });
      }

      setInsights(newInsights);
      setIsAnalyzing(false);
    };

    generateInsights();
  }, [resources, isMonitoring, chartData]);

  const calculateTrend = (values: number[]) => {
    if (values.length < 5) return 'stable';
    const recent = values.slice(-3);
    const older = values.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'optimization':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'prediction':
        return <Brain className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const criticalInsights = insights.filter(insight => insight.severity === 'critical');
  const optimizationInsights = insights.filter(insight => insight.type === 'optimization');

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Brain className="w-6 h-6" />
            AI-Powered System Insights
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Intelligent analysis and recommendations based on system performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 dark:text-blue-300">AI Analysis in Progress...</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Analyzing system patterns and generating intelligent insights...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Insights</div>
              </div>
              <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {criticalInsights.length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Critical</div>
              </div>
              <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {optimizationInsights.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Optimizations</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights List */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>
              Intelligent recommendations and predictions based on system analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(insight.type)}
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge className={getSeverityColor(insight.severity)}>
                          {insight.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {insight.category.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(insight.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs">
                        Confidence: {insight.confidence}%
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-sm">Recommendation</span>
                    </div>
                    <p className="text-sm">{insight.recommendation}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {insight.estimatedImpact && (
                        <span className={`flex items-center gap-1 ${getImpactColor(insight.estimatedImpact)}`}>
                          <Activity className="w-3 h-3" />
                          Impact: {insight.estimatedImpact.toUpperCase()}
                        </span>
                      )}
                      {insight.timeToResolve && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Time to resolve: {insight.timeToResolve}
                        </span>
                      )}
                    </div>
                    
                    {insight.isActionable && (
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    )}
                  </div>

                  {insight.relatedMetrics && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Related Metrics:</div>
                      <div className="flex flex-wrap gap-2">
                        {insight.relatedMetrics.map((metric, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Insights State */}
      {insights.length === 0 && !isAnalyzing && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-lg font-medium">No AI Insights Available</p>
            <p className="text-sm text-muted-foreground">
              Start monitoring to generate intelligent insights and recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
