import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Target, 
  BarChart3, 
  PieChart,
  Calendar,
  Clock,
  Eye,
  MousePointer,
  Zap,
  AlertCircle
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/serverComm';

interface UserBehaviorMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  averageActionsPerSession: number;
  engagementRate: number;
  retentionRate: number;
  featureUsage: {
    feature: string;
    totalUsers: number;
    adoptionRate: number;
    growthTrend: 'increasing' | 'stable' | 'decreasing';
    userSatisfaction: number;
  }[];
  userSegments: {
    segment: string;
    count: number;
    percentage: number;
    characteristics: {
      averageSessionDuration: number;
      averageActionsPerSession: number;
      preferredFeatures: string[];
      retentionRate: number;
    };
  }[];
}

interface UserJourney {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  actions: {
    action: string;
    timestamp: Date;
    feature: string;
    metadata: any;
  }[];
  path: string[];
  exitPoint: string;
  conversion: boolean;
}

interface UserAnalyticsDashboardProps {
  className?: string;
}

export const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({
  className = ''
}) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  const [metrics, setMetrics] = useState<UserBehaviorMetrics | null>(null);
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/learning/analytics/behavior?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserJourney = async (sessionId: string) => {
    try {
      const response = await fetchWithAuth(`/api/learning/analytics/journey/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setUserJourney(data.data);
      }
    } catch (error) {
      console.error('Error loading user journey:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getGrowthTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGrowthTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      default: return '→';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Analytics Dashboard</h2>
          <p className="text-gray-600">Track user behavior and generate actionable insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: 'day' | 'week' | 'month') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics.newUsers} new this {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(metrics.engagementRate)} engagement rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(metrics.averageSessionDuration)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.averageActionsPerSession} actions per session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metrics.retentionRate)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.returningUsers} returning users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Feature Adoption</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
        </TabsList>

        {/* Feature Adoption Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Feature Adoption Analysis
              </CardTitle>
              <CardDescription>
                Track how users adopt and engage with different features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.featureUsage && metrics.featureUsage.length > 0 ? (
                <div className="space-y-4">
                  {metrics.featureUsage.map((feature, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{feature.feature}</h4>
                          <Badge variant="outline" className={getGrowthTrendColor(feature.growthTrend)}>
                            {getGrowthTrendIcon(feature.growthTrend)} {feature.growthTrend}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{feature.totalUsers.toLocaleString()} users</div>
                          <div className="text-sm text-gray-500">
                            {formatPercentage(feature.adoptionRate)} adoption
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Adoption Rate</span>
                          <span>{formatPercentage(feature.adoptionRate)}</span>
                        </div>
                        <Progress value={feature.adoptionRate * 100} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User Satisfaction:</span>
                          <div className="font-medium">{feature.userSatisfaction.toFixed(1)}/5.0</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Growth Trend:</span>
                          <div className="font-medium capitalize">{feature.growthTrend}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feature usage data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                User Segmentation
              </CardTitle>
              <CardDescription>
                Analyze user behavior patterns and segment characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.userSegments && metrics.userSegments.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Segments</SelectItem>
                        {metrics.userSegments.map((segment, index) => (
                          <SelectItem key={index} value={segment.segment}>
                            {segment.segment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {metrics.userSegments
                      .filter(segment => selectedSegment === 'all' || segment.segment === selectedSegment)
                      .map((segment, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">{segment.segment}</h4>
                            <Badge variant="outline">
                              {segment.count} users ({formatPercentage(segment.percentage)})
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Session Duration:</span>
                                <div className="font-medium">
                                  {formatDuration(segment.characteristics.averageSessionDuration)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Actions/Session:</span>
                                <div className="font-medium">
                                  {segment.characteristics.averageActionsPerSession.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-500 text-sm">Retention Rate:</span>
                              <div className="font-medium">
                                {formatPercentage(segment.characteristics.retentionRate)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-500 text-sm">Preferred Features:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {segment.characteristics.preferredFeatures.map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No user segmentation data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                User Journey Analysis
              </CardTitle>
              <CardDescription>
                Track individual user paths and identify optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Enter session ID to analyze"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    onChange={(e) => {
                      if (e.target.value) {
                        loadUserJourney(e.target.value);
                      }
                    }}
                  />
                  <Button variant="outline">Analyze Journey</Button>
                </div>

                {userJourney && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-500">Session Duration:</span>
                        <div className="font-medium">{formatDuration(userJourney.duration)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Total Actions:</span>
                        <div className="font-medium">{userJourney.actions.length}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Conversion:</span>
                        <div className="font-medium">
                          <Badge variant={userJourney.conversion ? 'default' : 'secondary'}>
                            {userJourney.conversion ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Exit Point:</span>
                        <div className="font-medium">{userJourney.exitPoint}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-3">User Path</h5>
                      <div className="flex items-center gap-2 flex-wrap">
                        {userJourney.path.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <Badge variant="outline">{step}</Badge>
                            {index < userJourney.path.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-3">Action Timeline</h5>
                      <div className="space-y-2">
                        {userJourney.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{action.action}</span>
                            <Badge variant="secondary" className="text-xs">
                              {action.feature}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Missing icon component
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
