#!/usr/bin/env node

/**
 * Test script for all AI services
 * Tests OpenAI, Anthropic, Ollama, and Mock services
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock environment variables for testing
process.env.AI_PROVIDER = 'mock';
process.env.AI_API_KEY = 'test-key';
process.env.AI_MODEL = 'test-model';
process.env.AI_BASE_URL = 'http://localhost:11434';
process.env.AI_TIMEOUT = '30000';
process.env.AI_MAX_TOKENS = '1000';

// Import the AI service after setting environment
const { AIServiceFactory } = await import('../src/lib/ai-service.js');

// Test image (base64 encoded small test image)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Test request
const testRequest = {
  imageBase64: testImageBase64,
  prompt: 'Analyze this trading chart and provide recommendations',
  userId: 'test-user-123',
  metadata: {
    chartType: 'candlestick',
    timeframe: '1h',
    enableAdvancedPatterns: true
  }
};

async function testAIService(provider, config) {
  console.log(`\n🧪 Testing ${provider.toUpperCase()} service...`);
  console.log('=' .repeat(50));
  
  try {
    // Create service
    const service = AIServiceFactory.createService(config);
    console.log(`✅ Service created successfully`);
    
    // Test capabilities
    const capabilities = service.getCapabilities();
    console.log(`📋 Capabilities: ${capabilities.join(', ')}`);
    
    // Test health check
    console.log('🏥 Testing health check...');
    const isHealthy = await service.healthCheck();
    console.log(`Health status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    // Test analysis
    console.log('🔍 Testing analysis...');
    const startTime = Date.now();
    const result = await service.analyze(testRequest);
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Analysis completed in ${processingTime}ms`);
    console.log(`📊 Recommendation: ${result.recommendation.toUpperCase()}`);
    console.log(`🎯 Confidence: ${Math.round(result.confidenceLevel * 100)}%`);
    console.log(`📈 Analysis: ${result.analysis.substring(0, 100)}...`);
    
    if (result.stopLoss) console.log(`🛑 Stop Loss: ${result.stopLoss}`);
    if (result.takeProfit) console.log(`🎯 Take Profit: ${result.takeProfit}`);
    
    return { success: true, result, processingTime };
    
  } catch (error) {
    console.log(`❌ Error testing ${provider}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting AI Services Test Suite');
  console.log('=' .repeat(60));
  
  const testResults = [];
  
  // Test Mock Service
  const mockResult = await testAIService('mock', { provider: 'mock' });
  testResults.push({ provider: 'mock', ...mockResult });
  
  // Test OpenAI Service (if API key is available)
  if (process.env.OPENAI_API_KEY) {
    const openaiResult = await testAIService('openai', {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-vision-preview',
      timeout: 30000,
      maxTokens: 1000
    });
    testResults.push({ provider: 'openai', ...openaiResult });
  } else {
    console.log('\n⚠️  Skipping OpenAI test - OPENAI_API_KEY not set');
  }
  
  // Test Anthropic Service (if API key is available)
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropicResult = await testAIService('anthropic', {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      timeout: 30000,
      maxTokens: 1000
    });
    testResults.push({ provider: 'anthropic', ...anthropicResult });
  } else {
    console.log('\n⚠️  Skipping Anthropic test - ANTHROPIC_API_KEY not set');
  }
  
  // Test Ollama Service (if available)
  try {
    const ollamaResult = await testAIService('ollama', {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1:8b',
      timeout: 30000,
      maxTokens: 1000
    });
    testResults.push({ provider: 'ollama', ...ollamaResult });
  } catch (error) {
    console.log('\n⚠️  Skipping Ollama test - Ollama not running or not accessible');
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(60));
  
  const successfulTests = testResults.filter(r => r.success);
  const failedTests = testResults.filter(r => !r.success);
  
  console.log(`✅ Successful tests: ${successfulTests.length}`);
  console.log(`❌ Failed tests: ${failedTests.length}`);
  
  if (successfulTests.length > 0) {
    console.log('\n🏆 Successful Services:');
    successfulTests.forEach(result => {
      console.log(`  • ${result.provider.toUpperCase()}: ${result.processingTime}ms`);
    });
  }
  
  if (failedTests.length > 0) {
    console.log('\n💥 Failed Services:');
    failedTests.forEach(result => {
      console.log(`  • ${result.provider.toUpperCase()}: ${result.error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (successfulTests.length === 0) {
    console.log('  • All tests failed. Check your configuration and API keys.');
  } else if (successfulTests.length === 1) {
    console.log('  • Only one service is working. Consider setting up additional providers.');
  } else {
    console.log('  • Multiple services are working. You can implement fallback strategies.');
  }
  
  console.log('  • Use the Mock service for development and testing.');
  console.log('  • Set up API keys for OpenAI/Anthropic for production use.');
  console.log('  • Install Ollama locally for privacy-focused analysis.');
  
  console.log('\n🎉 Test suite completed!');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AI Services Test Suite

Usage: node test-ai-services.mjs [options]

Options:
  --help, -h     Show this help message
  --openai       Test OpenAI service (requires OPENAI_API_KEY)
  --anthropic    Test Anthropic service (requires ANTHROPIC_API_KEY)
  --ollama       Test Ollama service (requires local Ollama instance)
  --mock         Test Mock service (default)

Environment Variables:
  OPENAI_API_KEY     Your OpenAI API key
  ANTHROPIC_API_KEY  Your Anthropic API key

Examples:
  node test-ai-services.mjs                    # Test all available services
  OPENAI_API_KEY=your_key node test-ai-services.mjs --openai
  ANTHROPIC_API_KEY=your_key node test-ai-services.mjs --anthropic
`);
  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
