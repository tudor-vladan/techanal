import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/serverComm';

interface UserFeedback {
  id: string;
  analysisId: string;
  userId: string;
  feedbackType: 'accuracy' | 'usefulness' | 'speed' | 'general';
  rating: number;
  comment: string;
  timestamp: Date;
  metadata: {
    chartType: string;
    timeframe: string;
    assetType: string;
    aiModel: string;
  };
}

interface LearningMetrics {
  totalFeedback: number;
  averageRating: number;
  feedbackByType: {
    type: string;
    count: number;
    averageRating: number;
  }[];
  modelAccuracy: number;
  improvementAreas: string[];
  recentImprovements: {
    id: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    timestamp: Date;
  }[];
  nextTrainingCycle: Date;
}

interface ModelImprovement {
  id: string;
  type: 'accuracy' | 'speed' | 'feature' | 'general';
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  impact: 'high' | 'medium' | 'low';
  estimatedCompletion: Date;
  progress: number;
}

interface ContinuousLearningDashboardProps {
  className?: string;
}

export const ContinuousLearningDashboard: React.FC<ContinuousLearningDashboardProps> = ({
  className = ''
}) => {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [improvements, setImprovements] = useState<ModelImprovement[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadMetrics();
    loadFeedback();
    loadImprovements();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      const response = await fetchWithAuth('/api/learning/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadFeedback = async () => {
    try {
      const response = await fetchWithAuth('/api/learning/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data || []);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const loadImprovements = async () => {
    try {
      const response = await fetchWithAuth('/api/learning/improvements');
      if (response.ok) {
        const data = await response.json();
        setImprovements(data.data || []);
      }
    } catch (error) {
      console.error('Error loading improvements:', error);
    }
  };

  const triggerModelRetraining = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/learning/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Manual trigger from dashboard',
          priority: 'high'
        }),
      });

      if (response.ok) {
        alert('Model retraining initiated successfully!');
        loadImprovements(); // Refresh improvements
      } else {
        throw new Error('Failed to trigger retraining');
      }
    } catch (error) {
      console.error('Error triggering retraining:', error);
      alert('Failed to trigger model retraining. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default">Completed</Badge>;
      case 'in_progress': return <Badge variant="secondary">In Progress</Badge>;
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString();
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Continuous Learning Dashboard</h2>
          <p className="text-gray-600">Monitor AI model performance and drive continuous improvement</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={triggerModelRetraining}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isLoading ? 'Retraining...' : 'Trigger Retraining'}
          </Button>
          <Badge variant="outline" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFeedback.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all feedback types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}/5.0</div>
              <p className="text-xs text-muted-foreground">
                User satisfaction score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.modelAccuracy * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Current performance level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Training</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(metrics.nextTrainingCycle)}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled retraining
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
          <TabsTrigger value="improvements">Model Improvements</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Feedback by Type
                </CardTitle>
                <CardDescription>
                  Distribution of feedback across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.feedbackByType && metrics.feedbackByType.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.feedbackByType.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{item.type}</span>
                          <span>{item.count} feedback</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={(item.count / Math.max(...metrics.feedbackByType.map(f => f.count))) * 100} 
                            className="flex-1 h-2" 
                          />
                          <span className="text-sm font-medium">
                            {item.averageRating.toFixed(1)}/5.0
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Improvements
                </CardTitle>
                <CardDescription>
                  Latest model enhancements and their impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.recentImprovements && metrics.recentImprovements.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.recentImprovements.slice(0, 5).map((improvement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          improvement.impact === 'high' ? 'bg-red-500' :
                          improvement.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{improvement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getImpactColor(improvement.impact)}>
                              {improvement.impact} impact
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(improvement.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent improvements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Improvement Areas */}
          {metrics?.improvementAreas && metrics.improvementAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Key Improvement Areas
                </CardTitle>
                <CardDescription>
                  Priority areas identified for model enhancement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {metrics.improvementAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feedback Analysis Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                User Feedback Analysis
              </CardTitle>
              <CardDescription>
                Detailed analysis of user feedback and sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.slice(0, 10).map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {item.feedbackType}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{formatDate(item.timestamp)}</div>
                          <div>{formatTime(item.timestamp)}</div>
                        </div>
                      </div>
                      
                      {item.comment && (
                        <p className="text-sm text-gray-700 mb-3">{item.comment}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <span>Chart Type:</span>
                          <div className="font-medium">{item.metadata.chartType || 'N/A'}</div>
                        </div>
                        <div>
                          <span>Timeframe:</span>
                          <div className="font-medium">{item.metadata.timeframe || 'N/A'}</div>
                        </div>
                        <div>
                          <span>Asset Type:</span>
                          <div className="font-medium">{item.metadata.assetType || 'N/A'}</div>
                        </div>
                        <div>
                          <span>AI Model:</span>
                          <div className="font-medium">{item.metadata.aiModel || 'N/A'}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feedback available</p>
                  <p className="text-sm text-gray-400">User feedback will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Improvements Tab */}
        <TabsContent value="improvements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Model Improvement Pipeline
              </CardTitle>
              <CardDescription>
                Track ongoing and planned model enhancements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {improvements.length > 0 ? (
                <div className="space-y-4">
                  {improvements.map((improvement) => (
                    <Card key={improvement.id} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{improvement.description}</h4>
                            {getStatusBadge(improvement.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Priority:</span>
                              <Badge variant="outline" className={getPriorityColor(improvement.priority)}>
                                {improvement.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Impact:</span>
                              <Badge variant="outline" className={getImpactColor(improvement.impact)}>
                                {improvement.impact}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">ETA:</span>
                              <span className="font-medium">
                                {formatDate(improvement.estimatedCompletion)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {improvement.status === 'in_progress' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{improvement.progress}%</span>
                          </div>
                          <Progress value={improvement.progress} className="h-2" />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No model improvements in pipeline</p>
                  <p className="text-sm text-gray-400">Improvements will appear here as they're identified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                Automated analysis and recommendations for model improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Trends */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Performance Trends</h4>
                  <p className="text-sm text-blue-700">
                    Model accuracy has improved by 12% over the last month, primarily due to 
                    enhanced pattern recognition in candlestick charts. Consider expanding 
                    training data for cryptocurrency assets.
                  </p>
                </div>

                {/* User Behavior Insights */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">User Behavior Insights</h4>
                  <p className="text-sm text-green-700">
                    Users are 3x more likely to provide feedback when analysis includes 
                    confidence scores. Consider making confidence metrics more prominent 
                    in the UI.
                  </p>
                </div>

                {/* Optimization Opportunities */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Optimization Opportunities</h4>
                  <p className="text-sm text-yellow-700">
                    Analysis speed can be improved by 25% through implementing parallel 
                    processing for technical indicators. This would reduce average 
                    response time from 356ms to 267ms.
                  </p>
                </div>

                {/* Next Actions */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">Recommended Next Actions</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Prioritize training data collection for forex markets</li>
                    <li>• Implement A/B testing for new confidence score display</li>
                    <li>• Schedule performance optimization sprint for next week</li>
                    <li>• Review user feedback patterns for feature prioritization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
