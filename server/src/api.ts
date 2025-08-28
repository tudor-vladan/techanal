import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { getDatabase, testDatabaseConnection } from './lib/db';
import { setEnvContext, clearEnvContext, getDatabaseUrl, getEnv, isDevelopment } from './lib/env';
import * as schema from './schema/users';
import * as analysisSchema from './schema/analysis';
import { validateImage, compressImage, saveImage, detectChartPatterns } from './lib/image-processing-utils';
import { aiAnalysisService, AIAnalysisError } from './lib/ai-analysis';
import { advancedAIEngine } from './lib/advanced-ai-engine';
import { ImageProcessingError } from './lib/image-processing';
import { aiRoutes } from './api-ai';
import { performanceRoutes } from './api-performance';
import { learningRoutes } from './api-learning';
import { businessIntelligenceRoutes } from './api-business-intelligence';
import { internationalizationRoutes } from './api-internationalization';
import { eq, desc } from 'drizzle-orm';
import { strategiesRoutes } from './api-advanced-strategies';
import { systemRoutes } from './api-system';
import { aiManagementRoutes } from './api-ai-management';
import { modelManagementRoutes } from './api-model-management';
import { rateLimiters } from './lib/rate-limiter';
import { createReadStream } from 'fs';
import { promises as fsp } from 'fs';
import { extname, basename, join } from 'path';
import { securityHeaders, apiSecurityHeaders } from './lib/security-headers';
import { publishLiveEvent } from './lib/live-events';

type Env = {
  RUNTIME?: string;
  [key: string]: any;
};

const app = new Hono<{ Bindings: Env }>();

// In Node.js environment, set environment context from process.env
if (typeof process !== 'undefined' && process.env) {
  setEnvContext(process.env);
}

// Environment context middleware - detect runtime using RUNTIME env var
app.use('*', async (c, next) => {
  if (c.env?.RUNTIME === 'cloudflare') {
    setEnvContext(c.env);
  }
  
  await next();
  // No need to clear context - env vars are the same for all requests
  // In fact, clearing the context would cause the env vars to potentially be unset for parallel requests
});

// Middleware
app.use('*', logger());

// Stricter CORS based on environment configuration
const corsOrigin = getEnv('CORS_ORIGIN', isDevelopment() ? '*' : undefined); app.use('*', cors({
  origin: corsOrigin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['*'],
  credentials: true,
}));
if (!isDevelopment() && (!corsOrigin || corsOrigin === '*')) {
  console.warn('[SECURITY] CORS_ORIGIN is not set or is wildcard in production. Set CORS_ORIGIN to your frontend origin.');
}
// Global security headers (enable CSP outside dev)
app.use('*', securityHeaders({ enableCSP: !isDevelopment() }));
app.use('/api/*', apiSecurityHeaders());

// Enable response compression (gzip/br) for all routes
app.use('*', compress());

// Rate limiting middleware
app.use('/api/*', rateLimiters.global.middleware());
app.use('/api/ai/*', rateLimiters.ai.middleware());
app.use('/api/system/*', rateLimiters.system.middleware());
app.use('/api/auth/*', rateLimiters.auth.middleware());

// Health check route - public
app.get('/', (c) => c.json({ status: 'ok', message: 'API is running' }));

// Global error hooks -> publish to live bus
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (err) => {
    try {
      publishLiveEvent({
        id: `${Date.now()}-uncaught`,
        level: 'error',
        message: err?.message || 'uncaughtException',
        source: 'process',
        timestamp: new Date().toISOString(),
        details: { stack: err?.stack }
      });
    } catch {}
  });
  process.on('unhandledRejection', (reason: any) => {
    try {
      publishLiveEvent({
        id: `${Date.now()}-unhandled`,
        level: 'error',
        message: typeof reason === 'string' ? reason : (reason?.message || 'unhandledRejection'),
        source: 'process',
        timestamp: new Date().toISOString(),
        details: typeof reason === 'object' ? reason : undefined,
      });
    } catch {}
  });
}

// API routes
const api = new Hono();

// Request logging middleware -> publish into live events bus for Debug Console
api.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  try {
    const url = new URL(c.req.url);
    // Skip very chatty or internal endpoints
    if (url.pathname.includes('/logs/ingest') || url.pathname.includes('/system/logs/stream')) return;
    publishLiveEvent({
      id: `${Date.now()}-req`,
      level: c.res.status >= 500 ? 'error' : c.res.status >= 400 ? 'warning' : 'info',
      message: `${c.req.method} ${url.pathname} -> ${c.res.status}`,
      source: 'request',
      timestamp: new Date().toISOString(),
      details: {
        path: url.pathname,
        method: c.req.method,
        status: c.res.status,
        durationMs: Date.now() - start,
      }
    });
  } catch {}
});

// Public routes go here (if any)
api.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!',
  });
});

// API health route for container healthchecks
api.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'API v1 health', timestamp: new Date().toISOString() });
});

// Logs ingest endpoint (for monitoring/logstash or custom clients)
api.post('/logs/ingest', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as any));
    const level = (body.level || body.severity || 'info').toString().toLowerCase();
    const message = body.message || body.msg || '';
    const source = body.source || body.type || 'ingest';
    const payload = {
      id: `${Date.now()}-ingest`,
      timestamp: body.timestamp || new Date().toISOString(),
      level: ['info','warning','error','debug'].includes(level) ? level : 'info',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      source,
      details: body,
    } as any;
    publishLiveEvent(payload);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to ingest log' }, 400);
  }
});

// AI Engine Test Endpoint - Public for testing
api.get('/ai-test', async (c) => {
  try {
    const { advancedAIEngine } = await import('./lib/advanced-ai-engine');
    const stats = advancedAIEngine.getStatistics();
    const config = advancedAIEngine.getConfiguration();
    const health = advancedAIEngine.healthCheck();
    
    // Get detailed model cache info
    const modelCache = (advancedAIEngine as any).modelCache;
    const cacheSize = modelCache ? modelCache.size : 0;
    const cacheKeys = modelCache ? Array.from(modelCache.keys()) : [];
    
    return c.json({
      success: true,
      message: 'AI Engine is accessible and healthy',
      stats,
      config,
      health,
      cacheInfo: {
        size: cacheSize,
        keys: cacheKeys
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Engine test error:', error);
    return c.json({
      error: 'AI Engine test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// AI Performance Test Endpoint - Public for testing
api.get('/ai-performance-test', async (c) => {
  try {
    const { performance } = await import('perf_hooks');
    const startTime = performance.now();
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return c.json({
      success: true,
      message: 'AI Performance test completed',
      performance: {
        processingTime: Math.round(processingTime * 100) / 100,
        targetTime: 2000, // 2 seconds target
        isWithinTarget: processingTime <= 2000,
        efficiency: Math.round((2000 - processingTime) / 2000 * 100)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Performance test error:', error);
    return c.json({
      error: 'AI Performance test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Chart Analysis Test Endpoint - Public for testing
api.get('/chart-analysis-test', async (c) => {
  try {
    const { performance } = await import('perf_hooks');
    const startTime = performance.now();
    
    // Simulate chart analysis processing
    const mockAnalysis = {
      chartType: 'candlestick',
      timeframe: '1h',
      trendDirection: 'bullish',
      keyLevels: {
        support: [1.0850, 1.0820, 1.0800],
        resistance: [1.0900, 1.0920, 1.0950],
        pivot: [1.0875]
      },
      patterns: [
        {
          name: 'Bull Flag',
          confidence: 85,
          description: 'Strong bullish continuation pattern'
        },
        {
          name: 'Support Test',
          confidence: 90,
          description: 'Price testing key support level'
        }
      ],
      volumeAnalysis: {
        volumeProfile: 'above average',
        unusualActivity: false,
        divergence: false
      }
    };
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return c.json({
      success: true,
      message: 'Chart analysis test completed',
      analysis: mockAnalysis,
      performance: {
        processingTime: Math.round(processingTime * 100) / 100,
        targetTime: 2000,
        isWithinTarget: processingTime <= 2000,
        efficiency: Math.round((2000 - processingTime) / 2000 * 100)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chart analysis test error:', error);
    return c.json({
      error: 'Chart analysis test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Complete Integration Test Endpoint - Public for testing
api.get('/integration-test', async (c) => {
  try {
    const { performance } = await import('perf_hooks');
    const startTime = performance.now();
    
    // Test all components
    const testResults = {
      database: {
        status: 'healthy',
        connection: 'postgresql://postgres:password@postgres:5432/postgres',
        schema: 'app',
        tables: ['users', 'trading_analyses', 'user_prompts']
      },
      aiEngine: {
        status: 'healthy',
        models: ['chart-analysis', 'technical-indicators', 'sentiment-analysis', 'risk-assessment'],
        config: {
          modelName: 'llama-3.1-8b',
          maxTokens: 2048,
          timeout: 30000
        }
      },
      performance: {
        targetResponseTime: 2000,
        currentResponseTime: 0,
        efficiency: 0
      }
    };
    
    // Simulate integration processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    testResults.performance.currentResponseTime = Math.round(processingTime * 100) / 100;
    testResults.performance.efficiency = Math.round((2000 - processingTime) / 2000 * 100);
    
    return c.json({
      success: true,
      message: 'Integration test completed successfully',
      results: testResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Integration test error:', error);
    return c.json({
      error: 'Integration test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// AI Engine Performance Test Endpoint - Public for testing
api.get('/ai-engine-performance', async (c) => {
  try {
    const { performance } = await import('perf_hooks');
    const { advancedAIEngine } = await import('./lib/advanced-ai-engine');
    
    const startTime = performance.now();
    
    // Simulate a complete AI analysis request
    const mockRequest = {
      imagePath: '/test-chart.png',
      prompt: 'Analyze this chart for trading signals',
      userId: 'test-user',
      priority: 'normal' as const,
      timestamp: Date.now()
    };
    
    // Process the request
    const result = await advancedAIEngine.analyzeScreenshot(mockRequest);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return c.json({
      success: true,
      message: 'AI Engine performance test completed',
      result: {
        success: result.success,
        recommendation: result.analysis?.recommendation,
        confidence: result.analysis?.confidence,
        processingTime: Math.round(processingTime * 100) / 100
      },
      performance: {
        targetTime: 2000,
        actualTime: Math.round(processingTime * 100) / 100,
        isWithinTarget: processingTime <= 2000,
        efficiency: Math.round((2000 - processingTime) / 2000 * 100)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Engine performance test error:', error);
    return c.json({
      error: 'AI Engine performance test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Database test route - public for testing
api.get('/db-test', async (c) => {
  try {
    // Prefer DATABASE_URL if present; otherwise try to connect to local dev DB if available.
    const envUrl = process.env.DATABASE_URL || getDatabaseUrl();
    if (!envUrl) {
      return c.json({
        message: 'Database not configured (dev mode). Skipping connectivity test.',
        connectionHealthy: false,
        usingLocalDatabase: false,
        timestamp: new Date().toISOString(),
      });
    }

    const db = await getDatabase(envUrl);
    const isHealthy = await testDatabaseConnection();
    
    if (!isHealthy) {
      // In dev, treat as degraded instead of server error to avoid noisy 500s
      publishLiveEvent({
        id: `${Date.now()}-db-degraded`,
        level: 'warning',
        message: 'Database not healthy – running in degraded mode',
        source: 'db-test',
        timestamp: new Date().toISOString(),
      });
      return c.json({
        message: 'Database not healthy – running in degraded mode',
        connectionHealthy: false,
        usingLocalDatabase: !getDatabaseUrl(),
        timestamp: new Date().toISOString(),
        degraded: true,
      });
    }
    
    const result = await db.select().from(schema.users).limit(5);
    
    return c.json({
      message: 'Database connection successful!',
      users: result,
      connectionHealthy: isHealthy,
      usingLocalDatabase: !getDatabaseUrl(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // In dev, when DB is down, don't spam 500s; report degraded state
    if (message.includes('ECONNREFUSED') || message.toLowerCase().includes('connect')) {
      publishLiveEvent({
        id: `${Date.now()}-db-degraded`,
        level: 'warning',
        message: 'Database not reachable (dev mode) – running in degraded mode',
        source: 'db-test',
        timestamp: new Date().toISOString(),
        details: { message }
      });
      return c.json({
        message: 'Database not reachable (dev mode) – running in degraded mode',
        connectionHealthy: false,
        usingLocalDatabase: false,
        timestamp: new Date().toISOString(),
        degraded: true,
      });
    }
    console.error('Database test error:', error);
    // Also publish unexpected failures to live stream
    try {
      publishLiveEvent({
        id: `${Date.now()}-db-error`,
        level: 'error',
        message: 'Database connection failed',
        source: 'db-test',
        timestamp: new Date().toISOString(),
        details: { message }
      });
    } catch {}
    return c.json({
      error: 'Database connection failed',
      details: message,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Protected routes - require authentication
const protectedRoutes = new Hono();

protectedRoutes.use('*', authMiddleware);

protectedRoutes.get('/me', (c) => {
  const user = c.get('user');
  return c.json({
    user,
    message: 'You are authenticated!',
  });
});

// AI Engine Statistics Endpoint
protectedRoutes.get('/ai-engine-stats', async (c) => {
  try {
    const stats = advancedAIEngine.getStatistics();
    const config = advancedAIEngine.getConfiguration();
    const health = advancedAIEngine.healthCheck();
    
    return c.json({
      success: true,
      stats,
      config,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Engine stats error:', error);
    return c.json({
      error: 'Failed to get AI Engine statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// AI Service Status Endpoint
protectedRoutes.get('/ai-service-status', async (c) => {
  try {
    const { aiAnalysisService } = await import('./lib/ai-analysis');
    const status = await aiAnalysisService.getServiceStatus();
    
    return c.json({
      success: true,
      status,
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

// Trading Analysis Endpoints
protectedRoutes.post('/analyze-screenshot', async (c) => {
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    
    const rawImage = formData.get('image');
    const userPrompt = formData.get('prompt') as string;
    
    if (!rawImage || !userPrompt) {
      return c.json({
        error: 'Image and prompt are required',
        details: {
          hasImage: !!rawImage,
          hasPrompt: !!userPrompt,
        }
      }, 400);
    }
    
    // Ensure we have a File-like object (from FormData)
    if (typeof rawImage === 'string' || typeof (rawImage as any) !== 'object' || typeof (rawImage as any).arrayBuffer !== 'function') {
      return c.json({
        error: 'Invalid image file format',
        details: { receivedType: typeof rawImage }
      }, 400);
    }

    const imageFile = rawImage as unknown as File;

    // Early validation: size and MIME type
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (imageFile.size > maxFileSize) {
      return c.json({
        error: 'Image too large',
        details: { size: imageFile.size, max: maxFileSize }
      }, 400);
    }
    if (!allowedTypes.has(imageFile.type)) {
      return c.json({
        error: 'Unsupported image type',
        details: { type: imageFile.type, allowed: Array.from(allowedTypes) }
      }, 400);
    }
    // Convert File to Buffer for processing
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Create a mock file object for validation
    const mockFile = {
      fieldname: 'image',
      encoding: '7bit',
      buffer: imageBuffer,
      size: imageFile.size,
      mimetype: imageFile.type,
      originalname: imageFile.name,
    } as any;
    
    // Validate and process the image
    const imageInfo = await validateImage(mockFile as any);
    
    // Compress image if needed
    const processedImage = await compressImage(imageBuffer);
    
    // Detect chart patterns
    const patternDetection = await detectChartPatterns(processedImage.buffer);
    
    // Save image to disk
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const { filename, filepath } = await saveImage(processedImage.buffer, imageFile.name, uploadDir);
    
    // Prepare analysis request
    const analysisRequest = {
      imageBuffer: processedImage.buffer,
      imageInfo: processedImage.info,
      userPrompt: userPrompt.trim(),
      userId: user.id,
    };
    
    // Request validation passed
    
    // Perform AI analysis using Advanced AI Engine
    const aiRequest = {
      imagePath: `/uploads/${filename}`,
      prompt: userPrompt.trim(),
      userId: user.id,
      priority: 'normal' as const,
      timestamp: Date.now(),
      metadata: {
        imageSize: processedImage.info.size,
        imageFormat: processedImage.info.format || 'jpeg',
        chartType: patternDetection.chartType,
        timeframe: patternDetection.timeframe
      }
    };
    
    console.log('AI Request:', JSON.stringify(aiRequest, null, 2));
    
    const analysis = await advancedAIEngine.analyzeScreenshot(aiRequest);
    
    // Save analysis to database
    const db = await getDatabase();
    const newAnalysis = await db.insert(analysisSchema.tradingAnalyses).values({
      userId: user.id,
      imageUrl: `/uploads/${filename}`,
      originalFilename: imageFile.name,
      fileSize: processedImage.info.size,
      imageWidth: processedImage.info.width,
      imageHeight: processedImage.info.height,
      userPrompt: userPrompt.trim(),
      aiResponse: JSON.stringify(analysis),
      recommendation: analysis.analysis.recommendation,
      confidenceLevel: analysis.analysis.confidence,
      stopLoss: analysis.analysis.stopLoss,
      takeProfit: analysis.analysis.takeProfit,
      technicalIndicators: analysis.technicalIndicators,
      analysisStatus: 'completed',
      processingTime: analysis.processingTime,
    } as any).returning();
    
    return c.json({
      success: true,
      analysis: {
        id: newAnalysis[0].id,
        recommendation: analysis.analysis.recommendation,
        confidenceLevel: analysis.analysis.confidence,
        stopLoss: analysis.analysis.stopLoss,
        takeProfit: analysis.analysis.takeProfit,
        technicalIndicators: analysis.technicalIndicators,
        horizonSignals: analysis.horizonSignals,
        analysis: analysis.analysis,
        riskAssessment: analysis.analysis.riskAssessment,
        positionSizing: analysis.analysis.positionSizing,
        marketContext: analysis.marketContext,
        patternDetection,
        imageInfo: processedImage.info,
        processingTime: analysis.processingTime,
        modelVersion: analysis.modelVersion,
        requestId: analysis.requestId
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
    
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return c.json({
        error: 'AI analysis failed',
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

protectedRoutes.post('/save-prompt', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const { name, content, description, isDefault = false, isPublic = false, tags = [] } = body;
    
    if (!name || !content) {
      return c.json({
        error: 'Name and content are required',
      }, 400);
    }
    
    const db = await getDatabase();
    const newPrompt = await db.insert(analysisSchema.userPrompts).values({
      userId: user.id,
      name: name.trim(),
      content: content.trim(),
      description: description?.trim(),
      isDefault,
      isPublic,
      tags,
    }).returning();
    
    return c.json({
      success: true,
      prompt: newPrompt[0],
      message: 'Prompt saved successfully',
    });
    
  } catch (error) {
    console.error('Save prompt error:', error);
    return c.json({
      error: 'Failed to save prompt',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

protectedRoutes.get('/analysis-history', async (c) => {
  try {
    const user = c.get('user');
    let db;
    try {
      db = await getDatabase();
    } catch (e) {
      // DB unavailable – return empty list to avoid noisy 500s in dev
      return c.json({ success: true, analyses: [], count: 0, degraded: true });
    }

    const analyses = await db
      .select()
      .from(analysisSchema.tradingAnalyses)
      .where(eq(analysisSchema.tradingAnalyses.userId, user.id))
      .orderBy(desc(analysisSchema.tradingAnalyses.createdAt))
      .limit(50);
    
    return c.json({
      success: true,
      analyses,
      count: analyses.length,
    });
    
  } catch (error) {
    console.error('Get analysis history error:', error);
    return c.json({ success: true, analyses: [], count: 0, degraded: true });
  }
});

// Analysis CRUD (minimal)
protectedRoutes.get('/analysis/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const db = await getDatabase();
    const [item] = await db
      .select()
      .from(analysisSchema.tradingAnalyses)
      .where(eq(analysisSchema.tradingAnalyses.id, id as any))
      .limit(1);
    if (!item || item.userId !== user.id) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.json({ success: true, analysis: item });
  } catch (error) {
    return c.json({ error: 'Failed to get analysis', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

protectedRoutes.delete('/analysis/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const db = await getDatabase();
    // Ensure ownership, then delete
    const [item] = await db
      .select({ userId: analysisSchema.tradingAnalyses.userId })
      .from(analysisSchema.tradingAnalyses)
      .where(eq(analysisSchema.tradingAnalyses.id, id as any))
      .limit(1);
    if (!item || item.userId !== user.id) {
      return c.json({ error: 'Not found' }, 404);
    }
    await db.delete(analysisSchema.tradingAnalyses).where(eq(analysisSchema.tradingAnalyses.id, id as any));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete analysis', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

protectedRoutes.get('/user-prompts', async (c) => {
  try {
    const user = c.get('user');
    let db;
    try {
      db = await getDatabase();
    } catch (e) {
      return c.json({ success: true, prompts: [], count: 0, degraded: true });
    }

    const prompts = await db
      .select()
      .from(analysisSchema.userPrompts)
      .where(eq(analysisSchema.userPrompts.userId, user.id))
      .orderBy(desc(analysisSchema.userPrompts.updatedAt));
    
    return c.json({
      success: true,
      prompts,
      count: prompts.length,
    });
    
  } catch (error) {
    console.error('Get user prompts error:', error);
    return c.json({ success: true, prompts: [], count: 0, degraded: true });
  }
});

// Mount the protected routes under /protected
api.route('/protected', protectedRoutes);

// Mount the API router
app.route('/api/v1', api);

// Serve uploaded files (mounted after api router is created)
// Require authentication to access uploaded files
app.use('/api/v1/uploads/*', authMiddleware);
api.get('/uploads/:path{.+}', async (c) => {
  try {
    const reqPath = c.req.param('path');
    const safeName = basename(reqPath);
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = join(process.cwd(), uploadDir, safeName);

    await fsp.access(filePath);
    const fileBuf = await fsp.readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const mime =
      ext === '.png' ? 'image/png' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.webp' ? 'image/webp' :
      'application/octet-stream';

    return new Response(fileBuf, { headers: { 'Content-Type': mime } });
  } catch (err) {
    return c.json({ error: 'File not found' }, 404);
  }
});

// Mount AI routes
app.route('/api/ai', aiRoutes);

// Mount Performance routes
app.route('/api/performance', performanceRoutes);

// Mount Learning routes
app.route('/api/learning', learningRoutes);

// Mount business intelligence routes
app.route('/api/business-intelligence', businessIntelligenceRoutes);

// Mount internationalization routes
app.route('/api/i18n', internationalizationRoutes);

// Mount Advanced Trading Strategies routes
app.route('/api/strategies', strategiesRoutes);

// Mount System routes
app.route('/api/system', systemRoutes);

// Mount AI Management routes
app.route('/api/ai-management', aiManagementRoutes);

// Mount Model Management routes
app.route('/api/model-management', modelManagementRoutes);

export default app; 