import { AIAnalysisResponse, AIAnalysisRequest } from './ai-service';
import { PatternAnalysisResult } from './advanced-pattern-recognition';
import { EnhancedAnalysisResponse } from './enhanced-ai-analysis';

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  lastReset: Date;
}

export interface CachedAnalysis {
  result: EnhancedAnalysisResponse;
  timestamp: number;
  accessCount: number;
  size: number;
}

export class PerformanceOptimizer {
  private cache: Map<string, CachedAnalysis> = new Map();
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    memoryUsage: 0,
    lastReset: new Date()
  };
  private totalResponseTime = 0;
  private totalErrors = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private config: CacheConfig;

  constructor(config: CacheConfig = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    cleanupInterval: 60 * 1000 // 1 minute
  }) {
    this.config = config;
    
    if (this.config.enabled) {
      this.startCleanupInterval();
    }
  }

  /**
   * Generate cache key for analysis request
   */
  private generateCacheKey(request: AIAnalysisRequest): string {
    const keyData = {
      prompt: request.prompt.toLowerCase().trim(),
      chartType: request.metadata?.chartType || 'unknown',
      timeframe: request.metadata?.timeframe || 'unknown',
      imageHash: this.hashImage(request.imageBase64)
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * Simple hash function for image data
   */
  private hashImage(imageBase64: string): string {
    let hash = 0;
    const str = imageBase64.substring(0, 1000); // Use first 1000 chars for performance
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * Check if result is cached and valid
   */
  async getCachedResult(request: AIAnalysisRequest): Promise<EnhancedAnalysisResponse | null> {
    if (!this.config.enabled) return null;

    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      this.cacheMisses++;
      return null;
    }

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(cacheKey);
      this.cacheMisses++;
      return null;
    }

    // Update access count and timestamp
    cached.accessCount++;
    cached.timestamp = Date.now();
    this.cache.set(cacheKey, cached);
    
    this.cacheHits++;
    return cached.result;
  }

  /**
   * Cache analysis result
   */
  async cacheResult(request: AIAnalysisRequest, result: EnhancedAnalysisResponse): Promise<void> {
    if (!this.config.enabled) return;

    const cacheKey = this.generateCacheKey(request);
    const size = this.estimateResultSize(result);
    
    const cachedAnalysis: CachedAnalysis = {
      result,
      timestamp: Date.now(),
      accessCount: 1,
      size
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(cacheKey, cachedAnalysis);
  }

  /**
   * Estimate the size of a result in bytes
   */
  private estimateResultSize(result: EnhancedAnalysisResponse): number {
    return JSON.stringify(result).length;
  }

  /**
   * Evict least used cache entries
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count and timestamp (least used first)
    entries.sort((a, b) => {
      if (a[1].accessCount !== b[1].accessCount) {
        return a[1].accessCount - b[1].accessCount;
      }
      return a[1].timestamp - b[1].timestamp;
    });

    // Remove 20% of least used entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Start cleanup interval for expired cache entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  /**
   * Remove expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Record performance metrics
   */
  recordMetrics(responseTime: number, isError: boolean = false): void {
    this.metrics.requestCount++;
    this.totalResponseTime += responseTime;
    
    if (isError) {
      this.totalErrors++;
    }

    // Update average response time
    this.metrics.averageResponseTime = this.totalResponseTime / Math.max(this.metrics.requestCount, 1);
    
    // Update cache hit rate
    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    if (totalCacheRequests > 0) {
      this.metrics.cacheHitRate = this.cacheHits / totalCacheRequests;
    }
    
    // Update error rate
    this.metrics.errorRate = this.totalErrors / Math.max(this.metrics.requestCount, 1);
    
    // Update memory usage
    this.metrics.memoryUsage = this.getMemoryUsage();
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      return Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    }
    return 0;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      memoryUsage: 0,
      lastReset: new Date()
    };
    this.totalResponseTime = 0;
    this.totalErrors = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
    enabled: boolean;
  } {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.getMemoryUsage(),
      enabled: this.config.enabled
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('Cache cleared');
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && !this.config.cleanupInterval) {
      this.startCleanupInterval();
    }
    
    console.log('Cache configuration updated:', this.config);
  }

  /**
   * Health check for the performance optimizer
   */
  healthCheck(): {
    status: 'healthy' | 'warning' | 'unhealthy';
    details: {
      cacheEnabled: boolean;
      cacheSize: number;
      memoryUsage: number;
      errorRate: number;
    };
  } {
    const memoryUsage = this.getMemoryUsage();
    const errorRate = this.metrics.errorRate;
    
    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    
    if (memoryUsage > 500 || errorRate > 0.1) { // 500MB or 10% error rate
      status = 'warning';
    }
    
    if (memoryUsage > 1000 || errorRate > 0.2) { // 1GB or 20% error rate
      status = 'unhealthy';
    }
    
    return {
      status,
      details: {
        cacheEnabled: this.config.enabled,
        cacheSize: this.cache.size,
        memoryUsage,
        errorRate: Math.round(errorRate * 100) / 100
      }
    };
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
