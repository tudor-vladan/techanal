import { aiService, AIAnalysisRequest, AIAnalysisResponse } from './ai-service';
import { advancedPatternRecognition, PatternAnalysisResult } from './advanced-pattern-recognition';
import { ProcessedImageInfo } from './image-processing-utils';

export interface EnhancedAnalysisRequest extends AIAnalysisRequest {
  enableAdvancedPatterns?: boolean;
  enableTechnicalIndicators?: boolean;
  enableSupportResistance?: boolean;
}

export interface EnhancedAnalysisResponse extends AIAnalysisResponse {
  advancedPatterns?: PatternAnalysisResult;
  technicalAnalysis?: {
    indicators: any[];
    patterns: any[];
    supportResistance: any[];
    trend: any;
  };
  confidenceBreakdown?: {
    aiAnalysis: number;
    patternRecognition: number;
    technicalIndicators: number;
    overall: number;
  };
  recommendations?: {
    entry: string;
    exit: string;
    riskManagement: string;
    timeframe: string;
  };
}

export class EnhancedAIAnalysisService {
  private readonly defaultTimeout = 45000; // 45 seconds for enhanced analysis

  /**
   * Perform enhanced AI analysis with pattern recognition
   */
  async analyzeChart(request: EnhancedAnalysisRequest): Promise<EnhancedAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // Start parallel analysis
      const [aiAnalysis, patternAnalysis] = await Promise.all([
        this.performAIAnalysis(request),
        this.performPatternAnalysis(request)
      ]);

      // Combine and enhance results
      const enhancedResponse = await this.combineAnalysisResults(
        aiAnalysis, 
        patternAnalysis, 
        request
      );

      // Add confidence breakdown
      enhancedResponse.confidenceBreakdown = this.calculateConfidenceBreakdown(
        aiAnalysis, 
        patternAnalysis
      );

      // Add enhanced recommendations
      enhancedResponse.recommendations = this.generateEnhancedRecommendations(
        enhancedResponse,
        patternAnalysis
      );

      const processingTime = Date.now() - startTime;
      console.log(`Enhanced analysis completed in ${processingTime}ms`);

      return enhancedResponse;

    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      
      // Fallback to basic AI analysis
      const fallbackAnalysis = await this.performAIAnalysis(request);
      return {
        ...fallbackAnalysis,
        confidenceBreakdown: {
          aiAnalysis: fallbackAnalysis.confidenceLevel,
          patternRecognition: 0,
          technicalIndicators: 0,
          overall: fallbackAnalysis.confidenceLevel * 0.8
        },
        recommendations: {
          entry: 'Use basic AI analysis entry points',
          exit: 'Follow basic stop-loss and take-profit levels',
          riskManagement: 'Standard position sizing recommended',
          timeframe: '1h (default)'
        }
      };
    }
  }

  /**
   * Perform basic AI analysis
   */
  private async performAIAnalysis(request: EnhancedAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      return await aiService.analyze(request);
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform advanced pattern recognition analysis
   */
  private async performPatternAnalysis(request: EnhancedAnalysisRequest): Promise<PatternAnalysisResult | null> {
    if (!request.enableAdvancedPatterns) {
      return null;
    }

    try {
      // Convert base64 image to ProcessedImageInfo for pattern recognition
      const imageInfo: ProcessedImageInfo = {
        buffer: Buffer.from(request.imageBase64, 'base64'),
        info: {
          width: 1920, // Default chart width
          height: 1080, // Default chart height
          format: request.metadata?.imageFormat || 'jpeg',
          size: request.metadata?.imageSize || 100000,
          chartType: request.metadata?.chartType || 'candlestick',
          timeframe: request.metadata?.timeframe || '1h'
        }
      };

      return await advancedPatternRecognition.analyzeChart(imageInfo);
    } catch (error) {
      console.error('Pattern recognition failed:', error);
      return null;
    }
  }

  /**
   * Combine AI analysis with pattern recognition results
   */
  private async combineAnalysisResults(
    aiAnalysis: AIAnalysisResponse,
    patternAnalysis: PatternAnalysisResult | null,
    request: EnhancedAnalysisRequest
  ): Promise<EnhancedAnalysisResponse> {
    const enhancedResponse: EnhancedAnalysisResponse = {
      ...aiAnalysis,
      advancedPatterns: patternAnalysis || undefined
    };

    // Enhance technical indicators if pattern analysis is available
    if (patternAnalysis && request.enableTechnicalIndicators) {
      enhancedResponse.technicalAnalysis = {
        indicators: patternAnalysis.indicators,
        patterns: patternAnalysis.patterns,
        supportResistance: patternAnalysis.supportResistance,
        trend: patternAnalysis.trend
      };

      // Merge technical indicators
      enhancedResponse.technicalIndicators = {
        ...aiAnalysis.technicalIndicators,
        ...this.convertPatternIndicators(patternAnalysis.indicators)
      };
    }

    // Enhance confidence level based on pattern analysis
    if (patternAnalysis) {
      const patternConfidence = patternAnalysis.confidence;
      const aiConfidence = aiAnalysis.confidenceLevel;
      
      // Weighted average: AI analysis 60%, pattern recognition 40%
      enhancedResponse.confidenceLevel = Math.round(
        (aiConfidence * 0.6 + patternConfidence * 0.4) * 100
      ) / 100;
    }

    // Enhance analysis text with pattern insights
    if (patternAnalysis) {
      enhancedResponse.analysis = this.enhanceAnalysisText(
        aiAnalysis.analysis,
        patternAnalysis
      );
    }

    return enhancedResponse;
  }

  /**
   * Convert pattern recognition indicators to technical indicators format
   */
  private convertPatternIndicators(indicators: any[]): Record<string, any> {
    const converted: Record<string, any> = {};
    
    indicators.forEach(indicator => {
      switch (indicator.name.toLowerCase()) {
        case 'rsi':
          converted.rsi = indicator.value;
          break;
        case 'macd':
          converted.macd = {
            value: indicator.value,
            signal: indicator.signal,
            confidence: indicator.confidence
          };
          break;
        case 'bollinger bands':
          converted.bollingerBands = {
            position: indicator.value,
            signal: indicator.signal
          };
          break;
        case 'moving averages':
          converted.movingAverages = {
            crossover: indicator.value,
            signal: indicator.signal
          };
          break;
        case 'stochastic':
          converted.stochastic = {
            k: indicator.value,
            signal: indicator.signal
          };
          break;
        default:
          converted[indicator.name.toLowerCase()] = indicator.value;
      }
    });

    return converted;
  }

  /**
   * Enhance analysis text with pattern recognition insights
   */
  private enhanceAnalysisText(aiAnalysis: string, patternAnalysis: PatternAnalysisResult): string {
    let enhancedText = aiAnalysis;

    // Add pattern insights
    if (patternAnalysis.patterns.length > 0) {
      const patternNames = patternAnalysis.patterns.map(p => p.name).join(', ');
      enhancedText += `\n\nChart Pattern Analysis: Identified ${patternAnalysis.patterns.length} patterns including ${patternNames}. `;
      
      const reversalPatterns = patternAnalysis.patterns.filter(p => p.type === 'reversal');
      if (reversalPatterns.length > 0) {
        enhancedText += `${reversalPatterns.length} reversal patterns suggest potential trend change. `;
      }
    }

    // Add trend analysis
    if (patternAnalysis.trend) {
      enhancedText += `\nTrend Analysis: ${patternAnalysis.trend.direction} trend with ${Math.round(patternAnalysis.trend.strength * 100)}% strength on ${patternAnalysis.trend.timeframe} timeframe. `;
    }

    // Add support/resistance insights
    if (patternAnalysis.supportResistance.length > 0) {
      const strongLevels = patternAnalysis.supportResistance.filter(l => l.strength > 0.7);
      if (strongLevels.length > 0) {
        enhancedText += `\nKey Levels: ${strongLevels.length} strong support/resistance levels identified for risk management. `;
      }
    }

    return enhancedText;
  }

  /**
   * Calculate confidence breakdown across different analysis methods
   */
  private calculateConfidenceBreakdown(
    aiAnalysis: AIAnalysisResponse,
    patternAnalysis: PatternAnalysisResult | null
  ): EnhancedAnalysisResponse['confidenceBreakdown'] {
    const aiConfidence = aiAnalysis.confidenceLevel;
    const patternConfidence = patternAnalysis?.confidence || 0;
    
    // Calculate technical indicators confidence
    let technicalConfidence = 0;
    if (patternAnalysis?.indicators.length) {
      technicalConfidence = patternAnalysis.indicators.reduce((sum, i) => sum + i.confidence, 0) / patternAnalysis.indicators.length;
    }

    // Overall confidence is weighted average
    const overall = Math.round(
      (aiConfidence * 0.5 + patternConfidence * 0.3 + technicalConfidence * 0.2) * 100
    ) / 100;

    return {
      aiAnalysis: Math.round(aiConfidence * 100) / 100,
      patternRecognition: Math.round(patternConfidence * 100) / 100,
      technicalIndicators: Math.round(technicalConfidence * 100) / 100,
      overall
    };
  }

  /**
   * Generate enhanced trading recommendations
   */
  private generateEnhancedRecommendations(
    analysis: EnhancedAnalysisResponse,
    patternAnalysis: PatternAnalysisResult | null
  ): EnhancedAnalysisResponse['recommendations'] {
    const recommendation = analysis.recommendation;
    const confidence = analysis.confidenceLevel;

    // Entry strategy
    let entry = 'Wait for confirmation before entry';
    if (confidence > 0.8) {
      entry = recommendation === 'buy' ? 'Enter long position on pullback to support' : 
              recommendation === 'sell' ? 'Enter short position on bounce to resistance' : 
              'Wait for clearer signals';
    } else if (confidence > 0.6) {
      entry = recommendation === 'buy' ? 'Consider partial position on breakout' : 
              recommendation === 'sell' ? 'Consider partial position on breakdown' : 
              'Wait for trend confirmation';
    }

    // Exit strategy
    let exit = 'Use standard stop-loss and take-profit';
    if (analysis.stopLoss && analysis.takeProfit) {
      exit = `Stop-loss: ${analysis.stopLoss}, Take-profit: ${analysis.takeProfit}`;
    }

    // Risk management
    let riskManagement = 'Standard position sizing';
    if (confidence > 0.8) {
      riskManagement = 'Full position size (2-3% of portfolio)';
    } else if (confidence > 0.6) {
      riskManagement = 'Reduced position size (1-2% of portfolio)';
    } else {
      riskManagement = 'Minimal position size (0.5-1% of portfolio)';
    }

    // Timeframe
    let timeframe = '1h (default)';
    if (patternAnalysis?.trend?.timeframe) {
      timeframe = patternAnalysis.trend.timeframe;
    }

    return {
      entry,
      exit,
      riskManagement,
      timeframe
    };
  }

  /**
   * Get service capabilities
   */
  getCapabilities(): string[] {
    const aiCapabilities = aiService.getCapabilities();
    return [
      ...aiCapabilities,
      'advanced-pattern-recognition',
      'technical-indicator-analysis',
      'support-resistance-detection',
      'trend-analysis',
      'enhanced-recommendations'
    ];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const aiHealthy = await aiService.healthCheck();
      // Pattern recognition is always healthy (local processing)
      return aiHealthy;
    } catch (error) {
      return false;
    }
  }
}

export const enhancedAIAnalysis = new EnhancedAIAnalysisService();
