import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target, 
  Users, 
  DollarSign,
  Activity,
  AlertTriangle,
  Lightbulb,
  Download,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/serverComm';

interface BusinessMetrics {
  totalAnalyses: number;
  totalUsers: number;
  averageAccuracy: number;
  totalRevenue: number;
  growthRate: number;
  marketShare: number;
  customerSatisfaction: number;
  operationalEfficiency: number;
}

interface TradingPerformanceMetrics {
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  averageReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  totalVolume: number;
  averageHoldingPeriod: number;
}

interface MarketInsights {
  topPerformingAssets: Array<{
    asset: string;
    performance: number;
    volume: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  }>;
  marketTrends: Array<{
    timeframe: string;
    trend: string;
    confidence: number;
    volume: number;
  }>;
  volatilityAnalysis: {
    currentVolatility: number;
    historicalAverage: number;
    volatilityTrend: 'increasing' | 'decreasing' | 'stable';
    riskLevel: 'low' | 'medium' | 'high';
  };
  correlationMatrix: Array<{
    asset1: string;
    asset2: string;
    correlation: number;
    strength: 'strong' | 'moderate' | 'weak';
  }>;
}

interface UserBehaviorInsights {
  userSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    averageSessionDuration: number;
    preferredFeatures: string[];
    retentionRate: number;
    conversionRate: number;
  }>;
  featureAdoption: Array<{
    feature: string;
    totalUsers: number;
    adoptionRate: number;
    userSatisfaction: number;
    growthTrend: 'increasing' | 'stable' | 'decreasing';
  }>;
  userJourney: Array<{
    stage: string;
    users: number;
    conversionRate: number;
    averageTime: number;
    dropoffRate: number;
  }>;
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
  };
}

interface OperationalMetrics {
  systemPerformance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
    resourceUtilization: number;
  };
  costMetrics: {
    infrastructureCosts: number;
    operationalCosts: number;
    costPerUser: number;
    costPerAnalysis: number;
    efficiencyRatio: number;
  };
  qualityMetrics: {
    accuracyRate: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface BusinessIntelligenceReport {
  timestamp: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  businessMetrics: BusinessMetrics;
  tradingPerformance: TradingPerformanceMetrics;
  marketInsights: MarketInsights;
  userBehavior: UserBehaviorInsights;
  operationalMetrics: OperationalMetrics;
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface BusinessIntelligenceDashboardProps {
  className?: string;
}

export const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  className = ''
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [report, setReport] = useState<BusinessIntelligenceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/business-intelligence/report/${period}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data.data);
      }
    } catch (error) {
      console.error('Error loading business intelligence report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const response = await fetchWithAuth('/api/business-intelligence/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period, format }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();
      const { filename, downloadUrl } = data.data;

      // Fetch the actual file for download
      const fileRes = await fetchWithAuth(downloadUrl);
      if (!fileRes.ok) {
        throw new Error('Download failed');
      }
      const blob = await fileRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < threshold) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load business intelligence report</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Intelligence Dashboard</h2>
          <p className="text-gray-600">Comprehensive business analytics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadReport} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('json')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.businessMetrics.totalRevenue)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getTrendIcon(report.businessMetrics.growthRate)}
              {formatPercentage(report.businessMetrics.growthRate)} growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(report.businessMetrics.totalUsers)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getTrendIcon(report.businessMetrics.growthRate)}
              {formatPercentage(report.businessMetrics.growthRate)} growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(report.tradingPerformance.winRate)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getTrendIcon(report.tradingPerformance.winRate, 0.7)}
              {report.tradingPerformance.totalSignals} signals
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(report.businessMetrics.customerSatisfaction)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getTrendIcon(report.businessMetrics.customerSatisfaction, 0.9)}
              High satisfaction
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Business Metrics
                </CardTitle>
                <CardDescription>Key business performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Analyses</span>
                    <div className="font-medium">{formatNumber(report.businessMetrics.totalAnalyses)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Market Share</span>
                    <div className="font-medium">{formatPercentage(report.businessMetrics.marketShare)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Accuracy</span>
                    <div className="font-medium">{formatPercentage(report.businessMetrics.averageAccuracy)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Efficiency</span>
                    <div className="font-medium">{formatPercentage(report.businessMetrics.operationalEfficiency)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trading Performance
                </CardTitle>
                <CardDescription>Key trading metrics and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Sharpe Ratio</span>
                    <div className="font-medium">{report.tradingPerformance.sharpeRatio.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Max Drawdown</span>
                    <div className="font-medium">{formatPercentage(report.tradingPerformance.maxDrawdown)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Profit Factor</span>
                    <div className="font-medium">{report.tradingPerformance.profitFactor.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Volume</span>
                    <div className="font-medium">{formatCurrency(report.tradingPerformance.totalVolume)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Trading Performance Analysis
              </CardTitle>
              <CardDescription>Detailed trading metrics and performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Signal Performance */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Signal Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Win Rate</span>
                        <span>{formatPercentage(report.tradingPerformance.winRate)}</span>
                      </div>
                      <Progress value={report.tradingPerformance.winRate * 100} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Winning Signals:</span>
                        <div className="font-medium">{report.tradingPerformance.winningSignals}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Losing Signals:</span>
                        <div className="font-medium">{report.tradingPerformance.losingSignals}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Metrics</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Max Drawdown:</span>
                        <div className="font-medium">{formatPercentage(report.tradingPerformance.maxDrawdown)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Sharpe Ratio:</span>
                        <div className="font-medium">{report.tradingPerformance.sharpeRatio.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Profit Factor:</span>
                        <div className="font-medium">{report.tradingPerformance.profitFactor.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Return:</span>
                        <div className="font-medium">{formatPercentage(report.tradingPerformance.averageReturn)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Assets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Performing Assets
                </CardTitle>
                <CardDescription>Best performing assets and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.marketInsights.topPerformingAssets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{asset.asset}</div>
                        <div className="text-sm text-gray-500">
                          Volume: {formatCurrency(asset.volume)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getTrendColor(asset.trend)}`}>
                          {formatPercentage(asset.performance)}
                        </div>
                        <Badge variant="outline" className={getTrendColor(asset.trend)}>
                          {asset.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Volatility Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Volatility Analysis
                </CardTitle>
                <CardDescription>Market volatility trends and risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Current Volatility</span>
                      <div className="font-medium">{formatPercentage(report.marketInsights.volatilityAnalysis.currentVolatility)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Historical Average</span>
                      <div className="font-medium">{formatPercentage(report.marketInsights.volatilityAnalysis.historicalAverage)}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Risk Level</span>
                    <div className="font-medium">
                      <Badge variant="outline" className={getRiskLevelColor(report.marketInsights.volatilityAnalysis.riskLevel)}>
                        {report.marketInsights.volatilityAnalysis.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Trend</span>
                    <div className="font-medium capitalize">{report.marketInsights.volatilityAnalysis.volatilityTrend}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Behavior Analysis
              </CardTitle>
              <CardDescription>User segments, engagement, and behavior patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* User Segments */}
                <div>
                  <h4 className="font-semibold mb-3">User Segments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {report.userBehavior.userSegments.map((segment, index) => (
                      <Card key={index} className="p-4">
                        <div className="text-center">
                          <h5 className="font-medium mb-2">{segment.segment}</h5>
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {formatNumber(segment.count)}
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            {formatPercentage(segment.percentage)} of total users
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Retention:</span>
                              <span className="font-medium">{formatPercentage(segment.retentionRate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conversion:</span>
                              <span className="font-medium">{formatPercentage(segment.conversionRate)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div>
                  <h4 className="font-semibold mb-3">Engagement Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(report.userBehavior.engagementMetrics.dailyActiveUsers)}
                      </div>
                      <div className="text-sm text-gray-500">Daily Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(report.userBehavior.engagementMetrics.weeklyActiveUsers)}
                      </div>
                      <div className="text-sm text-gray-500">Weekly Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {report.userBehavior.engagementMetrics.averageSessionDuration}m
                      </div>
                      <div className="text-sm text-gray-500">Avg Session</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(report.userBehavior.engagementMetrics.bounceRate)}
                      </div>
                      <div className="text-sm text-gray-500">Bounce Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Performance
                </CardTitle>
                <CardDescription>System health and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Response Time</span>
                      <div className="font-medium">{report.operationalMetrics.systemPerformance.averageResponseTime}ms</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Uptime</span>
                      <div className="font-medium">{formatPercentage(report.operationalMetrics.systemPerformance.uptime)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Error Rate</span>
                      <div className="font-medium">{formatPercentage(report.operationalMetrics.systemPerformance.errorRate)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Throughput</span>
                      <div className="font-medium">{formatNumber(report.operationalMetrics.systemPerformance.throughput)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quality Metrics
                </CardTitle>
                <CardDescription>AI model accuracy and quality indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Accuracy Rate</span>
                      <div className="font-medium">{formatPercentage(report.operationalMetrics.qualityMetrics.accuracyRate)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">F1 Score</span>
                      <div className="font-medium">{report.operationalMetrics.qualityMetrics.f1Score.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Precision</span>
                      <div className="font-medium">{report.operationalMetrics.qualityMetrics.precision.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Recall</span>
                      <div className="font-medium">{report.operationalMetrics.qualityMetrics.recall.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>AI-generated business recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Identified business and operational risks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.riskFactors.map((risk, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">{risk}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Opportunities
                </CardTitle>
                <CardDescription>Identified growth and improvement opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.opportunities.map((opportunity, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
