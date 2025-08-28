#!/usr/bin/env node

/**
 * AI Services Demonstration Script
 * Shows how to use OpenAI, Anthropic, and Ollama services
 */

// Import the AI service after setting environment
const { AIServiceFactory } = await import('../src/lib/ai-service.ts');

console.log('🤖 AI Services Demonstration');
console.log('=' .repeat(60));

// Test image (base64 encoded small test image)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Test request
const testRequest = {
  imageBase64: testImageBase64,
  prompt: 'Analyze this trading chart and provide recommendations. Look for support/resistance levels, trend direction, and potential entry/exit points.',
  userId: 'demo-user-123',
  metadata: {
    chartType: 'candlestick',
    timeframe: '1h',
    enableAdvancedPatterns: true
  }
};

async function demonstrateService(provider, config, description) {
  console.log(`\n🔍 Demonstrating ${provider.toUpperCase()} Service`);
  console.log('─' .repeat(50));
  console.log(`Description: ${description}`);
  
  try {
    // Create service
    const service = AIServiceFactory.createService(config);
    console.log(`✅ Service created successfully`);
    
    // Show capabilities
    const capabilities = service.getCapabilities();
    console.log(`📋 Capabilities: ${capabilities.join(', ')}`);
    
    // Test health
    console.log('🏥 Health check...');
    const isHealthy = await service.healthCheck();
    console.log(`Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    if (!isHealthy) {
      console.log(`⚠️  Service is unhealthy, skipping analysis`);
      return { success: false, reason: 'unhealthy' };
    }
    
    // Perform analysis
    console.log('🔍 Performing analysis...');
    const startTime = Date.now();
    const result = await service.analyze(testRequest);
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Analysis completed in ${processingTime}ms`);
    console.log(`📊 Recommendation: ${result.recommendation.toUpperCase()}`);
    console.log(`🎯 Confidence: ${Math.round(result.confidenceLevel * 100)}%`);
    console.log(`📈 Analysis: ${result.analysis.substring(0, 150)}...`);
    
    if (result.stopLoss) console.log(`🛑 Stop Loss: ${result.stopLoss}`);
    if (result.takeProfit) console.log(`🎯 Take Profit: ${result.takeProfit}`);
    
    return { success: true, result, processingTime };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runDemonstration() {
  console.log('🚀 Starting AI Services Demonstration');
  console.log('This script demonstrates how to use different AI providers for trading analysis.\n');
  
  const results = [];
  
  // 1. Mock Service (Always works)
  console.log('1️⃣  MOCK SERVICE - Development & Testing');
  const mockResult = await demonstrateService('mock', { provider: 'mock' }, 
    'Simulated AI service for development and testing. No external dependencies required.');
  results.push({ provider: 'mock', ...mockResult });
  
  // 2. OpenAI Service (if API key available)
  console.log('\n2️⃣  OPENAI SERVICE - GPT-4 Vision');
  if (process.env.OPENAI_API_KEY) {
    const openaiResult = await demonstrateService('openai', {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-vision-preview',
      timeout: 30000,
      maxTokens: 1000
    }, 'Advanced vision analysis using OpenAI\'s GPT-4 Vision model. Requires API key and credits.');
    results.push({ provider: 'openai', ...openaiResult });
  } else {
    console.log('⚠️  Skipping OpenAI - OPENAI_API_KEY not set');
    console.log('   To test OpenAI, set: export OPENAI_API_KEY=your_key_here');
  }
  
  // 3. Anthropic Service (if API key available)
  console.log('\n3️⃣  ANTHROPIC SERVICE - Claude Vision');
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropicResult = await demonstrateService('anthropic', {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      timeout: 30000,
      maxTokens: 1000
    }, 'Vision analysis using Anthropic\'s Claude 3 Sonnet model. Requires API key and credits.');
    results.push({ provider: 'anthropic', ...anthropicResult });
  } else {
    console.log('⚠️  Skipping Anthropic - ANTHROPIC_API_KEY not set');
    console.log('   To test Anthropic, set: export ANTHROPIC_API_KEY=your_key_here');
  }
  
  // 4. Ollama Service (if available locally)
  console.log('\n4️⃣  OLLAMA SERVICE - Local AI Models');
  try {
    const ollamaResult = await demonstrateService('ollama', {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1:8b',
      timeout: 30000,
      maxTokens: 1000
    }, 'Local AI models for privacy-focused analysis. Requires Ollama to be installed and running.');
    results.push({ provider: 'ollama', ...ollamaResult });
  } catch (error) {
    console.log('⚠️  Skipping Ollama - Service not available');
    console.log('   To test Ollama:');
    console.log('   1. Install from https://ollama.ai/');
    console.log('   2. Run: ollama serve');
    console.log('   3. Pull model: ollama pull llama3.1:8b');
  }
  
  // Summary
  console.log('\n📊 Demonstration Summary');
  console.log('=' .repeat(60));
  
  const workingServices = results.filter(r => r.success);
  const failedServices = results.filter(r => !r.success);
  
  console.log(`✅ Working services: ${workingServices.length}`);
  console.log(`❌ Failed services: ${failedServices.length}`);
  
  if (workingServices.length > 0) {
    console.log('\n🏆 Working Services:');
    workingServices.forEach(result => {
      console.log(`  • ${result.provider.toUpperCase()}: ${result.processingTime}ms`);
    });
  }
  
  // Configuration examples
  console.log('\n💡 Configuration Examples');
  console.log('─' .repeat(40));
  
  console.log('\n🔑 Environment Variables:');
  console.log('export AI_PROVIDER=openai');
  console.log('export AI_API_KEY=your_api_key_here');
  console.log('export AI_MODEL=gpt-4-vision-preview');
  console.log('export AI_TIMEOUT=30000');
  console.log('export AI_MAX_TOKENS=1000');
  
  console.log('\n📝 .env File:');
  console.log('AI_PROVIDER=openai');
  console.log('AI_API_KEY=your_api_key_here');
  console.log('AI_MODEL=gpt-4-vision-preview');
  console.log('AI_TIMEOUT=30000');
  console.log('AI_MAX_TOKENS=1000');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Choose your preferred AI provider');
  console.log('2. Set up API keys (for OpenAI/Anthropic)');
  console.log('3. Install Ollama locally (for privacy)');
  console.log('4. Test with real trading charts');
  console.log('5. Monitor performance and costs');
  
  console.log('\n🎉 Demonstration completed!');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AI Services Demonstration Script

Usage: npx tsx scripts/demo-ai-services.mjs [options]

Options:
  --help, -h     Show this help message

Environment Variables:
  OPENAI_API_KEY     Your OpenAI API key
  ANTHROPIC_API_KEY  Your Anthropic API key

Examples:
  npx tsx scripts/demo-ai-services.mjs                    # Run full demonstration
  OPENAI_API_KEY=your_key npx tsx scripts/demo-ai-services.mjs  # Test with OpenAI
  ANTHROPIC_API_KEY=your_key npx tsx scripts/demo-ai-services.mjs  # Test with Anthropic

This script demonstrates all available AI services:
- Mock Service (always works)
- OpenAI GPT-4 Vision (requires API key)
- Anthropic Claude (requires API key)
- Ollama Local (requires local installation)
`);
  process.exit(0);
}

// Run demonstration
runDemonstration().catch(error => {
  console.error('💥 Demonstration failed:', error);
  process.exit(1);
});
