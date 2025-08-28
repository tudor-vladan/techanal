import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
  rssMB: number;
  memoryUsage: number;
  gcDuration: number;
  gcCount: number;
}

export interface ResourceMetrics {
  activeConnections: number;
  idleConnections: number;
  connectionPoolSize: number;
  cacheSize: number;
  cacheHitRate: number;
  activeRequests: number;
  queuedRequests: number;
  processingTime: number;
}

export interface OptimizationConfig {
  maxMemoryUsage: number; // MB
  gcThreshold: number; // MB
  connectionPoolLimit: number;
  cacheSizeLimit: number;
  monitoringInterval: number; // ms
  autoOptimization: boolean;
  memoryLeakDetection: boolean;
}

export interface OptimizationResult {
  success: boolean;
  action: string;
  beforeMetrics: MemoryMetrics;
  afterMetrics: MemoryMetrics;
  improvement: number;
  duration: number;
}

export class MemoryOptimizer extends EventEmitter {
  private readonly config: OptimizationConfig;
  private readonly memoryHistory: MemoryMetrics[] = [];
  private readonly resourceHistory: ResourceMetrics[] = [];
  private readonly maxHistorySize = 100;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastGCTime = 0;
  private gcCount = 0;
  private optimizationCount = 0;

  constructor() {
    super();
    this.config = {
      maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || '512'), // 512MB
      gcThreshold: parseInt(process.env.GC_THRESHOLD || '256'), // 256MB
      connectionPoolLimit: parseInt(process.env.CONNECTION_POOL_LIMIT || '50'),
      cacheSizeLimit: parseInt(process.env.CACHE_SIZE_LIMIT || '1000'),
      monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || '5000'), // 5s
      autoOptimization: process.env.AUTO_OPTIMIZATION !== 'false',
      memoryLeakDetection: process.env.MEMORY_LEAK_DETECTION !== 'false'
    };
  }

  /**
   * Start memory and resource monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('🔍 Starting memory and resource monitoring...');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzeMemoryUsage();
      this.detectMemoryLeaks();
      this.autoOptimize();
    }, this.config.monitoringInterval);

    console.log('✅ Memory and resource monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('🛑 Stopping memory and resource monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Memory and resource monitoring stopped');
  }

  /**
   * Collect current memory and resource metrics
   */
  private collectMetrics(): void {
    try {
      // Collect memory metrics
      const memUsage = process.memoryUsage();
      const memoryMetrics: MemoryMetrics = {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
        externalMB: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
        rssMB: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
        memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100 * 100) / 100,
        gcDuration: 0,
        gcCount: this.gcCount
      };

      // Collect resource metrics (simulated for now)
      const resourceMetrics: ResourceMetrics = {
        activeConnections: Math.floor(Math.random() * 20) + 5,
        idleConnections: Math.floor(Math.random() * 10) + 2,
        connectionPoolSize: this.config.connectionPoolLimit,
        cacheSize: Math.floor(Math.random() * 500) + 100,
        cacheHitRate: Math.random() * 100,
        activeRequests: Math.floor(Math.random() * 15) + 3,
        queuedRequests: Math.floor(Math.random() * 8) + 1,
        processingTime: Math.random() * 100 + 10
      };

      // Store metrics in history
      this.memoryHistory.push(memoryMetrics);
      this.resourceHistory.push(resourceMetrics);

      // Limit history size
      if (this.memoryHistory.length > this.maxHistorySize) {
        this.memoryHistory.shift();
      }
      if (this.resourceHistory.length > this.maxHistorySize) {
        this.resourceHistory.shift();
      }

      // Emit metrics for external monitoring
      this.emit('metrics', { memory: memoryMetrics, resources: resourceMetrics });

    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  /**
   * Analyze memory usage patterns
   */
  private analyzeMemoryUsage(): void {
    if (this.memoryHistory.length < 3) return;

    try {
      const current = this.memoryHistory[this.memoryHistory.length - 1];
      const previous = this.memoryHistory[this.memoryHistory.length - 2];
      const older = this.memoryHistory[this.memoryHistory.length - 3];

      // Calculate memory growth rate
      const growthRate = ((current.heapUsed - previous.heapUsed) / previous.heapUsed) * 100;
      const avgGrowthRate = ((current.heapUsed - older.heapUsed) / older.heapUsed) * 100;

      // Check for memory pressure
      if (current.heapUsedMB > this.config.maxMemoryUsage * 0.8) {
        console.log(`⚠️  High memory usage detected: ${current.heapUsedMB}MB (${current.memoryUsage}%)`);
        this.emit('memory-pressure', current);
      }

      // Check for rapid memory growth
      if (growthRate > 20 || avgGrowthRate > 15) {
        console.log(`⚠️  Rapid memory growth detected: ${growthRate.toFixed(2)}% (avg: ${avgGrowthRate.toFixed(2)}%)`);
        this.emit('memory-growth', { current, growthRate, avgGrowthRate });
      }

      // Check memory efficiency
      const efficiency = this.calculateMemoryEfficiency(current);
      if (efficiency < 60) {
        console.log(`⚠️  Low memory efficiency: ${efficiency.toFixed(1)}%`);
        this.emit('memory-inefficiency', { current, efficiency });
      }

    } catch (error) {
      console.error('Failed to analyze memory usage:', error);
    }
  }

  /**
   * Detect potential memory leaks
   */
  private detectMemoryLeaks(): void {
    if (!this.config.memoryLeakDetection || this.memoryHistory.length < 10) return;

    try {
      const recent = this.memoryHistory.slice(-10);
      const older = this.memoryHistory.slice(-20, -10);

      if (recent.length < 10 || older.length < 10) return;

      // Calculate average memory usage for recent vs older periods
      const recentAvg = recent.reduce((sum, m) => sum + m.heapUsed, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.heapUsed, 0) / older.length;

      // Check for sustained memory growth
      const sustainedGrowth = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (sustainedGrowth > 25) {
        console.log(`🚨 Potential memory leak detected: sustained growth of ${sustainedGrowth.toFixed(2)}%`);
        this.emit('memory-leak-detected', { recentAvg, olderAvg, sustainedGrowth });
        
        // Trigger immediate optimization
        this.forceGarbageCollection();
      }

    } catch (error) {
      console.error('Failed to detect memory leaks:', error);
    }
  }

  /**
   * Auto-optimize based on current conditions
   */
  private autoOptimize(): void {
    if (!this.config.autoOptimization) return;

    try {
      const current = this.memoryHistory[this.memoryHistory.length - 1];
      if (!current) return;

      // Check if optimization is needed
      if (current.heapUsedMB > this.config.gcThreshold) {
        console.log(`🔧 Auto-optimization triggered: memory usage ${current.heapUsedMB}MB > threshold ${this.config.gcThreshold}MB`);
        this.forceGarbageCollection();
      }

      // Check resource pool optimization
      if (this.resourceHistory.length > 0) {
        const currentResources = this.resourceHistory[this.resourceHistory.length - 1];
        this.optimizeResourcePools(currentResources);
      }

    } catch (error) {
      console.error('Auto-optimization failed:', error);
    }
  }

  /**
   * Force garbage collection
   */
  private forceGarbageCollection(): void {
    try {
      const startTime = performance.now();
      const beforeMetrics = this.getCurrentMemoryMetrics();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        this.gcCount++;
        console.log('🧹 Forced garbage collection completed');
      } else {
        console.log('⚠️  Garbage collection not available (use --expose-gc flag)');
        // Alternative: suggest manual optimization
        this.suggestOptimizations();
        return;
      }

      // Wait a bit for GC to complete
      setTimeout(() => {
        const afterMetrics = this.getCurrentMemoryMetrics();
        const improvement = ((beforeMetrics.heapUsed - afterMetrics.heapUsed) / beforeMetrics.heapUsed) * 100;

        console.log(`✅ Garbage collection completed: ${improvement.toFixed(2)}% memory freed`);
        
        const result: OptimizationResult = {
          success: true,
          action: 'garbage_collection',
          beforeMetrics,
          afterMetrics,
          improvement: Math.round(improvement * 100) / 100,
          duration: performance.now() - startTime
        };

        this.emit('optimization-completed', result);
        this.optimizationCount++;

      }, 100);

    } catch (error) {
      console.error('Garbage collection failed:', error);
    }
  }

  /**
   * Optimize resource pools
   */
  private optimizeResourcePools(resources: ResourceMetrics): void {
    try {
      // Optimize connection pool
      if (resources.activeConnections > resources.connectionPoolSize * 0.8) {
        console.log(`🔧 Connection pool optimization: ${resources.activeConnections}/${resources.connectionPoolSize} connections active`);
        this.emit('connection-pool-optimization', resources);
      }

      // Optimize cache size
      if (resources.cacheSize > this.config.cacheSizeLimit * 0.9) {
        console.log(`🔧 Cache optimization: ${resources.cacheSize}/${this.config.cacheSizeLimit} items in cache`);
        this.emit('cache-optimization', resources);
      }

      // Optimize request queue
      if (resources.queuedRequests > 5) {
        console.log(`🔧 Request queue optimization: ${resources.queuedRequests} requests queued`);
        this.emit('request-queue-optimization', resources);
      }

    } catch (error) {
      console.error('Resource pool optimization failed:', error);
    }
  }

  /**
   * Suggest manual optimizations
   */
  private suggestOptimizations(): void {
    const suggestions = [];

    if (this.memoryHistory.length > 0) {
      const current = this.memoryHistory[this.memoryHistory.length - 1];
      
      if (current.memoryUsage > 80) {
        suggestions.push('Reduce memory allocation in hot paths');
      }
      
      if (current.externalMB > 100) {
        suggestions.push('Review external memory usage (buffers, streams)');
      }
    }

    if (this.resourceHistory.length > 0) {
      const current = this.resourceHistory[this.resourceHistory.length - 1];
      
      if (current.cacheSize > this.config.cacheSizeLimit * 0.8) {
        suggestions.push('Implement cache eviction strategy');
      }
      
      if (current.activeConnections > this.config.connectionPoolLimit * 0.7) {
        suggestions.push('Review connection pool sizing');
      }
    }

    if (suggestions.length > 0) {
      console.log('💡 Optimization suggestions:');
      suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }
  }

  /**
   * Calculate memory efficiency
   */
  private calculateMemoryEfficiency(metrics: MemoryMetrics): number {
    // Higher efficiency means better memory utilization
    const heapEfficiency = (metrics.heapUsed / metrics.heapTotal) * 100;
    const externalEfficiency = Math.max(0, 100 - (metrics.externalMB / 10)); // Penalize high external memory
    
    return Math.round((heapEfficiency * 0.7 + externalEfficiency * 0.3) * 100) / 100;
  }

  /**
   * Get current memory metrics
   */
  private getCurrentMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      externalMB: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
      rssMB: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100 * 100) / 100,
      gcDuration: 0,
      gcCount: this.gcCount
    };
  }

  /**
   * Get comprehensive memory and resource statistics
   */
  getStats(): {
    memory: MemoryMetrics;
    resources: ResourceMetrics;
    monitoring: {
      isActive: boolean;
      historySize: number;
      optimizationCount: number;
      lastGCTime: number;
    };
    efficiency: {
      memoryEfficiency: number;
      resourceEfficiency: number;
      overallEfficiency: number;
    };
  } {
    const currentMemory = this.memoryHistory.length > 0 
      ? this.memoryHistory[this.memoryHistory.length - 1] 
      : this.getCurrentMemoryMetrics();
    
    const currentResources = this.resourceHistory.length > 0 
      ? this.resourceHistory[this.resourceHistory.length - 1]
      : {
          activeConnections: 0,
          idleConnections: 0,
          connectionPoolSize: this.config.connectionPoolLimit,
          cacheSize: 0,
          cacheHitRate: 0,
          activeRequests: 0,
          queuedRequests: 0,
          processingTime: 0
        };

    const memoryEfficiency = this.calculateMemoryEfficiency(currentMemory);
    const resourceEfficiency = this.calculateResourceEfficiency(currentResources);
    const overallEfficiency = Math.round((memoryEfficiency * 0.6 + resourceEfficiency * 0.4) * 100) / 100;

    return {
      memory: currentMemory,
      resources: currentResources,
      monitoring: {
        isActive: this.isMonitoring,
        historySize: this.memoryHistory.length,
        optimizationCount: this.optimizationCount,
        lastGCTime: this.lastGCTime
      },
      efficiency: {
        memoryEfficiency,
        resourceEfficiency,
        overallEfficiency
      }
    };
  }

  /**
   * Calculate resource efficiency
   */
  private calculateResourceEfficiency(resources: ResourceMetrics): number {
    const connectionEfficiency = Math.max(0, 100 - (resources.activeConnections / resources.connectionPoolSize) * 100);
    const cacheEfficiency = Math.max(0, 100 - (resources.cacheSize / this.config.cacheSizeLimit) * 100);
    const requestEfficiency = Math.max(0, 100 - (resources.queuedRequests / 10) * 100);
    
    return Math.round((connectionEfficiency * 0.4 + cacheEfficiency * 0.3 + requestEfficiency * 0.3) * 100) / 100;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    Object.assign(this.config, newConfig);
    console.log('⚙️  Memory optimizer configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Manual optimization trigger
   */
  async manualOptimize(): Promise<OptimizationResult> {
    console.log('🔧 Manual optimization triggered...');
    
    const startTime = performance.now();
    const beforeMetrics = this.getCurrentMemoryMetrics();
    
    try {
      // Force garbage collection
      this.forceGarbageCollection();
      
      // Wait for optimization to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const afterMetrics = this.getCurrentMemoryMetrics();
      const improvement = ((beforeMetrics.heapUsed - afterMetrics.heapUsed) / beforeMetrics.heapUsed) * 100;
      
      const result: OptimizationResult = {
        success: true,
        action: 'manual_optimization',
        beforeMetrics,
        afterMetrics,
        improvement: Math.round(improvement * 100) / 100,
        duration: performance.now() - startTime
      };
      
      console.log(`✅ Manual optimization completed: ${result.improvement}% improvement`);
      return result;
      
    } catch (error) {
      console.error('Manual optimization failed:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  healthCheck(): boolean {
    try {
      const stats = this.getStats();
      return stats.efficiency.overallEfficiency > 70;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    this.stopMonitoring();
    this.removeAllListeners();
    console.log('🔌 Memory optimizer shutdown completed');
  }
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizer();
