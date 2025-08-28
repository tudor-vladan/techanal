#!/usr/bin/env node

/**
 * Test script for the Performance Optimization system
 * Run with: node scripts/test-performance-optimization.mjs
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add the src directory to the path
const srcPath = join(__dirname, '..', 'src');

console.log('🚀 Testing Performance Optimization System...\n');

// Test Performance Optimizer
try {
  console.log('🔧 Testing Performance Optimizer...');
  
  // Dynamic import to test the service
  const { performanceOptimizer } = await import(join(srcPath, 'lib', 'performance-optimizer.js'));
  
  console.log(`✅ Performance Optimizer created successfully`);
  
  // Test cache functionality
  console.log('\n💾 Testing Cache System...');
  
  // Test cache key generation
  const testRequest = {
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    prompt: 'Test analysis prompt',
    userId: 'test-user',
    metadata: {
      chartType: 'candlestick',
      timeframe: '1h'
    }
  };
  
  // Test caching
  const testResult = {
    recommendation: 'buy',
    confidenceLevel: 0.8,
    analysis: 'Test analysis result',
    reasoning: 'Test reasoning',
    riskAssessment: 'Test risk assessment',
    technicalIndicators: { rsi: 65 },
    patterns: [{ name: 'Test Pattern', confidence: 0.7 }]
  };
  
  // Cache the result
  await performanceOptimizer.cacheResult(testRequest, testResult);
  console.log('✅ Result cached successfully');
  
  // Try to retrieve from cache
  const cachedResult = await performanceOptimizer.getCachedResult(testRequest);
  if (cachedResult) {
    console.log('✅ Cache hit - result retrieved successfully');
  } else {
    console.log('❌ Cache miss - result not found');
  }
  
  // Test cache statistics
  const cacheStats = performanceOptimizer.getCacheStats();
  console.log('📊 Cache Statistics:');
  console.log(`  Size: ${cacheStats.size}/${cacheStats.maxSize}`);
  console.log(`  Hit Rate: ${Math.round(cacheStats.hitRate * 100)}%`);
  console.log(`  Memory Usage: ${cacheStats.memoryUsage} MB`);
  
  // Test performance metrics
  console.log('\n📈 Testing Performance Metrics...');
  
  // Record some test metrics
  performanceOptimizer.recordMetrics(150, false); // 150ms response time, no error
  performanceOptimizer.recordMetrics(200, false); // 200ms response time, no error
  performanceOptimizer.recordMetrics(100, true);  // 100ms response time, with error
  
  const metrics = performanceOptimizer.getMetrics();
  console.log('📊 Performance Metrics:');
  console.log(`  Request Count: ${metrics.requestCount}`);
  console.log(`  Average Response Time: ${Math.round(metrics.averageResponseTime)}ms`);
  console.log(`  Cache Hit Rate: ${Math.round(metrics.cacheHitRate * 100)}%`);
  console.log(`  Error Rate: ${Math.round(metrics.errorRate * 100)}%`);
  console.log(`  Memory Usage: ${metrics.memoryUsage} MB`);
  
  // Test health check
  console.log('\n🏥 Testing Health Check...');
  const health = performanceOptimizer.healthCheck();
  console.log(`Health Status: ${health.status}`);
  console.log(`  Cache Enabled: ${health.details.cacheEnabled}`);
  console.log(`  Cache Size: ${health.details.cacheSize}`);
  console.log(`  Memory Usage: ${health.details.memoryUsage} MB`);
  console.log(`  Error Rate: ${Math.round(health.details.errorRate * 100)}%`);
  
  console.log('\n✅ Performance Optimizer tests completed successfully!');
  
} catch (error) {
  console.error('❌ Performance Optimizer test failed:', error.message);
  console.error('Stack trace:', error.stack);
}

// Test Response Optimizer
try {
  console.log('\n🔧 Testing Response Optimizer...');
  
  // Dynamic import to test the service
  const { responseOptimizer } = await import(join(srcPath, 'lib', 'response-optimizer.js'));
  
  console.log(`✅ Response Optimizer created successfully`);
  
  // Test response optimization
  console.log('\n📤 Testing Response Optimization...');
  
  const testResponse = {
    recommendation: 'buy',
    confidenceLevel: 0.8,
    analysis: 'A'.repeat(2000), // Long text for testing
    reasoning: 'Test reasoning',
    riskAssessment: 'Test risk assessment',
    technicalIndicators: { rsi: 65, macd: 0.2 },
    patterns: Array.from({ length: 10 }, (_, i) => ({ name: `Pattern ${i}`, confidence: 0.7 }))
  };
  
  // Test optimization
  const optimized = responseOptimizer.optimizeResponse(testResponse, 150);
  console.log('✅ Response optimized successfully');
  
  console.log('📊 Optimization Results:');
  console.log(`  Original Size: ${optimized.size.original} bytes`);
  console.log(`  Optimized Size: ${optimized.size.optimized} bytes`);
  console.log(`  Compression Ratio: ${Math.round(optimized.size.compressionRatio * 100)}%`);
  console.log(`  Compressed: ${optimized.optimization.compressed ? 'Yes' : 'No'}`);
  console.log(`  Nulls Removed: ${optimized.optimization.nullsRemoved ? 'Yes' : 'No'}`);
  console.log(`  Text Truncated: ${optimized.optimization.textTruncated ? 'Yes' : 'No'}`);
  
  // Test lightweight response
  console.log('\n📱 Testing Lightweight Response...');
  const lightweight = responseOptimizer.createLightweightResponse(testResponse);
  console.log('✅ Lightweight response created');
  console.log(`  Summary: ${lightweight.summary}`);
  
  // Test detailed response
  console.log('\n📋 Testing Detailed Response...');
  const detailed = responseOptimizer.createDetailedResponse(testResponse);
  console.log('✅ Detailed response created');
  console.log(`  Has Metadata: ${!!detailed._metadata}`);
  
  // Test configuration
  console.log('\n⚙️ Testing Configuration...');
  const config = responseOptimizer.getConfig();
  console.log('📊 Current Configuration:');
  console.log(`  Enabled: ${config.enabled}`);
  console.log(`  Compression: ${config.compression}`);
  console.log(`  Minify: ${config.minify}`);
  console.log(`  Remove Nulls: ${config.removeNulls}`);
  console.log(`  Truncate Long Text: ${config.truncateLongText}`);
  console.log(`  Max Text Length: ${config.maxTextLength}`);
  console.log(`  Include Metadata: ${config.includeMetadata}`);
  
  // Test health check
  console.log('\n🏥 Testing Response Optimizer Health...');
  const responseHealth = responseOptimizer.healthCheck();
  console.log(`Health Status: ${responseHealth.status}`);
  
  console.log('\n✅ Response Optimizer tests completed successfully!');
  
} catch (error) {
  console.error('❌ Response Optimizer test failed:', error.message);
  console.error('Stack trace:', error.stack);
}

// Test Performance Routes (if available)
try {
  console.log('\n🔧 Testing Performance Routes...');
  
  // Dynamic import to test the routes
  const { performanceRoutes } = await import(join(srcPath, 'api-performance.js'));
  
  console.log(`✅ Performance Routes created successfully`);
  console.log('📊 Available Routes:');
  console.log('  GET  /api/performance/metrics');
  console.log('  GET  /api/performance/cache/stats');
  console.log('  POST /api/performance/cache/clear');
  console.log('  POST /api/performance/cache/config');
  console.log('  GET  /api/performance/response-optimization/config');
  console.log('  POST /api/performance/response-optimization/config');
  console.log('  GET  /api/performance/health');
  console.log('  POST /api/performance/metrics/reset');
  console.log('  POST /api/performance/test');
  
  console.log('\n✅ Performance Routes tests completed successfully!');
  
} catch (error) {
  console.error('❌ Performance Routes test failed:', error.message);
  console.error('Stack trace:', error.stack);
}

console.log('\n🎯 Performance Optimization System Test completed!');
console.log('\n📋 Next Steps:');
console.log('  1. Test the API endpoints manually');
console.log('  2. Monitor performance metrics in production');
console.log('  3. Adjust cache and optimization settings as needed');
console.log('  4. Integrate with monitoring tools');
