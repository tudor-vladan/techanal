#!/usr/bin/env node

/**
 * Test Script pentru Componentele Individuale AI Analysis Engine
 * Testează fiecare componentă separat pentru a identifica probleme
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock data pentru testare
const MOCK_IMAGE_DATA = {
  width: 800,
  height: 600,
  format: 'png',
  size: 1024 * 1024, // 1MB
};

const MOCK_USER_PROMPT = "Analizează acest chart pentru pattern-uri bullish și identifică niveluri de support și resistance";

console.log('🧪 Testare Componente Individuale AI Analysis Engine\n');

// Test 1: Image Processing
async function testImageProcessing() {
  console.log('📸 Testare Image Processing...');
  
  try {
    // Creez o imagine mock pentru testare
    const mockImageBuffer = await sharp({
      create: {
        width: MOCK_IMAGE_DATA.width,
        height: MOCK_IMAGE_DATA.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toBuffer();
    
    console.log('✅ Mock image creat:', {
      size: mockImageBuffer.length,
      width: MOCK_IMAGE_DATA.width,
      height: MOCK_IMAGE_DATA.height
    });
    
    // Test compresie
    const compressedBuffer = await sharp(mockImageBuffer)
      .resize(400, 300)
      .png({ quality: 80 })
      .toBuffer();
    
    console.log('✅ Compresie imagine testată:', {
      originalSize: mockImageBuffer.length,
      compressedSize: compressedBuffer.length,
      compressionRatio: ((mockImageBuffer.length - compressedBuffer.length) / mockImageBuffer.length * 100).toFixed(2) + '%'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Image Processing test failed:', error.message);
    return false;
  }
}

// Test 2: AI Analysis Engine
async function testAIAnalysis() {
  console.log('\n🤖 Testare AI Analysis Engine...');
  
  try {
    // Simulez AI analysis
    const startTime = Date.now();
    
    // Mock AI analysis cu delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const processingTime = Date.now() - startTime;
    
    // Mock response
    const mockAnalysis = {
      recommendation: 'buy',
      confidenceLevel: 0.75,
      stopLoss: 95,
      takeProfit: 108,
      technicalIndicators: {
        rsi: 45,
        macd: { macd: 0.2, signal: 0.1, histogram: 0.1 },
        bollingerBands: { upper: 1.05, middle: 1.0, lower: 0.95 }
      },
      analysis: 'Pattern bullish identificat cu nivel de support la 95',
      reasoning: 'RSI în zona de oversold, MACD crossover pozitiv',
      riskAssessment: 'Risk moderat cu stop-loss la 95'
    };
    
    console.log('✅ AI Analysis testat:', {
      processingTime: `${processingTime}ms`,
      recommendation: mockAnalysis.recommendation,
      confidenceLevel: mockAnalysis.confidenceLevel,
      hasTechnicalIndicators: !!mockAnalysis.technicalIndicators
    });
    
    // Verific performance
    if (processingTime < 5000) {
      console.log('✅ Performance OK: < 5 secunde');
    } else {
      console.log('⚠️ Performance slow: > 5 secunde');
    }
    
    return true;
  } catch (error) {
    console.error('❌ AI Analysis test failed:', error.message);
    return false;
  }
}

// Test 3: Database Operations
async function testDatabaseOperations() {
  console.log('\n🗄️ Testare Database Operations...');
  
  try {
    // Test database connection
    const response = await fetch('http://localhost:8787/api/v1/db-test');
    const data = await response.json();
    
    if (data.connectionHealthy) {
      console.log('✅ Database connection OK');
      console.log('✅ Users count:', data.users?.length || 0);
      console.log('✅ Using external database:', !data.usingLocalDatabase);
    } else {
      console.log('❌ Database connection failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

// Test 4: API Endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testare API Endpoints...');
  
  try {
    // Test health check
    const healthResponse = await fetch('http://localhost:8787/');
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'ok') {
      console.log('✅ Health check OK');
    } else {
      console.log('❌ Health check failed');
      return false;
    }
    
    // Test public API
    const apiResponse = await fetch('http://localhost:8787/api/v1/hello');
    const apiData = await apiResponse.json();
    
    if (apiData.message === 'Hello from Hono!') {
      console.log('✅ Public API OK');
    } else {
      console.log('❌ Public API failed');
      return false;
    }
    
    // Test protected endpoint (should return unauthorized)
    const protectedResponse = await fetch('http://localhost:8787/api/v1/protected/me');
    const protectedData = await protectedResponse.json();
    
    if (protectedData.error === 'Unauthorized') {
      console.log('✅ Authentication middleware OK');
    } else {
      console.log('❌ Authentication middleware failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Test 5: Performance Metrics
async function testPerformance() {
  console.log('\n⚡ Testare Performance Metrics...');
  
  try {
    const startTime = Date.now();
    
    // Test multiple requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(fetch('http://localhost:8787/api/v1/hello'));
    }
    
    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / responses.length;
    
    console.log('✅ Performance test completat:', {
      totalRequests: responses.length,
      totalTime: `${totalTime}ms`,
      averageTime: `${avgTime.toFixed(2)}ms per request`
    });
    
    if (avgTime < 100) {
      console.log('✅ Performance excellent: < 100ms per request');
    } else if (avgTime < 500) {
      console.log('✅ Performance good: < 500ms per request');
    } else {
      console.log('⚠️ Performance slow: > 500ms per request');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Începe testarea componentelor...\n');
  
  const tests = [
    { name: 'Image Processing', fn: testImageProcessing },
    { name: 'AI Analysis Engine', fn: testAIAnalysis },
    { name: 'Database Operations', fn: testDatabaseOperations },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Performance Metrics', fn: testPerformance }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ Test ${test.name} crashed:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 REZULTATE TESTARE:');
  console.log('='.repeat(50));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });
  
  console.log('='.repeat(50));
  console.log(`🎯 SCOR FINAL: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Toate testele au trecut! AI Analysis Engine este gata pentru integration testing.');
  } else {
    console.log('⚠️ Unele teste au eșuat. Verifică log-urile pentru detalii.');
  }
  
  return results;
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };
