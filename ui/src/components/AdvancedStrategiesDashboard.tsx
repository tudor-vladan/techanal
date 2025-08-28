import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Target, Rocket, Settings, Activity, Play, TimerReset, SlidersHorizontal,
} from 'lucide-react';
import { api } from '@/lib/serverComm';

interface StrategyParameter {
  name: string;
  label: string;
  type: 'number' | 'integer' | 'boolean' | 'enum';
  defaultValue: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

interface TradingStrategyDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: StrategyParameter[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface StrategyRunResult {
  runId: string;
  strategyId: string;
  asset: string;
  timeframe: string;
  period: { start: string; end: string };
  parameters: Record<string, number | boolean | string>;
  signals: Array<{
    timestamp: string;
    action: 'buy' | 'sell' | 'hold';
    price: number;
    confidence: number;
    reason: string;
  }>;
  metrics: {
    totalSignals: number;
    winningSignals: number;
    losingSignals: number;
    winRate: number;
    averageReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    profitFactor: number;
  };
}

interface StrategyOptimizationResult {
  strategyId: string;
  objective: 'max_win_rate' | 'max_profit_factor' | 'max_sharpe' | 'min_drawdown';
  bestParameters: Record<string, number | boolean | string>;
  baselineMetrics: StrategyRunResult['metrics'];
  bestMetrics: StrategyRunResult['metrics'];
  improvement: number;
  triedCombinations: number;
}

export const AdvancedStrategiesDashboard: React.FC = () => {
  const [strategies, setStrategies] = useState<TradingStrategyDefinition[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [asset, setAsset] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState('1h');
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 7*24*3600*1000).toISOString());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [runResult, setRunResult] = useState<StrategyRunResult | null>(null);
  const [optObjective, setOptObjective] = useState<'max_win_rate' | 'max_profit_factor' | 'max_sharpe' | 'min_drawdown'>('max_win_rate');
  const [optConstraints, setOptConstraints] = useState<Array<{ parameter: string; min: number; max: number; step: number }>>([]);
  const [optResult, setOptResult] = useState<StrategyOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('run');

  useEffect(() => {
    loadStrategies();
  }, []);

  useEffect(() => {
    if (selectedStrategy) {
      const s = strategies.find(s => s.id === selectedStrategy);
      if (s) {
        const defaults: Record<string, any> = {};
        s.parameters.forEach(p => {
          defaults[p.name] = p.defaultValue;
        });
        setParameters(defaults);
        setOptConstraints(s.parameters.filter(p => p.type === 'number' || p.type === 'integer').map(p => ({
          parameter: p.name,
          min: (p.min ?? 1),
          max: (p.max ?? 100),
          step: (p.step ?? 1)
        })));
      }
    }
  }, [selectedStrategy, strategies]);

  const loadStrategies = async () => {
    try {
      const res = await api.get('/api/strategies/list');
      if (res.ok) {
        const data = await res.json();
        setStrategies(data.data);
        if (data.data.length > 0) setSelectedStrategy(data.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load strategies', e);
    }
  };

  const run = async () => {
    if (!selectedStrategy) return;
    setLoading(true);
    try {
      const res = await api.post('/api/strategies/run', {
        strategyId: selectedStrategy,
        asset,
        timeframe,
        startDate,
        endDate,
        parameters
      });
      if (res.ok) {
        const data = await res.json();
        setRunResult(data.data);
        setActiveTab('results');
      }
    } catch (e) {
      console.error('Failed to run strategy', e);
    } finally {
      setLoading(false);
    }
  };

  const optimize = async () => {
    if (!selectedStrategy) return;
    setLoading(true);
    try {
      const res = await api.post('/api/strategies/optimize', {
        strategyId: selectedStrategy,
        objective: optObjective,
        constraints: optConstraints,
        asset,
        timeframe,
        startDate,
        endDate,
        baselineParameters: parameters
      });
      if (res.ok) {
        const data = await res.json();
        setOptResult(data.data);
        setActiveTab('opt');
      }
    } catch (e) {
      console.error('Failed to optimize strategy', e);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (name: string, value: any) => setParameters(prev => ({ ...prev, [name]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Trading Strategies</h2>
          <p className="text-gray-600">Run and optimize algorithmic strategies</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Alpha</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Configuration</CardTitle>
          <CardDescription>Select strategy, market, period and parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Strategy</Label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Asset</Label>
              <Input value={asset} onChange={e => setAsset(e.target.value)} />
            </div>
            <div>
              <Label>Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1m','5m','15m','1h','4h','1d'].map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="datetime-local" value={startDate.slice(0,16)} onChange={e => setStartDate(new Date(e.target.value).toISOString())} />
                <Input type="datetime-local" value={endDate.slice(0,16)} onChange={e => setEndDate(new Date(e.target.value).toISOString())} />
              </div>
            </div>
          </div>

          {/* Parameters */}
          {selectedStrategy && (
            <div className="space-y-3">
              <Label>Parameters</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategies.find(s => s.id === selectedStrategy)?.parameters.map(p => (
                  <div key={p.name} className="space-y-1">
                    <Label className="text-sm">{p.label}</Label>
                    {p.type === 'boolean' ? (
                      <Select value={String(parameters[p.name])} onValueChange={v => updateParam(p.name, v === 'true')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input type="number" step={p.step ?? 1} value={Number(parameters[p.name] ?? p.defaultValue)} onChange={e => updateParam(p.name, Number(e.target.value))} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={run} disabled={loading}><Play className="w-4 h-4 mr-2" /> Run</Button>
            <Button onClick={optimize} variant="outline" disabled={loading}><SlidersHorizontal className="w-4 h-4 mr-2" /> Optimize</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="run">Run Result</TabsTrigger>
          <TabsTrigger value="opt">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="run">
          {!runResult ? (
            <div className="p-6 text-gray-500">No run yet.</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Run Summary</CardTitle>
                <CardDescription>{runResult.strategyId} on {runResult.asset} ({runResult.timeframe})</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric label="Win Rate" value={(runResult.metrics.winRate*100).toFixed(1) + '%'} />
                  <Metric label="Profit Factor" value={runResult.metrics.profitFactor.toFixed(2)} />
                  <Metric label="Sharpe" value={runResult.metrics.sharpeRatio.toFixed(2)} />
                  <Metric label="Max Drawdown" value={(runResult.metrics.maxDrawdown*100).toFixed(1) + '%'} />
                </div>
                <div>
                  <Label>Signals</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-auto">
                    {runResult.signals.slice(0, 60).map((s, i) => (
                      <div key={i} className="p-3 border rounded">
                        <div className="flex justify-between text-sm">
                          <span>{new Date(s.timestamp).toLocaleString()}</span>
                          <Badge variant="outline">{s.action.toUpperCase()}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">Price: {s.price.toFixed(2)}</div>
                        <Progress value={s.confidence * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="opt">
          {!optResult ? (
            <div className="p-6 text-gray-500">No optimization yet.</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Optimization Result</CardTitle>
                <CardDescription>Objective: {optResult.objective}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric label="Tried" value={String(optResult.triedCombinations)} />
                  <Metric label="Improvement" value={(optResult.improvement*100).toFixed(1) + '%'} />
                  <Metric label="Baseline Sharpe" value={optResult.baselineMetrics.sharpeRatio.toFixed(2)} />
                  <Metric label="Best Sharpe" value={optResult.bestMetrics.sharpeRatio.toFixed(2)} />
                </div>
                <div>
                  <Label>Best Parameters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(optResult.bestParameters).map(([k, v]) => (
                      <div key={k} className="p-3 border rounded text-sm flex justify-between">
                        <span className="text-gray-600">{k}</span>
                        <span className="font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 border rounded">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);
