import { ProcessedImage } from './image-processing';

export interface AIAnalysisRequest {
  imagePath: string;
  userPrompt: string;
  userId: string;
}

export interface AIAnalysisResponse {
  recommendation: 'buy' | 'sell' | 'hold';
  confidenceLevel: number;
  stopLoss?: number;
  takeProfit?: number;
  technicalIndicators: Record<string, any>;
  analysis: string;
  reasoning: string;
  riskAssessment: string;
  positionSizing?: string;
  processingTime: number;
  cached: boolean;
}

export interface AIAnalysisError {
  code: string;
  message: string;
  details?: any;
}

export class AIAnalysisServiceOptimized {
  private readonly maxRetries = 3;
  private readonly timeoutMs = 30000; // 30 seconds
  private readonly fixedDelayMs = 2000; // Fixed 2 second delay instead of random 2-5s
  private readonly cache = new Map<string, { response: AIAnalysisResponse; timestamp: number }>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL

  /**
   * Analyzes a trading screenshot using AI with optimized performance
   */
  async analyzeScreenshot(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = this.getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        return {
          ...cachedResponse,
          processingTime: Date.now() - startTime,
          cached: true
        };
      }

      // For now, we'll use optimized mock AI service
      const response = await this.optimizedMockAIAnalysis(request);
      
      // Cache the response
      this.cacheResponse(cacheKey, response);
      
      return {
        ...response,
        processingTime: Date.now() - startTime,
        cached: false
      };
      
      // TODO: Implement real AI integration
      // return await this.callRealAIService(request);
    } catch (error) {
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: AIAnalysisRequest): string {
    // Create a deterministic cache key based on prompt content
    const promptHash = this.hashString(request.userPrompt.toLowerCase());
    return `${request.userId}-${promptHash}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get cached response if valid
   */
  private getCachedResponse(cacheKey: string): AIAnalysisResponse | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.response;
  }

  /**
   * Cache response
   */
  private cacheResponse(cacheKey: string, response: AIAnalysisResponse): void {
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries if cache gets too large
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Optimized mock AI analysis with fixed delay and deterministic responses
   */
  private async optimizedMockAIAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Fixed delay instead of random 2-5s
    await new Promise(resolve => setTimeout(resolve, this.fixedDelayMs));

    // Generate deterministic analysis based on prompt content
    const promptLower = request.userPrompt.toLowerCase();
    const recommendation = this.determineRecommendation(promptLower);
    const confidenceLevel = this.calculateConfidence(promptLower, recommendation);
    
    // Generate deterministic technical indicators
    const technicalIndicators = this.generateDeterministicIndicators(promptLower);
    
    // Generate deterministic price levels
    const currentPrice = 100;
    const stopLoss = recommendation === 'buy' ? currentPrice * 0.95 : currentPrice * 1.05;
    const takeProfit = recommendation === 'buy' ? currentPrice * 1.08 : currentPrice * 0.92;

    // Generate analysis text
    const analysis = this.generateDeterministicAnalysis(recommendation, confidenceLevel, technicalIndicators);
    const reasoning = this.generateDeterministicReasoning(recommendation, technicalIndicators);
    const riskAssessment = this.generateDeterministicRiskAssessment(recommendation, confidenceLevel);

    return {
      recommendation,
      confidenceLevel,
      stopLoss,
      takeProfit,
      technicalIndicators,
      analysis,
      reasoning,
      riskAssessment,
      positionSizing: this.generateDeterministicPositionSizing(confidenceLevel),
      processingTime: 0, // Will be set by caller
      cached: false
    };
  }

  /**
   * Determine recommendation based on prompt content (deterministic)
   */
  private determineRecommendation(prompt: string): 'buy' | 'sell' | 'hold' {
    if (prompt.includes('bullish') || prompt.includes('uptrend') || prompt.includes('support')) {
      return 'buy';
    } else if (prompt.includes('bearish') || prompt.includes('downtrend') || prompt.includes('resistance')) {
      return 'sell';
    }
    return 'hold';
  }

  /**
   * Calculate confidence level (deterministic)
   */
  private calculateConfidence(prompt: string, recommendation: string): number {
    let baseConfidence = 0.5;
    
    if (recommendation === 'buy') {
      if (prompt.includes('strong') || prompt.includes('clear')) baseConfidence = 0.8;
      else if (prompt.includes('moderate') || prompt.includes('potential')) baseConfidence = 0.7;
      else baseConfidence = 0.65;
    } else if (recommendation === 'sell') {
      if (prompt.includes('strong') || prompt.includes('clear')) baseConfidence = 0.75;
      else if (prompt.includes('moderate') || prompt.includes('potential')) baseConfidence = 0.65;
      else baseConfidence = 0.6;
    } else {
      baseConfidence = 0.5;
    }
    
    return Math.min(0.95, Math.max(0.3, baseConfidence));
  }

  /**
   * Generate deterministic technical indicators
   */
  private generateDeterministicIndicators(prompt: string): Record<string, any> {
    // Use prompt hash to generate consistent indicators
    const promptHash = this.hashString(prompt);
    
    return {
      rsi: 40 + (promptHash % 30), // 40-70 range
      macd: {
        macd: -0.3 + (promptHash % 60) / 100, // -0.3 to 0.3
        signal: -0.2 + (promptHash % 40) / 100, // -0.2 to 0.2
        histogram: -0.1 + (promptHash % 30) / 100 // -0.1 to 0.2
      },
      bollingerBands: {
        upper: 1.05 + (promptHash % 10) / 100, // 1.05 to 1.15
        middle: 1.0,
        lower: 0.95 - (promptHash % 10) / 100 // 0.85 to 0.95
      },
      movingAverages: {
        sma20: 0.98 + (promptHash % 8) / 100, // 0.98 to 1.06
        sma50: 1.0 + (promptHash % 4) / 100, // 1.0 to 1.04
        ema12: 0.99 + (promptHash % 6) / 100 // 0.99 to 1.05
      }
    };
  }

  /**
   * Generate deterministic analysis text
   */
  private generateDeterministicAnalysis(
    recommendation: string, 
    confidence: number, 
    indicators: Record<string, any>
  ): string {
    const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'moderate' : 'low';
    
    return `Based on the technical analysis of this trading chart, I recommend a ${recommendation.toUpperCase()} position with ${confidenceText} confidence (${Math.round(confidence * 100)}%).

The RSI indicator shows ${indicators.rsi > 50 ? 'bullish' : 'bearish'} momentum at ${indicators.rsi.toFixed(1)}, while the MACD indicates ${indicators.macd.histogram > 0 ? 'positive' : 'negative'} divergence.

Bollinger Bands suggest the price is currently ${indicators.bollingerBands.upper > 1.05 ? 'testing resistance' : 'within normal range'}, and moving averages show a ${indicators.movingAverages.sma20 > indicators.movingAverages.sma50 ? 'bullish' : 'bearish'} trend.`;
  }

  /**
   * Generate deterministic reasoning text
   */
  private generateDeterministicReasoning(
    recommendation: string, 
    indicators: Record<string, any>
  ): string {
    if (recommendation === 'buy') {
      return `The buy recommendation is based on several technical factors: RSI below 50 suggests oversold conditions, MACD histogram turning positive indicates momentum shift, and price above key moving averages shows trend strength. Support levels appear to be holding, creating a favorable risk-reward scenario.`;
    } else if (recommendation === 'sell') {
      return `The sell recommendation considers: RSI above 70 indicates overbought conditions, MACD showing bearish divergence, and price approaching resistance levels. The bearish crossover in moving averages suggests trend reversal, making short positions favorable.`;
    } else {
      return `A hold recommendation is appropriate as the chart shows mixed signals: RSI is neutral, MACD lacks clear direction, and price is consolidating within a range. Waiting for clearer breakout signals or trend confirmation would be prudent.`;
    }
  }

  /**
   * Generate deterministic risk assessment
   */
  private generateDeterministicRiskAssessment(
    recommendation: string, 
    confidence: number
  ): string {
    const riskLevel = confidence > 0.8 ? 'low' : confidence > 0.6 ? 'moderate' : 'high';
    
    return `Risk assessment: ${riskLevel.toUpperCase()} risk level. 

${recommendation === 'buy' ? 'Key risks include: potential support breakdown, broader market weakness, and false breakout signals. Monitor volume confirmation and set tight stop-losses.' : 
  recommendation === 'sell' ? 'Key risks include: short squeeze potential, support level bounces, and trend continuation. Use proper position sizing and consider hedging strategies.' : 
  'Key risks include: missing breakout opportunities, range-bound losses, and timing market entry. Consider partial positions and wait for confirmation.'}

Position sizing should be ${confidence > 0.8 ? 'standard' : confidence > 0.6 ? 'reduced' : 'minimal'} based on confidence level.`;
  }

  /**
   * Generate deterministic position sizing
   */
  private generateDeterministicPositionSizing(confidence: number): string {
    if (confidence > 0.8) {
      return 'Standard position size (2-3% of portfolio) recommended due to high confidence signals.';
    } else if (confidence > 0.6) {
      return 'Reduced position size (1-2% of portfolio) advised due to moderate confidence.';
    } else {
      return 'Minimal position size (0.5-1% of portfolio) or wait for better signals due to low confidence.';
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number; ttl: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track actual hits/misses
      ttl: this.cacheTTL
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const aiAnalysisServiceOptimized = new AIAnalysisServiceOptimized();
