import { Hono } from 'hono';
import { businessIntelligence } from './lib/business-intelligence';
import { authMiddleware } from './middleware/auth';






import { promises as fsp } from 'fs';
import { join, basename, extname } from 'path';

const businessIntelligenceRoutes = new Hono();

// Protect all Business Intelligence routes (require auth)
businessIntelligenceRoutes.use('*', authMiddleware);

// Generate comprehensive business intelligence report
businessIntelligenceRoutes.get('/report/:period', async (c) => {
  try {
    const period = c.req.param('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly';
    
    if (!['daily', 'weekly', 'monthly', 'quarterly'].includes(period)) {
      return c.json({ 
        success: false, 
        error: 'Invalid period. Must be daily, weekly, monthly, or quarterly' 
      }, 400);
    }

    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: report,
      message: `Business intelligence report generated for ${period} period`
    });
  } catch (error) {
    console.error('Error generating business intelligence report:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to generate business intelligence report' 
    }, 500);
  }
});

// Get report history
businessIntelligenceRoutes.get('/reports', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const reports = await businessIntelligence.getReportHistory(limit);
    
    return c.json({
      success: true,
      data: reports,
      message: `Retrieved ${reports.length} business intelligence reports`
    });
  } catch (error) {
    console.error('Error retrieving report history:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve report history' 
    }, 500);
  }
});

// Export report in different formats
businessIntelligenceRoutes.post('/export', async (c) => {
  try {
    const body = await c.req.json();
    const { period, format } = body;
    
    if (!period || !format) {
      return c.json({ 
        success: false, 
        error: 'Period and format are required' 
      }, 400);
    }
    
    if (!['daily', 'weekly', 'monthly', 'quarterly'].includes(period)) {
      return c.json({ 
        success: false, 
        error: 'Invalid period' 
      }, 400);
    }
    
    if (!['json', 'csv', 'pdf'].includes(format)) {
      return c.json({ 
        success: false, 
        error: 'Invalid format. Must be json, csv, or pdf' 
      }, 400);
    }

    const report = await businessIntelligence.generateComprehensiveReport(period);
    const filename = await businessIntelligence.exportReport(report, format);
    
    return c.json({
      success: true,
      data: {
        filename,
        format,
        period,
        downloadUrl: `/api/business-intelligence/download/${filename}`,
        report: report
      },
      message: `Report exported successfully in ${format} format`
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to export report' 
    }, 500);
  }
});

// Download exported report file
businessIntelligenceRoutes.get('/download/:filename', async (c) => {
  try {
    const requested = c.req.param('filename');
    const safeName = basename(requested);
    const exportDir = process.env.REPORTS_DIR || 'processed';
    const filePath = join(process.cwd(), exportDir, safeName);

    await fsp.access(filePath);
    const fileBuf = await fsp.readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType =
      ext === '.json' ? 'application/json' :
      ext === '.csv' ? 'text/csv' :
      ext === '.pdf' ? 'application/pdf' :
      'application/octet-stream';

    return new Response(fileBuf, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"`
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'File not found' }, 404);
  }
});

// Get specific business metrics
businessIntelligenceRoutes.get('/metrics/business', async (c) => {
  try {
    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'monthly';
    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: report.businessMetrics,
      message: 'Business metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving business metrics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve business metrics' 
    }, 500);
  }
});

// Get trading performance metrics
businessIntelligenceRoutes.get('/metrics/trading', async (c) => {
  try {
    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'monthly';
    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: report.tradingPerformance,
      message: 'Trading performance metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving trading performance metrics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve trading performance metrics' 
    }, 500);
  }
});

// Get market insights
businessIntelligenceRoutes.get('/insights/market', async (c) => {
  try {
    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'monthly';
    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: report.marketInsights,
      message: 'Market insights retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving market insights:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve market insights' 
    }, 500);
  }
});

// Get user behavior insights
businessIntelligenceRoutes.get('/insights/user-behavior', async (c) => {
  try {
    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'monthly';
    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: report.userBehavior,
      message: 'User behavior insights retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving user behavior insights:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve user behavior insights' 
    }, 500);
  }
});

// Get operational metrics
businessIntelligenceRoutes.get('/metrics/operational', async (c) => {
  try {
    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'monthly';
    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: report.operationalMetrics,
      message: 'Operational metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving operational metrics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve operational metrics' 
    }, 500);
  }
});

// Get recommendations
businessIntelligenceRoutes.get('/recommendations', async (c) => {
  try {
    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' || 'monthly';
    const report = await businessIntelligence.generateComprehensiveReport(period);
    
    return c.json({
      success: true,
      data: {
        recommendations: report.recommendations,
        riskFactors: report.riskFactors,
        opportunities: report.opportunities
      },
      message: 'Business recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving recommendations:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve recommendations' 
    }, 500);
  }
});

// Clear cache
businessIntelligenceRoutes.post('/cache/clear', async (c) => {
  try {
    businessIntelligence.clearCache();
    
    return c.json({
      success: true,
      message: 'Business intelligence cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to clear cache' 
    }, 500);
  }
});

// Health check endpoint
businessIntelligenceRoutes.get('/health', async (c) => {
  try {
    // Test basic functionality
    const testReport = await businessIntelligence.generateComprehensiveReport('daily');
    
    return c.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      data: {
        system: 'Business Intelligence System',
        version: '1.0.0',
        lastReportGenerated: testReport.timestamp,
        cacheStatus: 'operational'
      }
    });
  } catch (error) {
    console.error('Business intelligence health check failed:', error);
    return c.json({ 
      success: false, 
      status: 'unhealthy',
      error: 'Health check failed' 
    }, 500);
  }
});

export { businessIntelligenceRoutes };
