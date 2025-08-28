#!/usr/bin/env node

/**
 * Test script for the new AI service
 * Run with: node scripts/test-ai-service.mjs
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

console.log('🧪 Testing AI Service...\n');

// Test environment variables
console.log('📋 Environment Configuration:');
console.log(`AI_PROVIDER: ${process.env.AI_PROVIDER || 'mock'}`);
console.log(`AI_API_KEY: ${process.env.AI_API_KEY ? '***SET***' : 'NOT SET'}`);
console.log(`AI_MODEL: ${process.env.AI_MODEL || 'default'}`);
console.log(`AI_BASE_URL: ${process.env.AI_BASE_URL || 'NOT SET'}`);
console.log('');

// Test AI service creation
try {
  console.log('🔧 Testing AI Service Creation...');
  
  // Dynamic import to test the service
  const { aiService } = await import(join(srcPath, 'lib', 'ai-service.js'));
  
  console.log(`✅ AI Service created successfully`);
  console.log(`Provider: ${aiService.constructor.name}`);
  console.log(`Capabilities: ${aiService.getCapabilities().join(', ')}`);
  
  // Test health check
  console.log('\n🏥 Testing Health Check...');
  const isHealthy = await aiService.healthCheck();
  console.log(`Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  
  // Test analysis with mock data
  console.log('\n🧠 Testing AI Analysis...');
  const testRequest = {
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent pixel
    prompt: 'Analyze this chart for bullish or bearish signals. Look for support and resistance levels.',
    userId: 'test-user',
    metadata: {
      chartType: 'candlestick',
      timeframe: '1h',
      imageSize: 100,
      imageFormat: 'png'
    }
  };
  
  const startTime = Date.now();
  const analysis = await aiService.analyze(testRequest);
  const processingTime = Date.now() - startTime;
  
  console.log(`✅ Analysis completed in ${processingTime}ms`);
  console.log(`Recommendation: ${analysis.recommendation.toUpperCase()}`);
  console.log(`Confidence: ${Math.round(analysis.confidenceLevel * 100)}%`);
  console.log(`Analysis: ${analysis.analysis.substring(0, 100)}...`);
  
  if (analysis.stopLoss) console.log(`Stop Loss: ${analysis.stopLoss}`);
  if (analysis.takeProfit) console.log(`Take Profit: ${analysis.takeProfit}`);
  
  console.log('\n🎯 Test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
