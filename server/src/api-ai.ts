import { Hono } from 'hono';
import { authMiddleware } from './middleware/auth';
import { aiService, AIServiceFactory } from './lib/ai-service';
import { enhancedAIAnalysis } from './lib/enhanced-ai-analysis';
import { validateImage, compressImage, saveImage, detectChartPatterns } from './lib/image-processing-utils';
import { ImageProcessingError } from './lib/image-processing';

// Type definition for Express Multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const aiRoutes = new Hono();

// AI Service Status Endpoint (public for monitoring)
aiRoutes.get('/status', async (c) => {
  try {
    const isHealthy = await aiService.healthCheck();
    const capabilities = aiService.getCapabilities();
    
    return c.json({
      success: true,
      status: {
        isHealthy,
        capabilities,
        provider: aiService.constructor.name,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Service status error:', error);
    return c.json({
      error: 'Failed to get AI Service status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Apply authentication middleware to protected AI routes
aiRoutes.use('*', authMiddleware);

// AI Provider Selection and Testing Endpoint
aiRoutes.post('/test-provider', async (c) => {
  try {
    const body = await c.req.json();
    const { provider, prompt, testImage, apiKey, model, baseUrl } = body;
    
    if (!provider || !prompt) {
      return c.json({
        error: 'Provider and prompt are required',
        details: {
          hasProvider: !!provider,
          hasPrompt: !!prompt,
        }
      }, 400);
    }
    
    // Validate provider
    const validProviders = ['openai', 'anthropic', 'ollama', 'mock'];
    if (!validProviders.includes(provider)) {
      return c.json({
        error: 'Invalid provider',
        details: {
          validProviders,
          received: provider
        }
      }, 400);
    }
    
    // Create provider-specific configuration
    const config: any = { provider };
    
    if (provider === 'openai' || provider === 'anthropic') {
      if (!apiKey) {
        return c.json({
          error: `${provider.toUpperCase()} API key is required`,
          details: {
            provider,
            missing: 'apiKey'
          }
        }, 400);
      }
      config.apiKey = apiKey;
      config.model = model || (provider === 'openai' ? 'gpt-4-vision-preview' : 'claude-3-sonnet-20240229');
    }
    
    if (provider === 'ollama') {
      if (!baseUrl) {
        return c.json({
          error: 'Ollama base URL is required',
          details: {
            provider,
            missing: 'baseUrl'
          }
        }, 400);
      }
      config.baseUrl = baseUrl;
      config.model = model || 'llama3.1:8b';
    }
    
    // Set default values
    config.timeout = 30000;
    config.maxTokens = 1000;
    
    // Create service instance
    const service = AIServiceFactory.createService(config);
    
    // Test the service
    const testRequest = {
      imageBase64: testImage || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      prompt: prompt.trim(),
      userId: 'test-user',
      metadata: {
        chartType: 'candlestick',
        timeframe: '1h',
        imageSize: testImage ? testImage.length : 100,
        imageFormat: 'jpeg'
      }
    };
    
    // Test health check
    const isHealthy = await service.healthCheck();
    
    // Perform analysis
    const startTime = Date.now();
    const analysis = await service.analyze(testRequest);
    const processingTime = Date.now() - startTime;
    
    return c.json({
      success: true,
      test: {
        provider,
        isHealthy,
        processingTime,
        prompt,
        response: analysis,
        capabilities: service.getCapabilities(),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Provider test error:', error);
    return c.json({
      error: 'Provider test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Trading Analysis Endpoint with Provider Selection
aiRoutes.post('/analyze-screenshot', async (c) => {
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    
    const imageFile = formData.get('image');
    const userPrompt = formData.get('prompt');
    const provider = formData.get('provider') as string || 'default';
    
    if (!imageFile || !userPrompt) {
      return c.json({
        error: 'Image and prompt are required',
        details: {
          hasImage: !!imageFile,
          hasPrompt: !!userPrompt,
        }
      }, 400);
    }
    
    // Type guard to ensure imageFile is a File
    if (typeof imageFile === 'string' || !imageFile || typeof imageFile !== 'object') {
      return c.json({
        error: 'Invalid image file format',
        details: {
          receivedType: typeof imageFile
        }
      }, 400);
    }
    
    // Check if it has the required File properties
    const file = imageFile as any;
    if (typeof file.arrayBuffer !== 'function' || typeof file.name !== 'string' || typeof file.type !== 'string' || typeof file.size !== 'number') {
      return c.json({
        error: 'Invalid file object - missing required File properties',
        details: {
          hasArrayBuffer: typeof file.arrayBuffer === 'function',
          hasName: typeof file.name === 'string',
          hasType: typeof file.type === 'string',
          hasSize: typeof file.size === 'number'
        }
      }, 400);
    }
    
    // Early validation: size and MIME type
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (file.size > maxFileSize) {
      return c.json({
        error: 'Image too large',
        details: { size: file.size, max: maxFileSize }
      }, 400);
    }
    if (!allowedTypes.has(file.type)) {
      return c.json({
        error: 'Unsupported image type',
        details: { type: file.type, allowed: Array.from(allowedTypes) }
      }, 400);
    }

    // Convert File to Buffer for processing
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    
    // Create a mock file object for validation
    const mockFile: MulterFile = {
      fieldname: 'image',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      size: file.size,
      buffer: imageBuffer,
    };
    
    // Validate and process the image
    await validateImage(mockFile);
    
    // Compress image if needed
    const processedImage = await compressImage(imageBuffer);
    
    // Detect chart patterns
    const patternDetection = await detectChartPatterns(processedImage.buffer);
    
    // Save image to disk
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const { filename, filepath } = await saveImage(processedImage.buffer, file.name, uploadDir);
    
    // Prepare analysis request for AI service
    const aiRequest = {
      imageBase64: processedImage.buffer.toString('base64'),
      prompt: userPrompt.toString().trim(),
      userId: user.id,
      metadata: {
        chartType: patternDetection.chartType,
        timeframe: patternDetection.timeframe,
        imageSize: processedImage.info.size,
        imageFormat: processedImage.info.format
      }
    };
    
    // Use specified provider or default service
    let analysis;
    if (provider && provider !== 'default') {
      // Create service with specific provider configuration
      const config: any = { 
        provider: provider as 'openai' | 'anthropic' | 'ollama' | 'mock',
        apiKey: process.env.AI_API_KEY,
        model: process.env.AI_MODEL,
        baseUrl: process.env.AI_BASE_URL,
        timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000')
      };
      
      const service = AIServiceFactory.createService(config);
      analysis = await service.analyze(aiRequest);
    } else {
      // Use default service
      analysis = await aiService.analyze(aiRequest);
    }
    
    return c.json({
      success: true,
      analysis: {
        recommendation: analysis.recommendation,
        confidenceLevel: analysis.confidenceLevel,
        stopLoss: analysis.stopLoss,
        takeProfit: analysis.takeProfit,
        technicalIndicators: analysis.technicalIndicators,
        analysis: analysis.analysis,
        riskAssessment: analysis.riskAssessment,
        positionSizing: analysis.positionSizing,
        marketContext: analysis.marketContext,
        patternAnalysis: analysis.patternAnalysis,
        patternDetection,
        imageInfo: processedImage.info,
        imageUrl: `/uploads/${filename}`,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: provider === 'default' ? aiService.constructor.name : provider
      },
      message: 'Analysis completed successfully',
    });
    
  } catch (error) {
    console.error('Screenshot analysis error:', error);
    
    if (error instanceof ImageProcessingError) {
      return c.json({
        error: 'Image processing failed',
        details: error.message,
        code: error.code,
      }, 400);
    }
    
    return c.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Enhanced AI Analysis Endpoint
aiRoutes.post('/enhanced-analysis', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const { imageBase64, prompt, enableAdvancedPatterns = true, enableTechnicalIndicators = true } = body;
    
    if (!imageBase64 || !prompt) {
      return c.json({
        error: 'Image (base64) and prompt are required',
        details: {
          hasImage: !!imageBase64,
          hasPrompt: !!prompt,
        }
      }, 400);
    }
    
    // Prepare enhanced analysis request
    const enhancedRequest = {
      imageBase64,
      prompt: prompt.trim(),
      userId: user.id,
      enableAdvancedPatterns,
      enableTechnicalIndicators,
      metadata: {
        chartType: 'candlestick',
        timeframe: '1h',
        imageSize: imageBase64.length,
        imageFormat: 'jpeg'
      }
    };
    
    // Perform enhanced analysis
    const analysis = await enhancedAIAnalysis.analyzeChart(enhancedRequest);
    
    return c.json({
      success: true,
      analysis: {
        recommendation: analysis.recommendation,
        confidenceLevel: analysis.confidenceLevel,
        stopLoss: analysis.stopLoss,
        takeProfit: analysis.takeProfit,
        technicalIndicators: analysis.technicalIndicators,
        analysis: analysis.analysis,
        riskAssessment: analysis.riskAssessment,
        positionSizing: analysis.positionSizing,
        marketContext: analysis.marketContext,
        patternAnalysis: analysis.patternAnalysis,
        advancedPatterns: analysis.advancedPatterns,
        technicalAnalysis: analysis.technicalAnalysis,
        confidenceBreakdown: analysis.confidenceBreakdown,
        recommendations: analysis.recommendations,
        requestId: `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      message: 'Enhanced analysis completed successfully',
    });
    
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    return c.json({
      error: 'Enhanced analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Test AI Service Endpoint
aiRoutes.post('/test', async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, testImage } = body;
    
    if (!prompt) {
      return c.json({
        error: 'Prompt is required for testing',
      }, 400);
    }
    
    // Create a test request
    const testRequest = {
      imageBase64: testImage || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent pixel
      prompt: prompt,
      userId: 'test-user',
      metadata: {
        chartType: 'candlestick',
        timeframe: '1h',
        imageSize: testImage ? testImage.length : 100,
        imageFormat: 'png'
      }
    };
    
    // Test the AI service
    const analysis = await aiService.analyze(testRequest);
    
    return c.json({
      success: true,
      test: {
        prompt,
        response: analysis,
        service: aiService.constructor.name,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('AI test error:', error);
    return c.json({
      error: 'AI test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// List Available AI Providers Endpoint
aiRoutes.get('/providers', async (c) => {
  try {
    const providers = [
      {
        id: 'openai',
        name: 'OpenAI GPT-4 Vision',
        description: 'Advanced vision analysis using GPT-4 Vision Preview',
        capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
        requiresApiKey: true,
        models: ['gpt-4-vision-preview', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        pricing: 'Pay per token + vision API costs',
        privacy: 'Data sent to OpenAI servers'
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        description: 'Vision analysis using Claude 3 Sonnet/Opus',
        capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
        requiresApiKey: true,
        models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
        pricing: 'Pay per token + vision API costs',
        privacy: 'Data sent to Anthropic servers'
      },
      {
        id: 'ollama',
        name: 'Ollama (Local)',
        description: 'Local AI models for privacy-focused analysis',
        capabilities: ['text-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment'],
        requiresApiKey: false,
        models: ['llama3.1:8b', 'llama3.1:70b', 'codellama'],
        pricing: 'Free (local computational resources)',
        privacy: 'All processing local, no data leaves your machine'
      },
      {
        id: 'mock',
        name: 'Mock Service',
        description: 'Development and testing service with simulated responses',
        capabilities: ['mock-analysis', 'development-testing'],
        requiresApiKey: false,
        models: ['mock'],
        pricing: 'Free',
        privacy: 'No external communication'
      }
    ];
    
    return c.json({
      success: true,
      providers,
      currentProvider: aiService.constructor.name.replace('Service', '').toLowerCase(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Providers list error:', error);
    return c.json({
      error: 'Failed to get providers list',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { aiRoutes };
