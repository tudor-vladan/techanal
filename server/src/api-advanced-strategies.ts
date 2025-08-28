import { Hono } from 'hono';
import { advancedStrategiesEngine, StrategyExecutionRequest, StrategyOptimizationRequest } from './lib/advanced-strategies';

const strategiesRoutes = new Hono();

// List available strategies
strategiesRoutes.get('/list', async (c) => {
  try {
    const strategies = advancedStrategiesEngine.listStrategies();
    return c.json({ success: true, data: strategies });
  } catch (error) {
    console.error('Error listing strategies:', error);
    return c.json({ success: false, error: 'Failed to list strategies' }, 500);
  }
});

// Run a strategy
strategiesRoutes.post('/run', async (c) => {
  try {
    const body = await c.req.json<StrategyExecutionRequest>();
    if (!body?.strategyId || !body?.asset || !body?.timeframe || !body?.startDate || !body?.endDate) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    const result = await advancedStrategiesEngine.runStrategy(body);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error running strategy:', error);
    return c.json({ success: false, error: 'Failed to run strategy' }, 500);
  }
});

// Optimize a strategy
strategiesRoutes.post('/optimize', async (c) => {
  try {
    const body = await c.req.json<StrategyOptimizationRequest>();
    if (!body?.strategyId || !body?.asset || !body?.timeframe || !body?.startDate || !body?.endDate || !body?.objective) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    const result = await advancedStrategiesEngine.optimizeStrategy(body);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error optimizing strategy:', error);
    return c.json({ success: false, error: 'Failed to optimize strategy' }, 500);
  }
});

// Health
strategiesRoutes.get('/health', (c) => c.json({ success: true, status: 'healthy' }));

export { strategiesRoutes };
