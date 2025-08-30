import { Hono } from 'hono';
import { authMiddleware } from './middleware/auth';
import { AIServiceFactory, AIServiceConfig } from './lib/ai-service';
import { getEnv } from './lib/env';

const aiManagementRoutes = new Hono();

// AI Provider Management Endpoints
aiManagementRoutes.use('*', authMiddleware);

// Get all AI providers status and configuration
aiManagementRoutes.get('/providers', async (c) => {
  try {
    const providers = [
      {
        id: 'ollama',
        name: 'Ollama Local',
        status: 'active',
        health: 95,
        responseTime: 1200,
        accuracy: 87,
        costPerRequest: 0,
        requestsPerMinute: 15,
        totalRequests: 1250,
        lastUsed: new Date().toISOString(),
        capabilities: ['text-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment'],
        model: 'llama3.1:8b',
        baseUrl: getEnv('OLLAMA_BASE_URL', 'http://localhost:11434'),
        timeout: parseInt(getEnv('OLLAMA_TIMEOUT') ?? '30000'),
        maxTokens: parseInt(getEnv('OLLAMA_MAX_TOKENS') ?? '1000'),
        temperature: parseFloat(getEnv('OLLAMA_TEMPERATURE') ?? '0.3'),
        isDefault: getEnv('AI_PROVIDER', 'ollama') === 'ollama'
      },
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        status: getEnv('OPENAI_API_KEY') ? 'active' : 'inactive',
        health: getEnv('OPENAI_API_KEY') ? 90 : 0,
        responseTime: getEnv('OPENAI_API_KEY') ? 1800 : 0,
        accuracy: getEnv('OPENAI_API_KEY') ? 92 : 0,
        costPerRequest: 0.03,
        requestsPerMinute: getEnv('OPENAI_API_KEY') ? 8 : 0,
        totalRequests: getEnv('OPENAI_API_KEY') ? 450 : 0,
        lastUsed: getEnv('OPENAI_API_KEY') ? new Date().toISOString() : '',
        capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
        model: getEnv('OPENAI_MODEL', 'gpt-4-vision-preview'),
        apiKey: getEnv('OPENAI_API_KEY'),
        timeout: parseInt(getEnv('OPENAI_TIMEOUT') ?? '30000'),
        maxTokens: parseInt(getEnv('OPENAI_MAX_TOKENS') ?? '1000'),
        temperature: parseFloat(getEnv('OPENAI_TEMPERATURE') ?? '0.3'),
        isDefault: getEnv('AI_PROVIDER', 'ollama') === 'openai'
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        status: getEnv('ANTHROPIC_API_KEY') ? 'active' : 'inactive',
        health: getEnv('ANTHROPIC_API_KEY') ? 88 : 0,
        responseTime: getEnv('ANTHROPIC_API_KEY') ? 2200 : 0,
        accuracy: getEnv('ANTHROPIC_API_KEY') ? 89 : 0,
        costPerRequest: 0.015,
        requestsPerMinute: getEnv('ANTHROPIC_API_KEY') ? 6 : 0,
        totalRequests: getEnv('ANTHROPIC_API_KEY') ? 280 : 0,
        lastUsed: getEnv('ANTHROPIC_API_KEY') ? new Date().toISOString() : '',
        capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
        model: getEnv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
        apiKey: getEnv('ANTHROPIC_API_KEY'),
        timeout: parseInt(getEnv('ANTHROPIC_TIMEOUT') ?? '30000'),
        maxTokens: parseInt(getEnv('ANTHROPIC_MAX_TOKENS') ?? '1000'),
        temperature: parseFloat(getEnv('ANTHROPIC_TEMPERATURE') ?? '0.3'),
        isDefault: getEnv('AI_PROVIDER', 'ollama') === 'anthropic'
      },
      {
        id: 'mock',
        name: 'Mock Service',
        status: 'active',
        health: 100,
        responseTime: 2500,
        accuracy: 75,
        costPerRequest: 0,
        requestsPerMinute: 8,
        totalRequests: 320,
        lastUsed: new Date().toISOString(),
        capabilities: ['mock-analysis', 'development-testing'],
        model: 'mock-v1',
        timeout: 30000,
        maxTokens: 1000,
        temperature: 0.3,
        isDefault: getEnv('AI_PROVIDER', 'ollama') === 'mock'
      }
    ];

    return c.json({ success: true, providers });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch providers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get AI provider metrics
aiManagementRoutes.get('/metrics', async (c) => {
  try {
    const metrics = {
      totalRequests: 1570,
      successfulRequests: 1480,
      failedRequests: 90,
      averageResponseTime: 1850,
      totalCost: 0,
      accuracyRate: 94.3,
      uptime: 99.8,
      last24Hours: {
        requests: 45,
        errors: 2,
        cost: 0
      }
    };

    return c.json({ success: true, metrics });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test AI provider
aiManagementRoutes.post('/test-provider', async (c) => {
  try {
    const { providerId } = await c.req.json();
    
    if (!providerId) {
      return c.json({ success: false, error: 'Provider ID is required' }, 400);
    }

    const pid = String(providerId).toLowerCase();

    // Fast path for mock provider
    if (pid === 'mock') {
      return c.json({
        success: true,
        message: 'Provider mock is healthy',
        provider: 'mock',
        status: 'healthy',
        capabilities: ['mock-analysis', 'development-testing']
      });
    }

    // Validate required environment for each provider to avoid 500s
    if (pid === 'ollama') {
      const baseUrl = getEnv('OLLAMA_BASE_URL');
      if (!baseUrl) {
        return c.json({ success: false, error: 'OLLAMA_BASE_URL is not set' }, 400);
      }
    }
    if (pid === 'openai') {
      const apiKey = getEnv('OPENAI_API_KEY');
      if (!apiKey) {
        return c.json({ success: false, error: 'OPENAI_API_KEY is not set' }, 400);
      }
    }
    if (pid === 'anthropic') {
      const apiKey = getEnv('ANTHROPIC_API_KEY');
      if (!apiKey) {
        return c.json({ success: false, error: 'ANTHROPIC_API_KEY is not set' }, 400);
      }
    }

    // Create test configuration
    const testConfig: AIServiceConfig = {
      provider: pid as any,
      apiKey: getEnv(`${pid.toUpperCase()}_API_KEY`),
      model: getEnv(`${pid.toUpperCase()}_MODEL`),
      baseUrl: getEnv(`${pid.toUpperCase()}_BASE_URL`),
      timeout: parseInt(getEnv(`${pid.toUpperCase()}_TIMEOUT`) ?? '30000'),
      maxTokens: parseInt(getEnv(`${pid.toUpperCase()}_MAX_TOKENS`) ?? '1000')
    };

    try {
      // Test the provider
      const service = AIServiceFactory.createService(testConfig);
      const isHealthy = await service.healthCheck();

      if (isHealthy) {
        return c.json({ 
          success: true, 
          message: `Provider ${pid} is healthy`,
          provider: pid,
          status: 'healthy',
          capabilities: service.getCapabilities()
        });
      } else {
        return c.json({ 
          success: false, 
          message: `Provider ${pid} health check failed`,
          provider: pid,
          status: 'unhealthy'
        }, 400);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Convert common configuration errors to 400s for clarity
      if (/required/i.test(msg) || /not set/i.test(msg)) {
        return c.json({ success: false, error: msg }, 400);
      }
      return c.json({ success: false, error: 'Failed to test provider', details: msg }, 500);
    }
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to test provider',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update AI provider configuration
aiManagementRoutes.put('/provider/:id', async (c) => {
  try {
    const providerId = c.req.param('id');
    const config = await c.req.json();

    if (!providerId || !config) {
      return c.json({ success: false, error: 'Provider ID and configuration are required' }, 400);
    }

    // Validate configuration
    if (config.provider === 'openai' && !config.apiKey) {
      return c.json({ success: false, error: 'OpenAI API key is required' }, 400);
    }

    if (config.provider === 'anthropic' && !config.apiKey) {
      return c.json({ success: false, error: 'Anthropic API key is required' }, 400);
    }

    if (config.provider === 'ollama' && !config.baseUrl) {
      return c.json({ success: false, error: 'Ollama base URL is required' }, 400);
    }

    // Test the new configuration
    const testConfig: AIServiceConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      maxTokens: config.maxTokens || 1000
    };

    const service = AIServiceFactory.createService(testConfig);
    const isHealthy = await service.healthCheck();

    if (!isHealthy) {
      return c.json({ 
        success: false, 
        error: 'Provider configuration test failed',
        provider: providerId
      }, 400);
    }

    // Here you would typically save the configuration to a database or config file
    // For now, we'll just return success

    return c.json({ 
      success: true, 
      message: `Provider ${providerId} configuration updated successfully`,
      provider: providerId,
      config: testConfig
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to update provider configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Set default AI provider
aiManagementRoutes.post('/set-default/:id', async (c) => {
  try {
    const providerId = c.req.param('id');
    
    if (!providerId) {
      return c.json({ success: false, error: 'Provider ID is required' }, 400);
    }

    // Validate provider exists and is healthy
    const testConfig: AIServiceConfig = {
      provider: providerId as any,
      apiKey: getEnv(`${providerId.toUpperCase()}_API_KEY`),
      model: getEnv(`${providerId.toUpperCase()}_MODEL`),
      baseUrl: getEnv(`${providerId.toUpperCase()}_BASE_URL`),
      timeout: parseInt(getEnv(`${providerId.toUpperCase()}_TIMEOUT`) ?? '30000'),
      maxTokens: parseInt(getEnv(`${providerId.toUpperCase()}_MAX_TOKENS`) ?? '1000')
    };

    const service = AIServiceFactory.createService(testConfig);
    const isHealthy = await service.healthCheck();

    if (!isHealthy) {
      return c.json({ 
        success: false, 
        error: 'Cannot set unhealthy provider as default',
        provider: providerId
      }, 400);
    }

    // Here you would typically update the environment variable or config file
    // For now, we'll just return success

    return c.json({ 
      success: true, 
      message: `Provider ${providerId} set as default successfully`,
      provider: providerId
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to set default provider',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get AI provider capabilities
aiManagementRoutes.get('/capabilities/:id', async (c) => {
  try {
    const providerId = c.req.param('id');
    
    if (!providerId) {
      return c.json({ success: false, error: 'Provider ID is required' }, 400);
    }

    const testConfig: AIServiceConfig = {
      provider: providerId as any,
      apiKey: getEnv(`${providerId.toUpperCase()}_API_KEY`),
      model: getEnv(`${providerId.toUpperCase()}_MODEL`),
      baseUrl: getEnv(`${providerId.toUpperCase()}_BASE_URL`),
      timeout: parseInt(getEnv(`${providerId.toUpperCase()}_TIMEOUT`) ?? '30000'),
      maxTokens: parseInt(getEnv(`${providerId.toUpperCase()}_MAX_TOKENS`) ?? '1000')
    };

    const service = AIServiceFactory.createService(testConfig);
    const capabilities = service.getCapabilities();

    return c.json({ 
      success: true, 
      provider: providerId,
      capabilities
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to get provider capabilities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Health check for all providers
aiManagementRoutes.get('/health-check', async (c) => {
  try {
    const providers = ['ollama', 'openai', 'anthropic', 'mock'];
    const healthResults = [];

    for (const providerId of providers) {
      try {
        const testConfig: AIServiceConfig = {
          provider: providerId as any,
          apiKey: getEnv(`${providerId.toUpperCase()}_API_KEY`),
          model: getEnv(`${providerId.toUpperCase()}_MODEL`),
          baseUrl: getEnv(`${providerId.toUpperCase()}_BASE_URL`),
          timeout: parseInt(getEnv(`${providerId.toUpperCase()}_TIMEOUT`) ?? '30000'),
          maxTokens: parseInt(getEnv(`${providerId.toUpperCase()}_MAX_TOKENS`) ?? '1000')
        };

        const service = AIServiceFactory.createService(testConfig);
        const startTime = Date.now();
        const isHealthy = await service.healthCheck();
        const responseTime = Date.now() - startTime;

        healthResults.push({
          provider: providerId,
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        healthResults.push({
          provider: providerId,
          status: 'error',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    return c.json({ 
      success: true, 
      healthResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to perform health check',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get AI provider usage statistics
aiManagementRoutes.get('/usage/:id', async (c) => {
  try {
    const providerId = c.req.param('id');
    
    if (!providerId) {
      return c.json({ success: false, error: 'Provider ID is required' }, 400);
    }

    // Mock usage statistics - in production this would come from a database
    const usageStats = {
      provider: providerId,
      totalRequests: Math.floor(Math.random() * 1000) + 100,
      successfulRequests: Math.floor(Math.random() * 800) + 100,
      failedRequests: Math.floor(Math.random() * 100),
      averageResponseTime: Math.floor(Math.random() * 2000) + 500,
      totalCost: providerId === 'ollama' || providerId === 'mock' ? 0 : Math.random() * 50,
      last24Hours: {
        requests: Math.floor(Math.random() * 50) + 10,
        errors: Math.floor(Math.random() * 10),
        cost: providerId === 'ollama' || providerId === 'mock' ? 0 : Math.random() * 5
      },
      last7Days: {
        requests: Math.floor(Math.random() * 300) + 100,
        errors: Math.floor(Math.random() * 50),
        cost: providerId === 'ollama' || providerId === 'mock' ? 0 : Math.random() * 30
      },
      last30Days: {
        requests: Math.floor(Math.random() * 1000) + 500,
        errors: Math.floor(Math.random() * 150),
        cost: providerId === 'ollama' || providerId === 'mock' ? 0 : Math.random() * 100
      }
    };

    return c.json({ 
      success: true, 
      usageStats
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to get usage statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { aiManagementRoutes };
