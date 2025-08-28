import { Hono } from 'hono';
import { authMiddleware } from './middleware/auth';
import { modelFineTuningEngine, FineTuningConfig, ModelVersion } from './lib/model-fine-tuning';

const modelManagementRoutes = new Hono();

// Model Management Endpoints
modelManagementRoutes.use('*', authMiddleware);

// Get all model versions
modelManagementRoutes.get('/models/:modelName/versions', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    const versions = await modelFineTuningEngine.getModelVersions(modelName);
    
    return c.json({ 
      success: true, 
      modelName,
      versions,
      count: versions.length
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch model versions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get model performance metrics
modelManagementRoutes.get('/models/:modelName/metrics', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    const metrics = await modelFineTuningEngine.getPerformanceMetrics(modelName);
    
    return c.json({ 
      success: true, 
      modelName,
      metrics
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch model metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Start fine-tuning process
modelManagementRoutes.post('/models/:modelName/fine-tune', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    const config = await c.req.json() as FineTuningConfig;
    
    if (!modelName || !config) {
      return c.json({ success: false, error: 'Model name and configuration are required' }, 400);
    }

    // Validate configuration
    if (!config.epochs || !config.learningRate || !config.batchSize) {
      return c.json({ 
        success: false, 
        error: 'Invalid configuration: epochs, learningRate, and batchSize are required' 
      }, 400);
    }

    // Set model name from URL
    config.modelName = modelName;
    
    const trainingId = await modelFineTuningEngine.startFineTuning(config);
    
    return c.json({ 
      success: true, 
      message: 'Fine-tuning started successfully',
      trainingId,
      modelName,
      config
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to start fine-tuning',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get fine-tuning status
modelManagementRoutes.get('/models/:modelName/fine-tune/status', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    const status = modelFineTuningEngine.getTrainingStatus();
    
    return c.json({ 
      success: true, 
      modelName,
      status
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to get fine-tuning status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Stop fine-tuning process
modelManagementRoutes.post('/models/:modelName/fine-tune/stop', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    await modelFineTuningEngine.stopTraining();
    
    return c.json({ 
      success: true, 
      message: 'Fine-tuning stopped successfully',
      modelName
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to stop fine-tuning',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Activate model version
modelManagementRoutes.post('/models/:modelName/versions/:version/activate', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    const version = c.req.param('version');
    
    if (!modelName || !version) {
      return c.json({ success: false, error: 'Model name and version are required' }, 400);
    }

    await modelFineTuningEngine.activateModelVersion(modelName, version);
    
    return c.json({ 
      success: true, 
      message: 'Model version activated successfully',
      modelName,
      version
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to activate model version',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Detect model drift
modelManagementRoutes.get('/models/:modelName/drift', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    const driftInfo = await modelFineTuningEngine.detectModelDrift(modelName);
    
    return c.json({ 
      success: true, 
      modelName,
      driftInfo
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to detect model drift',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get recommended fine-tuning configuration
modelManagementRoutes.get('/models/:modelName/recommended-config', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    const currentPerformance = parseFloat(c.req.query('performance') || '0.85');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    const config = modelFineTuningEngine.getRecommendedConfig(modelName, currentPerformance);
    
    return c.json({ 
      success: true, 
      modelName,
      currentPerformance,
      recommendedConfig: config
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to get recommended configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get all available models
modelManagementRoutes.get('/models', async (c) => {
  try {
    // În production, aici ar fi query-ul din database
    const models = [
      {
        name: 'llama3.1:8b',
        type: 'base-model',
        status: 'active',
        currentVersion: 'v1.1.0',
        accuracy: 0.87,
        responseTime: 380,
        lastTraining: '2025-02-01',
        trainingDataSize: 7500
      },
      {
        name: 'chart-pattern-recognition',
        type: 'specialized',
        status: 'active',
        currentVersion: 'v2.0.0',
        accuracy: 0.89,
        responseTime: 250,
        lastTraining: '2025-02-15',
        trainingDataSize: 12000
      },
      {
        name: 'technical-indicators',
        type: 'specialized',
        status: 'active',
        currentVersion: 'v1.5.0',
        accuracy: 0.91,
        responseTime: 200,
        lastTraining: '2025-02-10',
        trainingDataSize: 8000
      },
      {
        name: 'risk-assessment',
        type: 'specialized',
        status: 'training',
        currentVersion: 'v1.2.0',
        accuracy: 0.84,
        responseTime: 320,
        lastTraining: '2025-02-20',
        trainingDataSize: 6000
      }
    ];
    
    return c.json({ 
      success: true, 
      models,
      count: models.length
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch models',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get model training history
modelManagementRoutes.get('/models/:modelName/training-history', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    // În production, aici ar fi query-ul din database
    const trainingHistory = [
      {
        id: 'training-1',
        startDate: '2025-01-15T10:00:00Z',
        endDate: '2025-01-15T16:00:00Z',
        duration: '6h 0m',
        epochs: 50,
        finalAccuracy: 0.82,
        finalLoss: 0.15,
        status: 'completed',
        dataSize: 5000
      },
      {
        id: 'training-2',
        startDate: '2025-02-01T09:00:00Z',
        endDate: '2025-02-01T18:00:00Z',
        duration: '9h 0m',
        epochs: 75,
        finalAccuracy: 0.87,
        finalLoss: 0.12,
        status: 'completed',
        dataSize: 7500
      },
      {
        id: 'training-3',
        startDate: '2025-02-20T08:00:00Z',
        endDate: null,
        duration: null,
        epochs: 0,
        finalAccuracy: null,
        finalLoss: null,
        status: 'training',
        dataSize: 6000
      }
    ];
    
    return c.json({ 
      success: true, 
      modelName,
      trainingHistory,
      count: trainingHistory.length
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch training history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get model performance comparison
modelManagementRoutes.get('/models/:modelName/comparison', async (c) => {
  try {
    const modelName = c.req.param('modelName');
    
    if (!modelName) {
      return c.json({ success: false, error: 'Model name is required' }, 400);
    }

    const versions = await modelFineTuningEngine.getModelVersions(modelName);
    
    // Group metrics by version for comparison
    const comparison = {
      modelName,
      versions: versions.map(v => ({
        version: v.version,
        accuracy: v.accuracy,
        responseTime: v.responseTime,
        patternRecognition: v.performanceMetrics.patternRecognition,
        signalAccuracy: v.performanceMetrics.signalAccuracy,
        riskAssessment: v.performanceMetrics.riskAssessment,
        trainingDate: v.trainingDate,
        status: v.status
      }))
    };
    
    return c.json({ 
      success: true, 
      comparison
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to fetch model comparison',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Health check for model management system
modelManagementRoutes.get('/health', async (c) => {
  try {
    const status = modelFineTuningEngine.getTrainingStatus();
    
    return c.json({ 
      success: true, 
      status: 'healthy',
      modelManagement: {
        isTraining: status.isTraining,
        currentJob: status.currentJob ? {
          id: status.currentJob.id,
          modelName: status.currentJob.config.modelName,
          progress: status.currentJob.progress
        } : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      status: 'unhealthy',
      error: 'Model management system health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { modelManagementRoutes };
