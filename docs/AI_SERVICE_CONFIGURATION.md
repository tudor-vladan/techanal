# AI Service Configuration

This document explains how to configure the AI service for the trading analysis application.

## Overview

The AI service supports multiple providers:
- **OpenAI**: GPT-4 Vision for advanced chart analysis ✅ **FULLY IMPLEMENTED**
- **Anthropic**: Claude for vision-based analysis ✅ **FULLY IMPLEMENTED**
- **Ollama**: Local AI models for privacy-focused analysis ✅ **FULLY IMPLEMENTED**
- **Mock**: Development/testing mode with simulated responses ✅ **FULLY IMPLEMENTED**

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

### Basic Configuration
```bash
# AI Provider: 'openai', 'anthropic', 'ollama', or 'mock'
AI_PROVIDER=mock

# Timeout and token limits
AI_TIMEOUT=30000
AI_MAX_TOKENS=1000
```

### OpenAI Configuration
```bash
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4-vision-preview
AI_TIMEOUT=30000
AI_MAX_TOKENS=1000
```

### Anthropic Configuration
```bash
AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-3-sonnet-20240229
AI_TIMEOUT=30000
AI_MAX_TOKENS=1000
```

### Ollama Configuration (Local)
```bash
AI_PROVIDER=ollama
AI_BASE_URL=http://localhost:11434
AI_MODEL=llama3.1:8b
AI_TIMEOUT=30000
AI_MAX_TOKENS=1000
```

## Setup Instructions

### 1. OpenAI Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Set `AI_PROVIDER=openai` and `AI_API_KEY=your_key`
3. Choose a model (recommended: `gpt-4-vision-preview`)
4. Ensure you have sufficient credits for vision API calls

### 2. Anthropic Setup
1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Set `AI_PROVIDER=anthropic` and `AI_API_KEY=your_key`
3. Choose a model (recommended: `claude-3-sonnet-20240229`)
4. Ensure you have sufficient credits for Claude API calls

### 3. Ollama Setup (Local)
1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Pull a model: `ollama pull llama3.1:8b`
3. Set `AI_PROVIDER=ollama` and `AI_BASE_URL=http://localhost:11434`
4. Start Ollama service: `ollama serve`

### 4. Mock Mode (Development)
- Set `AI_PROVIDER=mock` for development/testing
- No API keys required
- Generates realistic mock analysis responses

## Testing the Service

Run the test script to verify your configuration:

```bash
cd server
node scripts/test-ai-service.mjs
```

## API Endpoints

Once configured, the AI service provides these endpoints:

- `GET /api/ai/status` - Service health and capabilities
- `POST /api/ai/analyze-screenshot` - Analyze trading charts
- `POST /api/ai/enhanced-analysis` - Enhanced analysis with pattern recognition
- `POST /api/ai/test` - Test the AI service

## Capabilities

### OpenAI (GPT-4 Vision) ✅
- ✅ Vision analysis of trading charts
- ✅ Technical indicator interpretation
- ✅ Pattern recognition
- ✅ Risk assessment
- ✅ Position sizing recommendations
- ✅ Advanced chart analysis
- ✅ Support for multiple timeframes

### Anthropic (Claude) ✅
- ✅ Vision analysis of trading charts
- ✅ Technical indicator interpretation
- ✅ Pattern recognition
- ✅ Risk assessment
- ✅ Position sizing recommendations
- ✅ Advanced chart analysis
- ✅ Support for multiple timeframes

### Ollama (Local Models) ✅
- ✅ Text-based analysis
- ✅ Technical analysis
- ✅ Pattern recognition
- ✅ Risk assessment
- 🔒 Privacy-focused (no external API calls)
- ✅ Customizable models

### Mock Service ✅
- ✅ Development and testing
- ✅ Realistic response simulation
- ✅ No external dependencies
- ✅ Configurable response patterns

## Model Recommendations

### OpenAI Models
- **GPT-4 Vision Preview**: Best for complex chart analysis
- **GPT-4 Turbo**: Good balance of speed and accuracy
- **GPT-3.5 Turbo**: Cost-effective for basic analysis

### Anthropic Models
- **Claude 3 Sonnet**: Best balance of performance and cost
- **Claude 3 Opus**: Highest accuracy for complex analysis
- **Claude 3 Haiku**: Fastest and most cost-effective

### Ollama Models
- **Llama 3.1 8B**: Good balance of performance and resource usage
- **Llama 3.1 70B**: Highest accuracy (requires more resources)
- **CodeLlama**: Specialized for technical analysis

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify your API key is correct
   - Check if you have sufficient credits
   - Ensure the service is enabled for your account

2. **Vision API Issues (OpenAI/Anthropic)**
   - Ensure your model supports vision (e.g., gpt-4-vision-preview)
   - Check image format and size requirements
   - Verify API quotas and rate limits

3. **Ollama Connection Issues**
   - Verify Ollama is running: `ollama list`
   - Check the base URL: `http://localhost:11434`
   - Ensure the model is downloaded: `ollama pull model_name`

4. **Timeout Errors**
   - Increase `AI_TIMEOUT` for slower models
   - Check network connectivity
   - Consider using a faster model

### Performance Tips

1. **OpenAI**: Use `gpt-4-vision-preview` for best results
2. **Anthropic**: Use `claude-3-sonnet` for balanced performance
3. **Ollama**: Use quantized models (e.g., `llama3.1:8b-q4_0`) for faster inference
4. **Mock**: Perfect for development and testing

## Security Considerations

- **OpenAI**: API keys are sent to external service
- **Anthropic**: API keys are sent to external service
- **Ollama**: All processing is local, no data leaves your machine
- **Mock**: No external communication

## Cost Considerations

- **OpenAI**: Pay per token usage + vision API costs
- **Anthropic**: Pay per token usage + vision API costs
- **Ollama**: Free, but requires local computational resources
- **Mock**: Free, no external costs

## Advanced Configuration

### Custom Models
You can specify custom models for each provider:

```bash
# OpenAI custom model
AI_MODEL=gpt-4-vision-preview

# Anthropic custom model
AI_MODEL=claude-3-opus-20240229

# Ollama custom model
AI_MODEL=llama3.1:70b
```

### Timeout Configuration
Adjust timeouts based on your needs:

```bash
# 60 seconds for complex analysis
AI_TIMEOUT=60000

# 15 seconds for quick responses
AI_TIMEOUT=15000
```

### Token Limits
Configure maximum token usage:

```bash
# Higher token limit for detailed analysis
AI_MAX_TOKENS=2000

# Lower token limit for cost optimization
AI_MAX_TOKENS=500
```

## Next Steps

1. Choose your preferred AI provider
2. Configure environment variables
3. Test the service
4. Integrate with the trading analysis workflow
5. Monitor performance and adjust settings as needed
6. Consider implementing fallback strategies between providers
