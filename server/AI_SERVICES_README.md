# AI Services Implementation

This document provides a comprehensive guide to the AI services implemented in the trading analysis application.

## 🚀 Overview

The application now supports **four AI providers** for trading chart analysis:

- **OpenAI GPT-4 Vision** ✅ - Advanced vision analysis
- **Anthropic Claude** ✅ - Vision analysis with Claude 3 models  
- **Ollama Local** ✅ - Privacy-focused local AI models
- **Mock Service** ✅ - Development and testing

## 📦 Installation

### Dependencies

The required packages are already installed:

```bash
pnpm add openai @anthropic-ai/sdk
```

### Environment Configuration

Create a `.env` file in the `server/` directory:

```bash
# AI Configuration
AI_PROVIDER=mock                    # Default provider
AI_API_KEY=your_api_key_here       # For OpenAI/Anthropic
AI_MODEL=gpt-4-vision-preview      # Model to use
AI_TIMEOUT=30000                   # Timeout in milliseconds
AI_MAX_TOKENS=1000                 # Maximum tokens for response
AI_BASE_URL=http://localhost:11434 # For Ollama (local)
```

## 🔧 Configuration

### 1. OpenAI Service

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-your_openai_api_key_here
AI_MODEL=gpt-4-vision-preview
```

**Features:**
- Vision analysis of trading charts
- Technical indicator interpretation
- Pattern recognition
- Risk assessment
- Position sizing recommendations

**Models:**
- `gpt-4-vision-preview` (recommended)
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### 2. Anthropic Service

```bash
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-your_anthropic_api_key_here
AI_MODEL=claude-3-sonnet-20240229
```

**Features:**
- Vision analysis of trading charts
- Technical indicator interpretation
- Pattern recognition
- Risk assessment
- Position sizing recommendations

**Models:**
- `claude-3-sonnet-20240229` (recommended)
- `claude-3-opus-20240229`
- `claude-3-haiku-20240307`

### 3. Ollama Service (Local)

```bash
AI_PROVIDER=ollama
AI_BASE_URL=http://localhost:11434
AI_MODEL=llama3.1:8b
```

**Features:**
- Text-based analysis
- Technical analysis
- Pattern recognition
- Risk assessment
- Privacy-focused (no external API calls)

**Setup:**
1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Start service: `ollama serve`
3. Pull model: `ollama pull llama3.1:8b`

### 4. Mock Service

```bash
AI_PROVIDER=mock
# No additional configuration needed
```

**Features:**
- Development and testing
- Realistic response simulation
- No external dependencies
- Configurable response patterns

## 🧪 Testing

### Test All Services

```bash
cd server
npx tsx scripts/test-ai-services.mjs
```

### Demonstration Script

```bash
cd server
npx tsx scripts/demo-ai-services.mjs
```

### Test Specific Provider

```bash
# Test OpenAI
OPENAI_API_KEY=your_key npx tsx scripts/demo-ai-services.mjs

# Test Anthropic  
ANTHROPIC_API_KEY=your_key npx tsx scripts/demo-ai-services.mjs

# Test Ollama (requires local installation)
npx tsx scripts/demo-ai-services.mjs
```

## 🔌 API Usage

### Basic Analysis

```typescript
import { AIServiceFactory } from './lib/ai-service';

// Create service
const service = AIServiceFactory.createService({
  provider: 'openai',
  apiKey: 'your_api_key',
  model: 'gpt-4-vision-preview'
});

// Analyze chart
const result = await service.analyze({
  imageBase64: 'base64_encoded_image',
  prompt: 'Analyze this trading chart',
  userId: 'user123',
  metadata: {
    chartType: 'candlestick',
    timeframe: '1h',
    enableAdvancedPatterns: true
  }
});
```

### Provider Selection

```typescript
// Use specific provider
const openaiService = AIServiceFactory.createService({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-vision-preview'
});

const anthropicService = AIServiceFactory.createService({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-sonnet-20240229'
});

const ollamaService = AIServiceFactory.createService({
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b'
});
```

## 🌐 API Endpoints

### 1. Service Status
```http
GET /api/ai/status
```

### 2. List Providers
```http
GET /api/ai/providers
```

### 3. Test Provider
```http
POST /api/ai/test-provider
Content-Type: application/json

{
  "provider": "openai",
  "prompt": "Analyze this chart",
  "apiKey": "your_api_key",
  "model": "gpt-4-vision-preview"
}
```

### 4. Analyze Screenshot
```http
POST /api/ai/analyze-screenshot
Content-Type: multipart/form-data

Form fields:
- image: File
- prompt: string
- provider: string (optional, defaults to configured provider)
```

### 5. Enhanced Analysis
```http
POST /api/ai/enhanced-analysis
Content-Type: application/json

{
  "imageBase64": "base64_encoded_image",
  "prompt": "Enhanced analysis prompt",
  "enableAdvancedPatterns": true,
  "enableTechnicalIndicators": true
}
```

### 6. Test Service
```http
POST /api/ai/test
Content-Type: application/json

{
  "prompt": "Test prompt",
  "testImage": "base64_encoded_test_image"
}
```

## 📊 Response Format

All AI services return a standardized response format:

```typescript
interface AIAnalysisResponse {
  recommendation: 'buy' | 'sell' | 'hold';
  confidenceLevel: number; // 0.0 - 1.0
  stopLoss?: number;
  takeProfit?: number;
  technicalIndicators: Record<string, any>;
  analysis: string;
  reasoning: string;
  riskAssessment: string;
  positionSizing?: string;
  marketContext?: string;
  patternAnalysis?: string;
}
```

## 🔄 Fallback Strategies

### Automatic Fallback

```typescript
// Try primary provider, fallback to secondary
async function analyzeWithFallback(request: AIAnalysisRequest) {
  try {
    // Try primary provider
    const primaryService = AIServiceFactory.createService({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY
    });
    
    return await primaryService.analyze(request);
  } catch (error) {
    console.log('Primary provider failed, trying fallback...');
    
    // Fallback to secondary provider
    const fallbackService = AIServiceFactory.createService({
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    return await fallbackService.analyze(request);
  }
}
```

### Health Check Based Fallback

```typescript
async function getHealthyService() {
  const providers = ['openai', 'anthropic', 'ollama', 'mock'];
  
  for (const provider of providers) {
    try {
      const service = AIServiceFactory.createService({ provider });
      if (await service.healthCheck()) {
        return service;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('No healthy AI service available');
}
```

## 🚨 Error Handling

### Common Errors

1. **API Key Missing**
   ```typescript
   if (config.provider === 'openai' && !config.apiKey) {
     throw new Error('OpenAI API key is required');
   }
   ```

2. **Service Unavailable**
   ```typescript
   try {
     const result = await service.analyze(request);
   } catch (error) {
     if (error.message.includes('timeout')) {
       // Handle timeout
     } else if (error.message.includes('API key')) {
       // Handle authentication error
     }
   }
   ```

3. **Rate Limiting**
   ```typescript
   // Implement exponential backoff
   const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
   await new Promise(resolve => setTimeout(resolve, delay));
   ```

## 📈 Performance Optimization

### Caching

```typescript
class CachedAIService {
  private cache = new Map<string, { response: AIAnalysisResponse; timestamp: number }>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.response;
    }
    
    const response = await this.service.analyze(request);
    this.cache.set(cacheKey, { response, timestamp: Date.now() });
    
    return response;
  }
}
```

### Batch Processing

```typescript
async function batchAnalyze(requests: AIAnalysisRequest[]): Promise<AIAnalysisResponse[]> {
  const batchSize = 5; // Process 5 requests at a time
  const results: AIAnalysisResponse[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(request => service.analyze(request))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

## 🔒 Security Considerations

### API Key Management

- Store API keys in environment variables
- Never commit API keys to version control
- Use different API keys for development/production
- Implement API key rotation

### Data Privacy

- **OpenAI/Anthropic**: Data sent to external servers
- **Ollama**: All processing local, no data leaves machine
- **Mock**: No external communication

### Rate Limiting

```typescript
class RateLimitedAIService {
  private requestCount = 0;
  private readonly maxRequests = 100; // per minute
  private readonly resetInterval = 60000; // 1 minute
  
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (this.requestCount >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    this.requestCount++;
    setTimeout(() => this.requestCount--, this.resetInterval);
    
    return await this.service.analyze(request);
  }
}
```

## 💰 Cost Optimization

### Token Management

```typescript
// Optimize prompt length
const optimizedPrompt = prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt;

// Use appropriate models
const model = request.complexity === 'high' ? 'gpt-4-vision-preview' : 'gpt-3.5-turbo';
```

### Provider Selection

```typescript
// Choose provider based on requirements
function selectProvider(requirements: AnalysisRequirements): string {
  if (requirements.privacy === 'high') return 'ollama';
  if (requirements.accuracy === 'high') return 'openai';
  if (requirements.cost === 'low') return 'anthropic';
  return 'mock';
}
```

## 🧪 Testing Strategies

### Unit Tests

```typescript
describe('AIServiceFactory', () => {
  it('should create OpenAI service', () => {
    const service = AIServiceFactory.createService({
      provider: 'openai',
      apiKey: 'test-key'
    });
    
    expect(service).toBeInstanceOf(OpenAIService);
  });
});
```

### Integration Tests

```typescript
describe('AI Service Integration', () => {
  it('should analyze trading chart', async () => {
    const service = AIServiceFactory.createService({ provider: 'mock' });
    const result = await service.analyze(testRequest);
    
    expect(result.recommendation).toBeDefined();
    expect(result.confidenceLevel).toBeGreaterThan(0);
  });
});
```

### Load Testing

```typescript
// Test concurrent requests
async function loadTest(concurrentRequests: number) {
  const promises = Array(concurrentRequests).fill(0).map(() => 
    service.analyze(testRequest)
  );
  
  const startTime = Date.now();
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  console.log(`Processed ${concurrentRequests} requests in ${totalTime}ms`);
  return results;
}
```

## 🚀 Deployment

### Production Configuration

```bash
# Production environment
AI_PROVIDER=openai
AI_API_KEY=sk-prod-key-here
AI_MODEL=gpt-4-vision-preview
AI_TIMEOUT=60000
AI_MAX_TOKENS=2000
```

### Docker Configuration

```dockerfile
# Dockerfile
ENV AI_PROVIDER=openai
ENV AI_API_KEY=${AI_API_KEY}
ENV AI_MODEL=gpt-4-vision-preview
```

### Environment-Specific Configs

```typescript
// config/ai.ts
const config = {
  development: {
    provider: 'mock',
    timeout: 30000
  },
  production: {
    provider: 'openai',
    timeout: 60000
  }
};
```

## 📚 Additional Resources

### Documentation
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Ollama Documentation](https://ollama.ai/docs)

### Examples
- `scripts/test-ai-services.mjs` - Test all services
- `scripts/demo-ai-services.mjs` - Demonstrate capabilities
- `src/api-ai.ts` - API endpoints implementation

### Support
- Check service health: `GET /api/ai/status`
- List providers: `GET /api/ai/providers`
- Test specific provider: `POST /api/ai/test-provider`

## 🎯 Next Steps

1. **Choose your preferred AI provider(s)**
2. **Set up API keys and configuration**
3. **Test with real trading charts**
4. **Implement fallback strategies**
5. **Monitor performance and costs**
6. **Optimize based on usage patterns**

---

**Happy Trading Analysis! 🚀📈**
