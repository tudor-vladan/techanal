import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  Play, 
  History, 
  GitCompare,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/serverComm';

interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  parameters: {
    stopLoss: number;
    takeProfit: number;
    maxHoldingPeriod: number;
    minConfidence: number;
    riskPerTrade: number;
  };
  rules: string[];
  isActive: boolean;
}

interface BacktestResult {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
  metadata: {
    chartType: string;
    timeframe: string;
    assetType: string;
    strategy: string;
  };
  timestamp: Date;
}

interface BacktestingDashboardProps {
  userId: string;
  className?: string;
}

export const BacktestingDashboard: React.FC<BacktestingDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [strategies, setStrategies] = useState<BacktestStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [chartType, setChartType] = useState<string>('');
  const [timeframe, setChartTimeframe] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [comparison, setComparison] = useState<any>(null);

  // Set default dates (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Load strategies on component mount
  useEffect(() => {
    loadStrategies();
    loadResults();
  }, [userId]);

  const loadStrategies = async () => {
    try {
      const response = await fetchWithAuth('/api/learning/backtest/strategies');
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedStrategy(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetchWithAuth(`/api/learning/backtest/results/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const runBacktest = async () => {
    if (!selectedStrategy || !startDate || !endDate) {
      alert('Please select a strategy and date range');
      return;
    }

    setIsRunning(true);

    try {
      const response = await fetchWithAuth('/api/learning/backtest/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          startDate,
          endDate,
          strategyId: selectedStrategy,
          metadata: {
            chartType,
            timeframe,
            assetType
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Backtest completed successfully!');
        loadResults(); // Refresh results
      } else {
        throw new Error('Backtest failed');
      }
    } catch (error) {
      console.error('Error running backtest:', error);
      alert('Failed to run backtest. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const compareResults = async () => {
    if (selectedResults.length < 2) {
      alert('Please select at least 2 results to compare');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/learning/backtest/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultIds: selectedResults
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data.data);
      } else {
        throw new Error('Comparison failed');
      }
    } catch (error) {
      console.error('Error comparing results:', error);
      alert('Failed to compare results. Please try again.');
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const getStrategyById = (id: string) => strategies.find(s => s.id === id);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backtesting Dashboard</h2>
          <p className="text-gray-600">Test and compare trading strategies with historical data</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          AI-Powered
        </Badge>
      </div>

      <Tabs defaultValue="run" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="run">Run Backtest</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        {/* Run Backtest Tab */}
        <TabsContent value="run" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Run New Backtest
              </CardTitle>
              <CardDescription>
                Configure parameters and run a backtest on historical data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strategy Selection */}
              <div className="space-y-3">
                <Label>Select Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{strategy.name}</span>
                          <span className="text-sm text-gray-500">{strategy.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label>Chart Type</Label>
                  <Input
                    placeholder="e.g., candlestick"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Timeframe</Label>
                  <Input
                    placeholder="e.g., 1h, 4h, 1d"
                    value={timeframe}
                    onChange={(e) => setChartTimeframe(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Asset Type</Label>
                  <Input
                    placeholder="e.g., crypto, forex"
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                  />
                </div>
              </div>

              {/* Strategy Details */}
              {selectedStrategy && (
                <div className="space-y-3">
                  <Label>Strategy Parameters</Label>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Stop Loss:</span>
                        <span className="font-medium">{getStrategyById(selectedStrategy)?.parameters.stopLoss}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Take Profit:</span>
                        <span className="font-medium">{getStrategyById(selectedStrategy)?.parameters.takeProfit}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Min Confidence:</span>
                        <span className="font-medium">{((getStrategyById(selectedStrategy)?.parameters.minConfidence ?? 0) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Risk per Trade:</span>
                        <span className="font-medium">{getStrategyById(selectedStrategy)?.parameters.riskPerTrade}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Run Button */}
              <Button
                onClick={runBacktest}
                disabled={isRunning || !selectedStrategy}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Running Backtest...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Backtest
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Backtest Results
              </CardTitle>
              <CardDescription>
                View and analyze your backtest results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No backtest results found</p>
                  <p className="text-sm text-gray-400">Run a backtest to see results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">
                            {(result.metadata?.strategy ?? 'Strategy')} - {(result.metadata?.chartType ?? 'Chart')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedResults.includes(result.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedResults([...selectedResults, result.id]);
                              } else {
                                setSelectedResults(selectedResults.filter(id => id !== result.id));
                              }
                            }}
                          />
                          <Badge variant={result.totalReturn > 0 ? 'default' : 'destructive'}>
                            {formatPercentage(result.totalReturn)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Win Rate:</span>
                          <div className="font-medium">{formatPercentage(result.winRate)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Sharpe Ratio:</span>
                          <div className="font-medium">{result.sharpeRatio.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Drawdown:</span>
                          <div className="font-medium">{formatPercentage(result.maxDrawdown)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Signals:</span>
                          <div className="font-medium">{result.totalSignals}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="w-5 h-5" />
                Compare Results
              </CardTitle>
              <CardDescription>
                Compare multiple backtest results to find the best strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Selected {selectedResults.length} results for comparison
                    </span>
                    <Button onClick={compareResults} disabled={selectedResults.length < 2}>
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare Selected
                    </Button>
                  </div>
                </div>
              )}

              {comparison && (
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg">Comparison Results</h4>
                  
                  {/* Best Performers */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h5 className="font-medium">Best Win Rate</h5>
                        <p className="text-sm text-gray-500">Result ID: {comparison.comparison.bestWinRate}</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h5 className="font-medium">Best Return</h5>
                        <p className="text-sm text-gray-500">Result ID: {comparison.comparison.bestReturn}</p>
                      </div>
                    </Card>
                  </div>

                  {/* Summary Table */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Performance Summary</h5>
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Metric</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Best</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Worst</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Average</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.comparison.summary.map((item: any, index: number) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2 text-sm font-medium">{item.metric}</td>
                              <td className="px-4 py-2 text-sm text-green-600">{item.best}</td>
                              <td className="px-4 py-2 text-sm text-red-600">{item.worst}</td>
                              <td className="px-4 py-2 text-sm">{item.average.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
