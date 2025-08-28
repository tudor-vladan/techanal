import { EnhancedAnalysisResponse } from './enhanced-ai-analysis';

export interface OptimizationConfig {
  enabled: boolean;
  compression: boolean;
  minify: boolean;
  removeNulls: boolean;
  truncateLongText: boolean;
  maxTextLength: number;
  includeMetadata: boolean;
}

export interface OptimizedResponse {
  data: any;
  size: {
    original: number;
    optimized: number;
    compressionRatio: number;
  };
  optimization: {
    compressed: boolean;
    minified: boolean;
    nullsRemoved: boolean;
    textTruncated: boolean;
  };
  metadata?: {
    timestamp: string;
    version: string;
    processingTime: number;
  };
}

export class ResponseOptimizer {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig = {
    enabled: true,
    compression: true,
    minify: true,
    removeNulls: true,
    truncateLongText: true,
    maxTextLength: 1000,
    includeMetadata: false
  }) {
    this.config = config;
  }

  /**
   * Optimize API response for better performance
   */
  optimizeResponse(
    response: EnhancedAnalysisResponse,
    processingTime?: number
  ): OptimizedResponse {
    if (!this.config.enabled) {
      return {
        data: response,
        size: { original: 0, optimized: 0, compressionRatio: 1 },
        optimization: {
          compressed: false,
          minified: false,
          nullsRemoved: false,
          textTruncated: false
        }
      };
    }

    const originalSize = JSON.stringify(response).length;
    let optimizedData = { ...response };

    // Remove null values
    if (this.config.removeNulls) {
      optimizedData = this.removeNullValues(optimizedData);
    }

    // Truncate long text fields
    if (this.config.truncateLongText) {
      optimizedData = this.truncateLongText(optimizedData);
    }

    // Add metadata if enabled
    if (this.config.includeMetadata && processingTime !== undefined) {
      optimizedData = this.addMetadata(optimizedData, processingTime);
    }

    const optimizedSize = JSON.stringify(optimizedData).length;
    const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;

    return {
      data: optimizedData,
      size: {
        original: originalSize,
        optimized: optimizedSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100
      },
      optimization: {
        compressed: this.config.compression && compressionRatio < 1,
        minified: this.config.minify,
        nullsRemoved: this.config.removeNulls,
        textTruncated: this.config.truncateLongText
      }
    };
  }

  /**
   * Remove null and undefined values from response
   */
  private removeNullValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj
        .map(item => this.removeNullValues(item))
        .filter(item => item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.removeNullValues(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }

    return obj;
  }

  /**
   * Truncate long text fields to improve performance
   */
  private truncateLongText(obj: any): any {
    if (typeof obj === 'string' && obj.length > this.config.maxTextLength) {
      return obj.substring(0, this.config.maxTextLength) + '...';
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.truncateLongText(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const truncated: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        truncated[key] = this.truncateLongText(value);
      }
      
      return truncated;
    }

    return obj;
  }

  /**
   * Add metadata to response
   */
  private addMetadata(data: any, processingTime: number): any {
    return {
      ...data,
      _metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        processingTime: Math.round(processingTime),
        optimized: true
      }
    };
  }

  /**
   * Create a lightweight response for high-traffic scenarios
   */
  createLightweightResponse(response: EnhancedAnalysisResponse): any {
    return {
      recommendation: response.recommendation,
      confidence: Math.round(response.confidenceLevel * 100) / 100,
      summary: this.createSummary(response),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a summary of the analysis for lightweight responses
   */
  private createSummary(response: EnhancedAnalysisResponse): string {
    const parts: string[] = [];
    
    parts.push(`${response.recommendation.toUpperCase()} recommendation`);
    parts.push(`${Math.round(response.confidenceLevel * 100)}% confidence`);
    
    if (response.stopLoss && response.takeProfit) {
      parts.push(`SL: ${response.stopLoss}, TP: ${response.takeProfit}`);
    }
    
    if (response.technicalAnalysis?.patterns && response.technicalAnalysis.patterns.length > 0) {
      const patternCount = response.technicalAnalysis.patterns.length;
      parts.push(`${patternCount} pattern${patternCount > 1 ? 's' : ''} detected`);
    }
    
    return parts.join(' | ');
  }

  /**
   * Create a detailed response with all information
   */
  createDetailedResponse(response: EnhancedAnalysisResponse): any {
    return {
      ...response,
      _metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        detailed: true
      }
    };
  }

  /**
   * Update optimization configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Response optimization configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Health check for the response optimizer
   */
  healthCheck(): {
    status: 'healthy' | 'warning' | 'unhealthy';
    details: {
      enabled: boolean;
      compression: boolean;
      minify: boolean;
      removeNulls: boolean;
      truncateLongText: boolean;
    };
  } {
    return {
      status: 'healthy',
      details: {
        enabled: this.config.enabled,
        compression: this.config.compression,
        minify: this.config.minify,
        removeNulls: this.config.removeNulls,
        truncateLongText: this.config.truncateLongText
      }
    };
  }
}

export const responseOptimizer = new ResponseOptimizer();
