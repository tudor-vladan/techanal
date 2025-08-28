import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/serverComm';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Brain, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  RefreshCw,
  Sparkles,
  Lightbulb,
  Gauge,
  ChartLine,
  DollarSign,
  ArrowUpRight,
  Minus,
  Settings,
  Rocket,
  Shield,
  Award
} from 'lucide-react';

interface TradingOverview {
  totalTrades: number;
  profitableTrades: number;
  lossTrades: number;
  winRate: number;
  totalProfit: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
}

interface MarketMetrics {
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketSentiment: number;
}

interface AIPerformance {
  accuracy: number;
  confidence: number;
  responseTime: number;
  totalAnalyses: number;
  successRate: number;
}

export function Home() {
  const { user } = useAuth();
  const [serverUserInfo, setServerUserInfo] = useState<any>(null);
  const [serverError, setServerError] = useState('');
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data for demonstration
  const [tradingOverview] = useState<TradingOverview>({
    totalTrades: 156,
    profitableTrades: 98,
    lossTrades: 58,
    winRate: 62.8,
    totalProfit: 28450.75,
    averageReturn: 182.4,
    bestTrade: 1250.00,
    worstTrade: -450.00
  });

  const [marketMetrics] = useState<MarketMetrics>({
    marketTrend: 'bullish',
    volatility: 23.4,
    confidence: 78.9,
    riskLevel: 'medium',
    marketSentiment: 72.3
  });

  const [aiPerformance] = useState<AIPerformance>({
    accuracy: 94.7,
    confidence: 89.2,
    responseTime: 1.8,
    totalAnalyses: 1247,
    successRate: 96.3
  });

  useEffect(() => {
    async function fetchUserInfo() {
      if (user) {
        try {
          const data = await api.getCurrentUser();
          setServerUserInfo(data);
          setServerError('');
        } catch (error) {
          setServerError('Failed to fetch user info from server');
          console.error('Server error:', error);
        }
      }
    }
    fetchUserInfo();
  }, [user]);

  // Live monitoring effect
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Here you would fetch real-time data
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  const toggleLiveMonitoring = () => {
    setIsLiveMonitoring(!isLiveMonitoring);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMarketTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'text-green-600 dark:text-green-400';
      case 'bearish':
        return 'text-red-600 dark:text-red-400';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getMarketTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'neutral':
        return <Minus className="w-5 h-5 text-gray-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="w-8 h-8 text-blue-600" />
            Welcome back, {(user as any)?.displayName || user?.email || 'Trader'}! 🚀
          </h1>
          <p className="text-muted-foreground">
            Dashboard-ul tău personal de trading cu AI - Monitorizează performanța și obține insights valoroase
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isLiveMonitoring ? "destructive" : "default"}
            onClick={toggleLiveMonitoring}
            className="flex items-center gap-2"
          >
            {isLiveMonitoring ? (
              <>
                <Pause className="w-4 h-4" />
                Oprește Monitorizarea
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Monitorizare Live
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLastUpdate(new Date())}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>Ultima actualizare: {lastUpdate.toLocaleString()}</span>
        <span className="flex items-center gap-2">
          {isLiveMonitoring && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Monitorizare live activă
            </>
          )}
        </span>
      </div>

      {/* Trading Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${tradingOverview.totalProfit.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {tradingOverview.profitableTrades} trades profitabile
            </p>
            <Progress value={tradingOverview.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tradingOverview.winRate}%
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {tradingOverview.profitableTrades}/{tradingOverview.totalTrades} trades
            </p>
            <Progress value={tradingOverview.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Avg Return</CardTitle>
            <ChartLine className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${tradingOverview.averageReturn}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              per trade • {tradingOverview.totalTrades} total
            </p>
            <Progress value={(tradingOverview.averageReturn / 500) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Best Trade</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              +${tradingOverview.bestTrade}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              vs worst: ${tradingOverview.worstTrade}
            </p>
            <Progress value={((tradingOverview.bestTrade + Math.abs(tradingOverview.worstTrade)) / 2000) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment & AI Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
              <TrendingUp className="w-6 h-6" />
              Market Sentiment & Trends
            </CardTitle>
            <CardDescription className="text-indigo-700 dark:text-indigo-300">
              Analiza sentimentului pieței și tendințelor curente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Market Trend:</span>
              <div className="flex items-center gap-2">
                {getMarketTrendIcon(marketMetrics.marketTrend)}
                <span className={`font-semibold ${getMarketTrendColor(marketMetrics.marketTrend)}`}>
                  {marketMetrics.marketTrend.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Confidence:</span>
                <span className="font-semibold">{marketMetrics.confidence}%</span>
              </div>
              <Progress value={marketMetrics.confidence} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Volatility:</span>
                <span className="font-semibold">{marketMetrics.volatility}%</span>
              </div>
              <Progress value={marketMetrics.volatility} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level:</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(marketMetrics.riskLevel)}`}></div>
                <Badge variant="outline" className="capitalize">
                  {marketMetrics.riskLevel}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Market Sentiment:</span>
                <span className="font-semibold">{marketMetrics.marketSentiment}%</span>
              </div>
              <Progress value={marketMetrics.marketSentiment} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Brain className="w-6 h-6" />
              AI Performance Metrics
            </CardTitle>
            <CardDescription className="text-emerald-700 dark:text-emerald-300">
              Performanța sistemului AI în analiza trading-ului
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Accuracy:</span>
                <span className="font-semibold">{aiPerformance.accuracy}%</span>
              </div>
              <Progress value={aiPerformance.accuracy} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Confidence:</span>
                <span className="font-semibold">{aiPerformance.confidence}%</span>
              </div>
              <Progress value={aiPerformance.confidence} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Success Rate:</span>
                <span className="font-semibold">{aiPerformance.successRate}%</span>
              </div>
              <Progress value={aiPerformance.successRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Response Time:</span>
                <div className="font-semibold">{aiPerformance.responseTime}s</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Analyses:</span>
                <div className="font-semibold">{aiPerformance.totalAnalyses}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
              <Lightbulb className="w-4 h-4" />
              Trading Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Market showing bullish momentum</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                <span>Consider reducing position sizes</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>AI confidence at 89.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200 text-sm">
              <Gauge className="w-4 h-4" />
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>This Week:</span>
                <span className="font-semibold text-green-600">+12.4%</span>
              </div>
              <div className="flex justify-between">
                <span>This Month:</span>
                <span className="font-semibold text-green-600">+28.7%</span>
              </div>
              <div className="flex justify-between">
                <span>This Year:</span>
                <span className="font-semibold text-green-600">+156.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-sm">
              <Award className="w-4 h-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-600" />
                <span>Risk Management Master</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-green-600" />
                <span>High Accuracy Trader</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-600" />
                <span>Quick Decision Maker</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <ChartLine className="h-4 w-4" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to TechAnal Trading Dashboard</CardTitle>
              <CardDescription>
                Platforma ta avansată de analiză trading cu AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-semibold mb-2">🚀 Ce poți face aici:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Analizează screenshot-uri de trading cu AI avansat</li>
                    <li>• Monitorizează performanța în timp real</li>
                    <li>• Obține insights despre piețe și tendințe</li>
                    <li>• Gestionează prompt-urile personalizate</li>
                    <li>• Urmărește istoricul analizelor</li>
                  </ul>
                </div>
                
                {serverError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                ) : serverUserInfo ? (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Server User Info</h3>
                    <pre className="text-left bg-muted p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(serverUserInfo, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading server info...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Performance</CardTitle>
              <CardDescription>
                Analiza detaliată a performanței tale de trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Recent Trades</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last 7 days:</span>
                        <span className="font-semibold text-green-600">+8 trades</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last 30 days:</span>
                        <span className="font-semibold text-green-600">+23 trades</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Risk Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Drawdown:</span>
                        <span className="font-semibold text-red-600">-8.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sharpe Ratio:</span>
                        <span className="font-semibold text-green-600">1.87</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Engine</CardTitle>
              <CardDescription>
                Status și performanța motorului AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {aiPerformance.accuracy}%
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {aiPerformance.confidence}%
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {aiPerformance.responseTime}s
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Response Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>
                Configurările tale personale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-semibold">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Display Name:</span>
                      <span className="font-semibold">{(user as any)?.displayName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="font-semibold">{(user as any)?.metadata?.creationTime ? new Date((user as any).metadata.creationTime).toLocaleDateString() : 'N/A'}</span>
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