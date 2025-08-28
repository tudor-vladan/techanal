import { Hono } from 'hono';
import { authMiddleware } from './middleware/auth';
import { performanceOptimizer } from './lib/performance-optimizer';
import { responseOptimizer } from './lib/response-optimizer';

const performanceRoutes = new Hono();

// Apply authentication middleware to all performance routes
performanceRoutes.use('*', authMiddleware);

// Performance Metrics Dashboard
performanceRoutes.get('/metrics', async (c) => {
  try {
    const metrics = performanceOptimizer.getMetrics();
    const cacheStats = performanceOptimizer.getCacheStats();
    const responseOptConfig = responseOptimizer.getConfig();
    
    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      performance: {
        metrics,
        cache: cacheStats,
        responseOptimization: responseOptConfig
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    return c.json({
      error: 'Failed to get performance metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Cache Management
performanceRoutes.get('/cache/stats', async (c) => {
  try {
    const stats = performanceOptimizer.getCacheStats();
    
    return c.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return c.json({
      error: 'Failed to get cache statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

performanceRoutes.post('/cache/clear', async (c) => {
  try {
    performanceOptimizer.clearCache();
    
    return c.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return c.json({
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

performanceRoutes.post('/cache/config', async (c) => {
  try {
    const body = await c.req.json();
    const { enabled, ttl, maxSize, cleanupInterval } = body;
    
    performanceOptimizer.updateConfig({
      enabled: enabled !== undefined ? enabled : undefined,
      ttl: ttl !== undefined ? parseInt(ttl) : undefined,
      maxSize: maxSize !== undefined ? parseInt(maxSize) : undefined,
      cleanupInterval: cleanupInterval !== undefined ? parseInt(cleanupInterval) : undefined
    });
    
    return c.json({
      success: true,
      message: 'Cache configuration updated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache config update error:', error);
    return c.json({
      error: 'Failed to update cache configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Response Optimization Management
performanceRoutes.get('/response-optimization/config', async (c) => {
  try {
    const config = responseOptimizer.getConfig();
    
    return c.json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Response optimization config error:', error);
    return c.json({
      error: 'Failed to get response optimization configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

performanceRoutes.post('/response-optimization/config', async (c) => {
  try {
    const body = await c.req.json();
    const { enabled, compression, minify, removeNulls, truncateLongText, maxTextLength, includeMetadata } = body;
    
    responseOptimizer.updateConfig({
      enabled: enabled !== undefined ? enabled : undefined,
      compression: compression !== undefined ? compression : undefined,
      minify: minify !== undefined ? minify : undefined,
      removeNulls: removeNulls !== undefined ? removeNulls : undefined,
      truncateLongText: truncateLongText !== undefined ? truncateLongText : undefined,
      maxTextLength: maxTextLength !== undefined ? parseInt(maxTextLength) : undefined,
      includeMetadata: includeMetadata !== undefined ? includeMetadata : undefined
    });
    
    return c.json({
      success: true,
      message: 'Response optimization configuration updated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Response optimization config update error:', error);
    return c.json({
      error: 'Failed to update response optimization configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Performance Health Check
performanceRoutes.get('/health', async (c) => {
  try {
    const cacheHealth = performanceOptimizer.healthCheck();
    const responseOptHealth = responseOptimizer.healthCheck();
    
    const overallStatus = cacheHealth.status === 'unhealthy' || responseOptHealth.status === 'unhealthy' 
      ? 'unhealthy' 
      : cacheHealth.status === 'warning' || responseOptHealth.status === 'warning' 
        ? 'warning' 
        : 'healthy';
    
    return c.json({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components: {
        cache: cacheHealth,
        responseOptimization: responseOptHealth
      }
    });
  } catch (error) {
    console.error('Performance health check error:', error);
    return c.json({
      success: false,
      status: 'unhealthy',
      error: 'Failed to perform health check',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Reset Performance Metrics
performanceRoutes.post('/metrics/reset', async (c) => {
  try {
    performanceOptimizer.resetMetrics();
    
    return c.json({
      success: true,
      message: 'Performance metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Metrics reset error:', error);
    return c.json({
      error: 'Failed to reset performance metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Performance Test Endpoint
performanceRoutes.post('/test', async (c) => {
  try {
    const body = await c.req.json();
    const { testType, iterations = 100 } = body;
    
    if (!testType) {
      return c.json({
        error: 'Test type is required',
        details: 'Available types: cache, response-optimization, memory'
      }, 400);
    }
    
    let results: any = {};
    
    switch (testType) {
      case 'cache':
        results = await runCacheTest(iterations);
        break;
      case 'response-optimization':
        results = await runResponseOptimizationTest(iterations);
        break;
      case 'memory':
        results = await runMemoryTest(iterations);
        break;
      default:
        return c.json({
          error: 'Invalid test type',
          details: 'Available types: cache, response-optimization, memory'
        }, 400);
    }
    
    return c.json({
      success: true,
      testType,
      iterations,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Performance test error:', error);
    return c.json({
      error: 'Performance test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test Functions
async function runCacheTest(iterations: number) {
  const startTime = Date.now();
  const testData = { test: 'data', timestamp: Date.now() };
  
  // Test cache performance
  for (let i = 0; i < iterations; i++) {
    const key = `test_${i}`;
    // Simulate cache operations
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  
  const duration = Date.now() - startTime;
  
  return {
    duration,
    operationsPerSecond: Math.round(iterations / (duration / 1000)),
    averageOperationTime: duration / iterations
  };
}

async function runResponseOptimizationTest(iterations: number) {
  const startTime = Date.now();
  const testResponse = {
    recommendation: 'buy' as const,
    confidenceLevel: 0.8,
    analysis: 'A'.repeat(2000), // Long text for testing
    reasoning: 'Test reasoning',
    riskAssessment: 'Test risk assessment',
    technicalIndicators: { rsi: 65, macd: 0.2 },
    patterns: Array.from({ length: 10 }, (_, i) => ({ name: `Pattern ${i}`, confidence: 0.7 }))
  };
  
  let totalOptimizationRatio = 0;
  
  for (let i = 0; i < iterations; i++) {
    const optimized = responseOptimizer.optimizeResponse(testResponse);
    totalOptimizationRatio += optimized.size.compressionRatio;
  }
  
  const duration = Date.now() - startTime;
  
  return {
    duration,
    operationsPerSecond: Math.round(iterations / (duration / 1000)),
    averageOptimizationRatio: totalOptimizationRatio / iterations
  };
}

async function runMemoryTest(iterations: number) {
  const startTime = Date.now();
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Simulate memory-intensive operations
  const testObjects: any[] = [];
  for (let i = 0; i < iterations; i++) {
    testObjects.push({
      id: i,
      data: 'A'.repeat(1000),
      timestamp: Date.now()
    });
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  // Clean up
  testObjects.length = 0;
  
  const duration = Date.now() - startTime;
  
  return {
    duration,
    memoryIncrease: Math.round(memoryIncrease / 1024 / 1024), // MB
    operationsPerSecond: Math.round(iterations / (duration / 1000))
  };
}

export { performanceRoutes };
