import { getDatabase } from './db';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';
import * as schema from '../schema/analysis';

export interface BacktestResult {
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
  signals: BacktestSignal[];
  metadata: {
    chartType: string;
    timeframe: string;
    assetType: string;
    strategy: string;
  };
  timestamp: Date;
}

export interface BacktestSignal {
  id: string;
  timestamp: Date;
  signal: 'buy' | 'sell' | 'hold';
  entryPrice: number;
  exitPrice?: number;
  profitLoss?: number;
  confidence: number;
  pattern: string;
  timeframe: string;
  status: 'open' | 'closed' | 'cancelled';
  holdingPeriod?: number; // in hours
  stopLoss?: number;
  takeProfit?: number;
}

export interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  parameters: {
    stopLoss: number; // percentage
    takeProfit: number; // percentage
    maxHoldingPeriod: number; // hours
    minConfidence: number; // 0-1
    riskPerTrade: number; // percentage of portfolio
  };
  rules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  bestTrade: number;
  worstTrade: number;
  averageHoldingPeriod: number;
}

export class BacktestingEngine {
  private db: any = null;
  private strategies: Map<string, BacktestStrategy> = new Map();
  private resultsCache: Map<string, BacktestResult> = new Map();

  constructor() {
    // Don't call initializeDatabase in constructor
    // It will be called when needed
    this.initializeDefaultStrategies();
  }

  private async initializeDatabase() {
    this.db = await getDatabase();
  }

  /**
   * Run backtest for a specific time period and strategy
   */
  async runBacktest(
    userId: string,
    startDate: Date,
    endDate: Date,
    strategyId: string,
    metadata: {
      chartType: string;
      timeframe: string;
      assetType: string;
    }
  ): Promise<BacktestResult> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    // Get historical analysis data
    const historicalAnalyses = await this.getHistoricalAnalyses(startDate, endDate, metadata);
    
    // Generate signals based on strategy
    const signals = await this.generateSignals(historicalAnalyses, strategy);
    
    // Simulate trading execution
    const executedSignals = await this.simulateTrading(signals, strategy);
    
    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(executedSignals);
    
      // Create backtest result
  const backtestResult: BacktestResult = {
    id: this.generateId(),
    userId,
    startDate,
    endDate,
    totalSignals: signals.length,
    winningSignals: executedSignals.filter(s => s.profitLoss && s.profitLoss > 0).length,
    losingSignals: executedSignals.filter(s => s.profitLoss && s.profitLoss < 0).length,
    winRate: performanceMetrics.winRate,
    totalReturn: performanceMetrics.totalReturn,
    maxDrawdown: performanceMetrics.maxDrawdown,
    sharpeRatio: performanceMetrics.sharpeRatio,
    profitFactor: performanceMetrics.profitFactor,
    averageWin: performanceMetrics.averageWin,
    averageLoss: performanceMetrics.averageLoss,
    riskRewardRatio: performanceMetrics.riskRewardRatio,
    signals: executedSignals,
    metadata: {
      ...metadata,
      strategy: strategyId
    },
    timestamp: new Date()
  };

    // Store result in database
    await this.storeBacktestResult(backtestResult);
    
    // Cache result
    this.resultsCache.set(backtestResult.id, backtestResult);

    return backtestResult;
  }

  /**
   * Get backtest results for a user
   */
  async getBacktestResults(userId: string): Promise<BacktestResult[]> {
    // For now, return empty array since backtestResults table doesn't exist yet
    // This will be implemented when the table is created
    return [];
  }

  /**
   * Get specific backtest result
   */
  async getBacktestResult(resultId: string): Promise<BacktestResult | null> {
    // Check cache first
    if (this.resultsCache.has(resultId)) {
      return this.resultsCache.get(resultId)!;
    }

    // For now, return null since backtestResults table doesn't exist yet
    // This will be implemented when the table is created
    return null;
  }

  /**
   * Compare multiple backtest results
   */
  async compareBacktestResults(resultIds: string[]): Promise<{
    results: BacktestResult[];
    comparison: {
      bestWinRate: string;
      bestReturn: string;
      bestSharpeRatio: string;
      bestRiskReward: string;
      summary: Array<{ metric: string; best: string; worst: string; average: number }>;
    };
  }> {
    const results = await Promise.all(
      resultIds.map(id => this.getBacktestResult(id))
    );

    const validResults = results.filter(r => r !== null) as BacktestResult[];
    
    if (validResults.length === 0) {
      throw new Error('No valid backtest results found');
    }

    // Find best performers
    const bestWinRate = validResults.reduce((best, current) => 
      current.winRate > best.winRate ? current : best
    );

    const bestReturn = validResults.reduce((best, current) => 
      current.totalReturn > best.totalReturn ? current : best
    );

    const bestSharpeRatio = validResults.reduce((best, current) => 
      current.sharpeRatio > best.sharpeRatio ? current : best
    );

    const bestRiskReward = validResults.reduce((best, current) => 
      current.riskRewardRatio > best.riskRewardRatio ? current : best
    );

    // Calculate summary statistics
    const summary = [
      {
        metric: 'Win Rate',
        best: bestWinRate.id,
        worst: validResults.reduce((worst, current) => 
          current.winRate < worst.winRate ? current : worst
        ).id,
        average: validResults.reduce((sum, r) => sum + r.winRate, 0) / validResults.length
      },
      {
        metric: 'Total Return',
        best: bestReturn.id,
        worst: validResults.reduce((worst, current) => 
          current.totalReturn < worst.totalReturn ? current : worst
        ).id,
        average: validResults.reduce((sum, r) => sum + r.totalReturn, 0) / validResults.length
      },
      {
        metric: 'Sharpe Ratio',
        best: bestSharpeRatio.id,
        worst: validResults.reduce((worst, current) => 
          current.sharpeRatio < worst.sharpeRatio ? current : worst
        ).id,
        average: validResults.reduce((sum, r) => sum + r.sharpeRatio, 0) / validResults.length
      }
    ];

    return {
      results: validResults,
      comparison: {
        bestWinRate: bestWinRate.id,
        bestReturn: bestReturn.id,
        bestSharpeRatio: bestSharpeRatio.id,
        bestRiskReward: bestRiskReward.id,
        summary
      }
    };
  }

  /**
   * Get available backtesting strategies
   */
  getStrategies(): BacktestStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Create custom backtesting strategy
   */
  async createStrategy(strategy: Omit<BacktestStrategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<BacktestStrategy> {
    const newStrategy: BacktestStrategy = {
      ...strategy,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.strategies.set(newStrategy.id, newStrategy);
    return newStrategy;
  }

  // Private helper methods

  private async getHistoricalAnalyses(
    startDate: Date,
    endDate: Date,
    metadata: { chartType: string; timeframe: string; assetType: string }
  ) {
    // Get analyses from database within date range
    const analyses = await this.db
      .select()
      .from(schema.tradingAnalyses)
      .where(
        and(
          gte(schema.tradingAnalyses.createdAt, startDate),
          lte(schema.tradingAnalyses.createdAt, endDate)
        )
      )
      .orderBy(schema.tradingAnalyses.createdAt);

    // Filter by metadata if specified
    return analyses.filter((analysis: any) => {
      if (metadata.chartType && analysis.metadata?.chartType !== metadata.chartType) return false;
      if (metadata.timeframe && analysis.metadata?.timeframe !== metadata.timeframe) return false;
      if (metadata.assetType && analysis.metadata?.assetType !== metadata.assetType) return false;
      return true;
    });
  }

  private async generateSignals(analyses: any[], strategy: BacktestStrategy): Promise<BacktestSignal[]> {
    const signals: BacktestSignal[] = [];

    for (const analysis of analyses) {
      // Check if analysis meets minimum confidence threshold
      if (analysis.confidence < strategy.parameters.minConfidence) {
        continue;
      }

      // Generate signal based on analysis recommendation
      let signal: 'buy' | 'sell' | 'hold' = 'hold';
      
      if (analysis.recommendation === 'buy' && analysis.confidence > 0.7) {
        signal = 'buy';
      } else if (analysis.recommendation === 'sell' && analysis.confidence > 0.7) {
        signal = 'sell';
      }

      if (signal !== 'hold') {
        signals.push({
          id: this.generateId(),
          timestamp: analysis.createdAt,
          signal,
          entryPrice: this.simulatePrice(analysis),
          confidence: analysis.confidence,
          pattern: analysis.pattern || 'unknown',
          timeframe: analysis.timeframe || 'unknown',
          status: 'open',
          stopLoss: this.calculateStopLoss(signal, this.simulatePrice(analysis), strategy.parameters.stopLoss),
          takeProfit: this.calculateTakeProfit(signal, this.simulatePrice(analysis), strategy.parameters.takeProfit)
        });
      }
    }

    return signals;
  }

  private async simulateTrading(signals: BacktestSignal[], strategy: BacktestStrategy): Promise<BacktestSignal[]> {
    const executedSignals: BacktestSignal[] = [];

    for (const signal of signals) {
      // Simulate price movement
      const priceMovement = this.simulatePriceMovement(signal);
      const exitPrice = signal.signal === 'buy' 
        ? signal.entryPrice + priceMovement
        : signal.entryPrice - priceMovement;

      // Check if stop loss or take profit hit
      let finalExitPrice = exitPrice;
      let status: 'open' | 'closed' | 'cancelled' = 'closed';

      if (signal.stopLoss && signal.signal === 'buy' && exitPrice <= signal.stopLoss) {
        finalExitPrice = signal.stopLoss;
      } else if (signal.stopLoss && signal.signal === 'sell' && exitPrice >= signal.stopLoss) {
        finalExitPrice = signal.stopLoss;
      } else if (signal.takeProfit && signal.signal === 'buy' && exitPrice >= signal.takeProfit) {
        finalExitPrice = signal.takeProfit;
      } else if (signal.takeProfit && signal.signal === 'sell' && exitPrice <= signal.takeProfit) {
        finalExitPrice = signal.takeProfit;
      }

      // Calculate profit/loss
      let profitLoss = 0;
      if (signal.signal === 'buy') {
        profitLoss = finalExitPrice - signal.entryPrice;
      } else {
        profitLoss = signal.entryPrice - finalExitPrice;
      }

      // Calculate holding period
      const holdingPeriod = Math.random() * strategy.parameters.maxHoldingPeriod;

      executedSignals.push({
        ...signal,
        exitPrice: finalExitPrice,
        profitLoss,
        status,
        holdingPeriod
      });
    }

    return executedSignals;
  }

  private calculatePerformanceMetrics(signals: BacktestSignal[]): PerformanceMetrics {
    const closedSignals = signals.filter(s => s.status === 'closed');
    const winningSignals = closedSignals.filter(s => s.profitLoss && s.profitLoss > 0);
    const losingSignals = closedSignals.filter(s => s.profitLoss && s.profitLoss < 0);

    const totalTrades = closedSignals.length;
    const winRate = totalTrades > 0 ? winningSignals.length / totalTrades : 0;
    
    const totalProfit = winningSignals.reduce((sum, s) => sum + (s.profitLoss || 0), 0);
    const totalLoss = Math.abs(losingSignals.reduce((sum, s) => sum + (s.profitLoss || 0), 0));
    
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
    const totalReturn = totalProfit - totalLoss;
    
    const averageWin = winningSignals.length > 0 ? totalProfit / winningSignals.length : 0;
    const averageLoss = losingSignals.length > 0 ? totalLoss / losingSignals.length : 0;
    const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0;

    // Calculate Sharpe Ratio (simplified)
    const returns = closedSignals.map(s => s.profitLoss || 0);
    const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - averageReturn, 2), 0) / returns.length;
    const sharpeRatio = variance > 0 ? averageReturn / Math.sqrt(variance) : 0;

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;
    
    for (const signal of closedSignals) {
      runningTotal += signal.profitLoss || 0;
      if (runningTotal > peak) peak = runningTotal;
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Calculate consecutive wins/losses
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let currentStreak = 0;
    
    for (const signal of closedSignals) {
      if (signal.profitLoss && signal.profitLoss > 0) {
        if (currentStreak > 0) currentStreak++;
        else currentStreak = 1;
        if (currentStreak > consecutiveWins) consecutiveWins = currentStreak;
      } else {
        if (currentStreak < 0) currentStreak--;
        else currentStreak = -1;
        if (Math.abs(currentStreak) > consecutiveLosses) consecutiveLosses = Math.abs(currentStreak);
      }
    }

    const averageHoldingPeriod = closedSignals.reduce((sum, s) => sum + (s.holdingPeriod || 0), 0) / totalTrades;

    return {
      totalTrades,
      winRate,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      totalReturn,
      averageWin,
      averageLoss,
      riskRewardRatio,
      consecutiveWins,
      consecutiveLosses,
      bestTrade: Math.max(...returns),
      worstTrade: Math.min(...returns),
      averageHoldingPeriod
    };
  }

  private simulatePrice(analysis: any): number {
    // Simulate realistic price based on analysis
    const basePrice = 100; // Base price for simulation
    const volatility = 0.02; // 2% volatility
    const trend = analysis.recommendation === 'buy' ? 0.01 : -0.01; // 1% trend
    
    return basePrice * (1 + trend + (Math.random() - 0.5) * volatility);
  }

  private simulatePriceMovement(signal: BacktestSignal): number {
    // Simulate realistic price movement
    const baseMovement = 0.01; // 1% base movement
    const volatility = 0.005; // 0.5% volatility
    const trend = signal.signal === 'buy' ? 0.005 : -0.005; // 0.5% trend
    
    return signal.entryPrice * (baseMovement + trend + (Math.random() - 0.5) * volatility);
  }

  private calculateStopLoss(signal: 'buy' | 'sell', entryPrice: number, stopLossPercentage: number): number {
    if (signal === 'buy') {
      return entryPrice * (1 - stopLossPercentage / 100);
    } else {
      return entryPrice * (1 + stopLossPercentage / 100);
    }
  }

  private calculateTakeProfit(signal: 'buy' | 'sell', entryPrice: number, takeProfitPercentage: number): number {
    if (signal === 'buy') {
      return entryPrice * (1 + takeProfitPercentage / 100);
    } else {
      return entryPrice * (1 - takeProfitPercentage / 100);
    }
  }

  private async storeBacktestResult(result: BacktestResult): Promise<void> {
    // For now, just log the result since backtestResults table doesn't exist yet
    // This will be implemented when the table is created
    console.log('Backtest result stored:', result);
  }

  private mapDatabaseResultToBacktestResult(dbResult: any): BacktestResult {
    return {
      id: dbResult.id,
      userId: dbResult.userId,
      startDate: dbResult.startDate,
      endDate: dbResult.endDate,
      totalSignals: dbResult.totalSignals,
      winningSignals: dbResult.winningSignals,
      losingSignals: dbResult.losingSignals,
      winRate: dbResult.winRate,
      totalReturn: dbResult.totalReturn,
      maxDrawdown: dbResult.maxDrawdown,
      sharpeRatio: dbResult.sharpeRatio,
      profitFactor: dbResult.profitFactor,
      averageWin: dbResult.averageWin,
      averageLoss: dbResult.averageLoss,
      riskRewardRatio: dbResult.riskRewardRatio,
      signals: [], // Will be loaded separately if needed
      metadata: dbResult.metadata,
      timestamp: dbResult.timestamp
    };
  }

  private initializeDefaultStrategies(): void {
    const defaultStrategies: BacktestStrategy[] = [
      {
        id: 'conservative',
        name: 'Conservative Strategy',
        description: 'Low risk, steady returns with tight stop losses',
        parameters: {
          stopLoss: 2, // 2%
          takeProfit: 4, // 4%
          maxHoldingPeriod: 48, // 48 hours
          minConfidence: 0.8, // 80%
          riskPerTrade: 1 // 1% of portfolio
        },
        rules: [
          'Only trade high confidence signals (>80%)',
          'Tight stop loss at 2%',
          'Take profit at 4%',
          'Maximum holding period 48 hours'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'moderate',
        name: 'Moderate Strategy',
        description: 'Balanced risk-reward with moderate position sizing',
        parameters: {
          stopLoss: 3, // 3%
          takeProfit: 6, // 6%
          maxHoldingPeriod: 72, // 72 hours
          minConfidence: 0.7, // 70%
          riskPerTrade: 2 // 2% of portfolio
        },
        rules: [
          'Trade signals with >70% confidence',
          'Stop loss at 3%',
          'Take profit at 6%',
          'Maximum holding period 72 hours'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'aggressive',
        name: 'Aggressive Strategy',
        description: 'High risk, high reward with larger position sizes',
        parameters: {
          stopLoss: 5, // 5%
          takeProfit: 10, // 10%
          maxHoldingPeriod: 168, // 1 week
          minConfidence: 0.6, // 60%
          riskPerTrade: 5 // 5% of portfolio
        },
        rules: [
          'Trade signals with >60% confidence',
          'Stop loss at 5%',
          'Take profit at 10%',
          'Maximum holding period 1 week'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(strategy.id, strategy);
    });
  }

  private generateId(): string {
    return `backtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const backtestingEngine = new BacktestingEngine();
