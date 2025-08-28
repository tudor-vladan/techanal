import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Zap, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface Prediction {
  id: string;
  type: 'resource' | 'performance' | 'capacity' | 'maintenance';
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  risk: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  impact: string;
}

interface PredictiveAnalyticsProps {
  chartData: any[];
  resources: any;
  isMonitoring: boolean;
}

export function PredictiveAnalytics({ chartData, resources, isMonitoring }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Generează predicții bazate pe datele istorice
  useEffect(() => {
    if (!isMonitoring || chartData.length < 10) return;

    const generatePredictions = async () => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      // Simulează analiza predictivă
      const analysisSteps = [
        'Analizare pattern-uri istorice...',
        'Calculare trend-uri...',
        'Generare predicții...',
        'Evaluare confidență...',
        'Calculare riscuri...'
      ];

      for (let i = 0; i < analysisSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setAnalysisProgress(((i + 1) / analysisSteps.length) * 100);
      }

      const newPredictions: Prediction[] = [];

      // CPU Predictions
      const cpuValues = chartData.map(d => d.cpu);
      const cpuTrend = calculateTrend(cpuValues);
      const cpuPrediction = predictValue(cpuValues, 1); // 1 hour ahead

      if (cpuPrediction > 80) {
        newPredictions.push({
          id: `cpu-pred-${Date.now()}`,
          type: 'resource',
          metric: 'CPU Usage',
          currentValue: resources?.cpu?.usage || 0,
          predictedValue: cpuPrediction,
          timeframe: '1 hour',
          confidence: 85,
          trend: cpuTrend,
          risk: cpuPrediction > 95 ? 'critical' : 'high',
          recommendation: 'Consider scaling CPU resources or optimizing processes',
          impact: 'Potential performance degradation and response time increase'
        });
      }

      // Memory Predictions
      const memoryValues = chartData.map(d => d.memory);
      const memoryTrend = calculateTrend(memoryValues);
      const memoryPrediction = predictValue(memoryValues, 1);

      if (memoryPrediction > 85) {
        newPredictions.push({
          id: `memory-pred-${Date.now()}`,
          type: 'resource',
          metric: 'Memory Usage',
          currentValue: resources?.memory?.usage || 0,
          predictedValue: memoryPrediction,
          timeframe: '1 hour',
          confidence: 82,
          trend: memoryTrend,
          risk: memoryPrediction > 95 ? 'critical' : 'high',
          recommendation: 'Investigate memory leaks or increase RAM capacity',
          impact: 'Risk of out-of-memory errors and system instability'
        });
      }

      // Disk Predictions
      const diskValues = chartData.map(d => d.disk);
      const diskTrend = calculateTrend(diskValues);
      const diskPrediction = predictValue(diskValues, 2); // 2 hours ahead

      if (diskPrediction > 90) {
        newPredictions.push({
          id: `disk-pred-${Date.now()}`,
          type: 'capacity',
          metric: 'Disk Usage',
          currentValue: resources?.disk?.usage || 0,
          predictedValue: diskPrediction,
          timeframe: '2 hours',
          confidence: 90,
          trend: diskTrend,
          risk: 'critical',
          recommendation: 'Immediately clean up files and implement log rotation',
          impact: 'System may become unstable or crash due to disk space exhaustion'
        });
      }

      // Performance Predictions
      if (cpuTrend === 'increasing' && memoryTrend === 'increasing') {
        newPredictions.push({
          id: `perf-pred-${Date.now()}`,
          type: 'performance',
          metric: 'System Performance',
          currentValue: calculatePerformanceScore(resources),
          predictedValue: Math.max(0, calculatePerformanceScore(resources) - 15),
          timeframe: '3 hours',
          confidence: 78,
          trend: 'decreasing',
          risk: 'medium',
          recommendation: 'Monitor closely and prepare for resource scaling',
          impact: 'Gradual performance degradation affecting user experience'
        });
      }

      // Maintenance Predictions
      const uptimeHours = 2.25; // Mock data
      if (uptimeHours > 24) {
        newPredictions.push({
          id: `maintenance-pred-${Date.now()}`,
          type: 'maintenance',
          metric: 'System Uptime',
          currentValue: uptimeHours,
          predictedValue: uptimeHours + 6,
          timeframe: '6 hours',
          confidence: 75,
          trend: 'increasing',
          risk: 'medium',
          recommendation: 'Schedule maintenance window for system optimization',
          impact: 'Longer uptime may lead to memory leaks and degraded performance'
        });
      }

      setPredictions(newPredictions);
      setIsAnalyzing(false);
    };

    generatePredictions();
  }, [chartData, resources, isMonitoring]);

  const calculateTrend = (values: number[]) => {
    if (values.length < 5) return 'stable';
    const recent = values.slice(-3);
    const older = values.slice(-6, -3);
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.05) return 'increasing';
    if (recentAvg < olderAvg * 0.95) return 'decreasing';
    return 'stable';
  };

  const predictValue = (values: number[], hoursAhead: number) => {
    if (values.length < 3) return values[values.length - 1] || 0;
    
    // Simple linear regression for prediction
    const recent = values.slice(-6);
    const x = Array.from({ length: recent.length }, (_, i) => i);
    const y = recent;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Math.max(0, Math.min(100, intercept + slope * (n + hoursAhead)));
  };

  const calculatePerformanceScore = (resources: any) => {
    if (!resources) return 0;
    const scores = [
      resources.cpu?.usage < 80 ? 100 : Math.max(0, 100 - (resources.cpu?.usage - 80) * 2),
      resources.memory?.usage < 85 ? 100 : Math.max(0, 100 - (resources.memory?.usage - 85) * 2),
      resources.disk?.usage < 90 ? 100 : Math.max(0, 100 - (resources.disk?.usage - 90) * 2)
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <Zap className="w-4 h-4" />;
      case 'performance':
        return <BarChart3 className="w-4 h-4" />;
      case 'capacity':
        return <Target className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const criticalPredictions = predictions.filter(p => p.risk === 'critical');
  const highRiskPredictions = predictions.filter(p => p.risk === 'high');

  return (
    <div className="space-y-6">
      {/* Predictive Analytics Header */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Brain className="w-6 h-6" />
            Predictive Analytics
          </CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            AI-powered forecasting of system performance and resource needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-purple-700 dark:text-purple-300">AI Prediction Analysis in Progress...</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Analyzing historical patterns and generating future predictions...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {predictions.length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Total Predictions</div>
              </div>
              <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {criticalPredictions.length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Critical</div>
              </div>
              <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {highRiskPredictions.length}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">High Risk</div>
              </div>
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(predictions.reduce((a, b) => a + b.confidence, 0) / Math.max(predictions.length, 1))}%
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Avg Confidence</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictions List */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Generated Predictions
            </CardTitle>
            <CardDescription>
              Forecasts and predictions based on historical data analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(prediction.type)}
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{prediction.metric}</h3>
                        <Badge className={getRiskColor(prediction.risk)}>
                          {prediction.risk.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {prediction.timeframe}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Confidence: {prediction.confidence}%
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(prediction.trend)}
                        <span className="text-xs">
                          {prediction.trend === 'increasing' ? 'Increasing' : 
                           prediction.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="text-xl font-bold">{prediction.currentValue.toFixed(1)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Predicted</div>
                      <div className="text-xl font-bold">{prediction.predictedValue.toFixed(1)}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Change</div>
                      <div className={`text-xl font-bold ${
                        prediction.predictedValue > prediction.currentValue ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {prediction.predictedValue > prediction.currentValue ? '+' : ''}
                        {(prediction.predictedValue - prediction.currentValue).toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-sm">Prediction & Impact</span>
                    </div>
                    <p className="text-sm mb-2">{prediction.recommendation}</p>
                    <p className="text-xs text-muted-foreground">{prediction.impact}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Predictions State */}
      {predictions.length === 0 && !isAnalyzing && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-lg font-medium">No Predictions Available</p>
            <p className="text-sm text-muted-foreground">
              Start monitoring to generate AI-powered predictions and forecasts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
