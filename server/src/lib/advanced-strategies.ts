export type StrategyType = 'trend_following' | 'mean_reversion' | 'breakout' | 'momentum' | 'pairs_trading';

export interface StrategyParameter {
  name: string;
  label: string;
  type: 'number' | 'integer' | 'boolean' | 'enum';
  defaultValue: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface TradingStrategyDefinition {
  id: string;
  name: string;
  type: StrategyType;
  description: string;
  parameters: StrategyParameter[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyExecutionRequest {
  strategyId: string;
  timeframe: string; // e.g. '1m','5m','1h','1d'
  asset: string;     // e.g. 'BTC/USD'
  startDate: string; // ISO
  endDate: string;   // ISO
  parameters: Record<string, number | boolean | string>;
}

export interface StrategySignal {
  timestamp: string;
  action: 'buy' | 'sell' | 'hold';
  price: number;
  confidence: number; // 0..1
  reason: string;
}

export interface StrategyRunResult {
  runId: string;
  strategyId: string;
  asset: string;
  timeframe: string;
  period: { start: string; end: string };
  parameters: Record<string, number | boolean | string>;
  signals: StrategySignal[];
  metrics: {
    totalSignals: number;
    winningSignals: number;
    losingSignals: number;
    winRate: number; // 0..1
    averageReturn: number; // decimal
    sharpeRatio: number;
    maxDrawdown: number; // decimal
    profitFactor: number;
  };
}

export interface OptimizationConstraint {
  parameter: string;
  min: number;
  max: number;
  step: number;
}

export interface StrategyOptimizationRequest {
  strategyId: string;
  objective: 'max_win_rate' | 'max_profit_factor' | 'max_sharpe' | 'min_drawdown';
  constraints: OptimizationConstraint[];
  asset: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  baselineParameters: Record<string, number | boolean | string>;
}

export interface StrategyOptimizationResult {
  strategyId: string;
  objective: StrategyOptimizationRequest['objective'];
  bestParameters: Record<string, number | boolean | string>;
  baselineMetrics: StrategyRunResult['metrics'];
  bestMetrics: StrategyRunResult['metrics'];
  improvement: number; // 0..1 relative improvement on chosen objective
  triedCombinations: number;
}

class AdvancedStrategiesEngine {
  private strategies: TradingStrategyDefinition[] = [];

  constructor() {
    this.seedDefaultStrategies();
  }

  listStrategies(): TradingStrategyDefinition[] {
    return this.strategies.slice();
  }

  getStrategyById(id: string): TradingStrategyDefinition | undefined {
    return this.strategies.find(s => s.id === id);
  }

  async runStrategy(req: StrategyExecutionRequest): Promise<StrategyRunResult> {
    // Simulated strategy signals and metrics based on parameters
    const random = this.createDeterministicRandom(`${req.strategyId}-${req.asset}-${req.timeframe}`);

    const totalSignals = Math.max(25, Math.floor(random() * 150));
    const winRate = 0.55 + (random() - 0.5) * 0.2; // ~55% +/- 10%
    const winningSignals = Math.round(totalSignals * Math.max(0.1, Math.min(0.9, winRate)));
    const losingSignals = totalSignals - winningSignals;
    const avgRet = 0.02 + (random() - 0.5) * 0.03; // ~2% +/- 1.5%
    const sharpe = 1.0 + (random() - 0.5) * 0.8;
    const drawdown = 0.1 + Math.abs(random() - 0.5) * 0.15; // 10%..~17.5%
    const profitFactor = 1.5 + (random() - 0.5);

    const signals: StrategySignal[] = Array.from({ length: totalSignals }).map((_, idx) => ({
      timestamp: new Date(Date.parse(req.startDate) + idx * 3600_000).toISOString(),
      action: random() > 0.5 ? 'buy' : 'sell',
      price: 100 + random() * 100,
      confidence: 0.6 + (random() - 0.5) * 0.3,
      reason: 'Simulated signal from strategy execution'
    }));

    return {
      runId: `${Date.now()}-${Math.floor(random() * 1_000_000)}`,
      strategyId: req.strategyId,
      asset: req.asset,
      timeframe: req.timeframe,
      period: { start: req.startDate, end: req.endDate },
      parameters: req.parameters,
      signals,
      metrics: {
        totalSignals,
        winningSignals,
        losingSignals,
        winRate: Math.max(0, Math.min(1, winRate)),
        averageReturn: avgRet,
        sharpeRatio: sharpe,
        maxDrawdown: Math.max(0, Math.min(1, drawdown)),
        profitFactor: Math.max(0.1, profitFactor)
      }
    };
  }

  async optimizeStrategy(req: StrategyOptimizationRequest): Promise<StrategyOptimizationResult> {
    // Brute-force small grid search over constraints (bounded)
    const combinations = this.generateParameterCombinations(req.constraints);

    const baselineRun = await this.runStrategy({
      strategyId: req.strategyId,
      timeframe: req.timeframe,
      asset: req.asset,
      startDate: req.startDate,
      endDate: req.endDate,
      parameters: req.baselineParameters
    });

    let bestParams = { ...req.baselineParameters } as Record<string, number | boolean | string>;
    let bestMetrics = baselineRun.metrics;

    for (const params of combinations) {
      const run = await this.runStrategy({ ...req, parameters: { ...req.baselineParameters, ...params } });
      if (this.isBetter(run.metrics, bestMetrics, req.objective)) {
        bestMetrics = run.metrics;
        bestParams = { ...req.baselineParameters, ...params };
      }
    }

    const improvement = this.computeImprovement(bestMetrics, baselineRun.metrics, req.objective);

    return {
      strategyId: req.strategyId,
      objective: req.objective,
      bestParameters: bestParams,
      baselineMetrics: baselineRun.metrics,
      bestMetrics,
      improvement,
      triedCombinations: combinations.length
    };
  }

  private isBetter(a: StrategyRunResult['metrics'], b: StrategyRunResult['metrics'], objective: StrategyOptimizationRequest['objective']): boolean {
    switch (objective) {
      case 'max_win_rate':
        return a.winRate > b.winRate;
      case 'max_profit_factor':
        return a.profitFactor > b.profitFactor;
      case 'max_sharpe':
        return a.sharpeRatio > b.sharpeRatio;
      case 'min_drawdown':
        return a.maxDrawdown < b.maxDrawdown;
      default:
        return false;
    }
  }

  private computeImprovement(a: StrategyRunResult['metrics'], b: StrategyRunResult['metrics'], objective: StrategyOptimizationRequest['objective']): number {
    switch (objective) {
      case 'max_win_rate':
        return Math.max(0, a.winRate - b.winRate);
      case 'max_profit_factor':
        return Math.max(0, (a.profitFactor - b.profitFactor) / Math.max(0.01, b.profitFactor));
      case 'max_sharpe':
        return Math.max(0, (a.sharpeRatio - b.sharpeRatio) / Math.max(0.01, b.sharpeRatio));
      case 'min_drawdown':
        return Math.max(0, (b.maxDrawdown - a.maxDrawdown) / Math.max(0.01, b.maxDrawdown));
      default:
        return 0;
    }
  }

  private generateParameterCombinations(constraints: OptimizationConstraint[]): Array<Record<string, number>> {
    const ranges: Array<Array<{ key: string; value: number }>> = constraints.map(c => {
      const values: Array<{ key: string; value: number }> = [];
      const step = Math.max(1e-6, c.step);
      for (let v = c.min; v <= c.max + 1e-12; v += step) {
        values.push({ key: c.parameter, value: Number(v.toFixed(6)) });
      }
      return values;
    });

    const cartesian: Array<Record<string, number>> = [];
    const backtrack = (idx: number, acc: Record<string, number>) => {
      if (idx === ranges.length) {
        cartesian.push({ ...acc });
        return;
      }
      for (const entry of ranges[idx]) {
        acc[entry.key] = entry.value;
        backtrack(idx + 1, acc);
      }
    };

    backtrack(0, {});
    // keep combinations reasonable
    return cartesian.slice(0, 200);
  }

  private seedDefaultStrategies() {
    const now = new Date();
    const v = '1.0.0';
    this.strategies = [
      {
        id: 'trend-following-basic',
        name: 'Trend Following (SMA Crossover)',
        type: 'trend_following',
        description: 'Simple moving average crossover strategy (fast vs slow).',
        version: v,
        createdAt: now,
        updatedAt: now,
        parameters: [
          { name: 'fastPeriod', label: 'Fast SMA', type: 'integer', defaultValue: 20, min: 5, max: 50, step: 5 },
          { name: 'slowPeriod', label: 'Slow SMA', type: 'integer', defaultValue: 50, min: 20, max: 200, step: 10 },
          { name: 'riskPerTrade', label: 'Risk per Trade', type: 'number', defaultValue: 0.01, min: 0.001, max: 0.05, step: 0.001 }
        ]
      },
      {
        id: 'mean-reversion-rsi',
        name: 'Mean Reversion (RSI)',
        type: 'mean_reversion',
        description: 'RSI-based mean reversion strategy with dynamic thresholds.',
        version: v,
        createdAt: now,
        updatedAt: now,
        parameters: [
          { name: 'rsiPeriod', label: 'RSI Period', type: 'integer', defaultValue: 14, min: 5, max: 30, step: 1 },
          { name: 'rsiBuy', label: 'RSI Buy Threshold', type: 'integer', defaultValue: 30, min: 10, max: 40, step: 1 },
          { name: 'rsiSell', label: 'RSI Sell Threshold', type: 'integer', defaultValue: 70, min: 60, max: 90, step: 1 }
        ]
      },
      {
        id: 'breakout-basic',
        name: 'Breakout (Donchian)',
        type: 'breakout',
        description: 'Donchian channel breakout strategy with stop-loss.',
        version: v,
        createdAt: now,
        updatedAt: now,
        parameters: [
          { name: 'channelPeriod', label: 'Channel Period', type: 'integer', defaultValue: 20, min: 10, max: 60, step: 5 },
          { name: 'stopLoss', label: 'Stop Loss %', type: 'number', defaultValue: 0.03, min: 0.005, max: 0.1, step: 0.005 }
        ]
      }
    ];
  }

  private createDeterministicRandom(seed: string): () => number {
    // xmur3 + mulberry32
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    let t = h >>> 0;
    return function() {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
}

export const advancedStrategiesEngine = new AdvancedStrategiesEngine();
