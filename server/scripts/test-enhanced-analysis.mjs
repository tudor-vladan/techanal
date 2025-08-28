#!/usr/bin/env node

/**
 * Test script for the Enhanced AI Analysis service
 * Run with: node scripts/test-enhanced-analysis.mjs
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

console.log('🧪 Testing Enhanced AI Analysis Service...\n');

// Test environment variables
console.log('📋 Environment Configuration:');
console.log(`AI_PROVIDER: ${process.env.AI_PROVIDER || 'mock'}`);
console.log(`AI_API_KEY: ${process.env.AI_API_KEY ? '***SET***' : 'NOT SET'}`);
console.log(`AI_MODEL: ${process.env.AI_MODEL || 'default'}`);
console.log(`AI_BASE_URL: ${process.env.AI_BASE_URL || 'NOT SET'}`);
console.log('');

// Test Enhanced AI Analysis service
try {
  console.log('🔧 Testing Enhanced AI Analysis Service...');
  
  // Dynamic import to test the service
  const { enhancedAIAnalysis } = await import(join(srcPath, 'lib', 'enhanced-ai-analysis.js'));
  
  console.log(`✅ Enhanced AI Analysis Service created successfully`);
  console.log(`Capabilities: ${enhancedAIAnalysis.getCapabilities().join(', ')}`);
  
  // Test health check
  console.log('\n🏥 Testing Health Check...');
  const isHealthy = await enhancedAIAnalysis.healthCheck();
  console.log(`Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  
  // Test enhanced analysis with mock data
  console.log('\n🧠 Testing Enhanced AI Analysis...');
  const testRequest = {
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent pixel
    prompt: 'Analyze this chart for bullish or bearish signals. Look for support and resistance levels, chart patterns, and technical indicators.',
    userId: 'test-user',
    enableAdvancedPatterns: true,
    enableTechnicalIndicators: true,
    metadata: {
      chartType: 'candlestick',
      timeframe: '1h',
      imageSize: 100,
      imageFormat: 'jpeg'
    }
  };
  
  const startTime = Date.now();
  const analysis = await enhancedAIAnalysis.analyzeChart(testRequest);
  const processingTime = Date.now() - startTime;
  
  console.log(`✅ Enhanced analysis completed in ${processingTime}ms`);
  console.log(`Recommendation: ${analysis.recommendation.toUpperCase()}`);
  console.log(`Overall Confidence: ${Math.round(analysis.confidenceLevel * 100)}%`);
  
  // Display confidence breakdown
  if (analysis.confidenceBreakdown) {
    console.log('\n📊 Confidence Breakdown:');
    console.log(`  AI Analysis: ${Math.round(analysis.confidenceBreakdown.aiAnalysis * 100)}%`);
    console.log(`  Pattern Recognition: ${Math.round(analysis.confidenceBreakdown.patternRecognition * 100)}%`);
    console.log(`  Technical Indicators: ${Math.round(analysis.confidenceBreakdown.technicalIndicators * 100)}%`);
    console.log(`  Overall: ${Math.round(analysis.confidenceBreakdown.overall * 100)}%`);
  }
  
  // Display enhanced recommendations
  if (analysis.recommendations) {
    console.log('\n🎯 Enhanced Recommendations:');
    console.log(`  Entry: ${analysis.recommendations.entry}`);
    console.log(`  Exit: ${analysis.recommendations.exit}`);
    console.log(`  Risk Management: ${analysis.recommendations.riskManagement}`);
    console.log(`  Timeframe: ${analysis.recommendations.timeframe}`);
  }
  
  // Display technical analysis
  if (analysis.technicalAnalysis) {
    console.log('\n📈 Technical Analysis:');
    console.log(`  Indicators: ${analysis.technicalAnalysis.indicators.length} technical indicators detected`);
    console.log(`  Patterns: ${analysis.technicalAnalysis.patterns.length} chart patterns identified`);
    console.log(`  Support/Resistance: ${analysis.technicalAnalysis.supportResistance.length} key levels found`);
    
    if (analysis.technicalAnalysis.trend) {
      console.log(`  Trend: ${analysis.technicalAnalysis.trend.direction} with ${Math.round(analysis.technicalAnalysis.trend.strength * 100)}% strength`);
    }
  }
  
  // Display advanced patterns
  if (analysis.advancedPatterns) {
    console.log('\n🔍 Advanced Pattern Recognition:');
    console.log(`  Summary: ${analysis.advancedPatterns.summary}`);
    console.log(`  Pattern Confidence: ${Math.round(analysis.advancedPatterns.confidence * 100)}%`);
    
    if (analysis.advancedPatterns.patterns.length > 0) {
      console.log('  Detected Patterns:');
      analysis.advancedPatterns.patterns.forEach((pattern, index) => {
        console.log(`    ${index + 1}. ${pattern.name} (${pattern.type}) - ${Math.round(pattern.confidence * 100)}% confidence`);
      });
    }
  }
  
  console.log('\n🎯 Enhanced Analysis Test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
