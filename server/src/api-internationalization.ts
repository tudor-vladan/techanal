import { Hono } from 'hono';
import { i18n } from './lib/internationalization';

const internationalizationRoutes = new Hono();

// Get supported languages
internationalizationRoutes.get('/languages', async (c) => {
  try {
    const languages = await i18n.getSupportedLanguages();
    
    return c.json({
      success: true,
      data: languages,
      message: `Retrieved ${languages.length} supported languages`
    });
  } catch (error) {
    console.error('Error retrieving supported languages:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve supported languages' 
    }, 500);
  }
});

// Get default language
internationalizationRoutes.get('/languages/default', async (c) => {
  try {
    const defaultLanguage = await i18n.getDefaultLanguage();
    
    return c.json({
      success: true,
      data: defaultLanguage,
      message: 'Default language retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving default language:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve default language' 
    }, 500);
  }
});

// Get translations for a specific language
internationalizationRoutes.get('/translations/:language', async (c) => {
  try {
    const language = c.req.param('language');
    const category = c.req.query('category');
    
    const translations = await i18n.getTranslations(language, category);
    
    return c.json({
      success: true,
      data: {
        language,
        category: category || 'all',
        translations,
        totalKeys: Object.keys(translations).length
      },
      message: `Translations retrieved for ${language}${category ? ` (${category})` : ''}`
    });
  } catch (error) {
    console.error('Error retrieving translations:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve translations' 
    }, 500);
  }
});

// Get translations by category
internationalizationRoutes.get('/translations/:language/category/:category', async (c) => {
  try {
    const language = c.req.param('language');
    const category = c.req.param('category');
    
    const translations = await i18n.getTranslations(language, category);
    
    return c.json({
      success: true,
      data: {
        language,
        category,
        translations,
        totalKeys: Object.keys(translations).length
      },
      message: `Category translations retrieved for ${language} - ${category}`
    });
  } catch (error) {
    console.error('Error retrieving category translations:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve category translations' 
    }, 500);
  }
});

// Get supported currencies
internationalizationRoutes.get('/currencies', async (c) => {
  try {
    const currencies = await i18n.getSupportedCurrencies();
    
    return c.json({
      success: true,
      data: currencies,
      message: `Retrieved ${currencies.length} supported currencies`
    });
  } catch (error) {
    console.error('Error retrieving supported currencies:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve supported currencies' 
    }, 500);
  }
});

// Get supported timezones
internationalizationRoutes.get('/timezones', async (c) => {
  try {
    const timezones = await i18n.getSupportedTimezones();
    
    return c.json({
      success: true,
      data: timezones,
      message: `Retrieved ${timezones.length} supported timezones`
    });
  } catch (error) {
    console.error('Error retrieving supported timezones:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve supported timezones' 
    }, 500);
  }
});

// Format number
internationalizationRoutes.post('/format/number', async (c) => {
  try {
    const body = await c.req.json();
    const { value, language, currency } = body;
    
    if (typeof value !== 'number' || !language) {
      return c.json({ 
        success: false, 
        error: 'Value and language are required' 
      }, 400);
    }
    
    const formatted = i18n.formatNumber(value, language, currency);
    
    return c.json({
      success: true,
      data: {
        original: value,
        formatted,
        language,
        currency: currency || null
      },
      message: 'Number formatted successfully'
    });
  } catch (error) {
    console.error('Error formatting number:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to format number' 
    }, 500);
  }
});

// Format date
internationalizationRoutes.post('/format/date', async (c) => {
  try {
    const body = await c.req.json();
    const { date, language, format } = body;
    
    if (!date || !language) {
      return c.json({ 
        success: false, 
        error: 'Date and language are required' 
      }, 400);
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return c.json({ 
        success: false, 
        error: 'Invalid date format' 
      }, 400);
    }
    
    const formatted = i18n.formatDate(dateObj, language, format);
    
    return c.json({
      success: true,
      data: {
        original: date,
        formatted,
        language,
        format: format || 'default'
      },
      message: 'Date formatted successfully'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to format date' 
    }, 500);
  }
});

// Format currency
internationalizationRoutes.post('/format/currency', async (c) => {
  try {
    const body = await c.req.json();
    const { value, language, currency } = body;
    
    if (typeof value !== 'number' || !language || !currency) {
      return c.json({ 
        success: false, 
        error: 'Value, language, and currency are required' 
      }, 400);
    }
    
    const formatted = i18n.formatCurrency(value, language, currency);
    
    return c.json({
      success: true,
      data: {
        original: value,
        formatted,
        language,
        currency
      },
      message: 'Currency formatted successfully'
    });
  } catch (error) {
    console.error('Error formatting currency:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to format currency' 
    }, 500);
  }
});

// Clear cache
internationalizationRoutes.post('/cache/clear', async (c) => {
  try {
    i18n.clearCache();
    
    return c.json({
      success: true,
      message: 'Internationalization cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to clear cache' 
    }, 500);
  }
});

// Refresh translations for a specific language
internationalizationRoutes.post('/translations/:language/refresh', async (c) => {
  try {
    const language = c.req.param('language');
    
    await i18n.refreshTranslations(language);
    
    return c.json({
      success: true,
      message: `Translations refreshed for ${language}`
    });
  } catch (error) {
    console.error('Error refreshing translations:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to refresh translations' 
    }, 500);
  }
});

// Get language configuration
internationalizationRoutes.get('/languages/:code/config', async (c) => {
  try {
    const code = c.req.param('code');
    const languages = await i18n.getSupportedLanguages();
    const language = languages.find(lang => lang.code === code);
    
    if (!language) {
      return c.json({ 
        success: false, 
        error: 'Language not found' 
      }, 404);
    }
    
    return c.json({
      success: true,
      data: language,
      message: `Language configuration retrieved for ${code}`
    });
  } catch (error) {
    console.error('Error retrieving language configuration:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to retrieve language configuration' 
    }, 500);
  }
});

// Health check endpoint
internationalizationRoutes.get('/health', async (c) => {
  try {
    // Test basic functionality
    const languages = await i18n.getSupportedLanguages();
    const defaultLang = await i18n.getDefaultLanguage();
    const translations = await i18n.getTranslations('en', 'common');
    
    return c.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      data: {
        system: 'Internationalization System',
        version: '1.0.0',
        supportedLanguages: languages.length,
        defaultLanguage: defaultLang.code,
        sampleTranslations: Object.keys(translations).length,
        cacheStatus: 'operational'
      }
    });
  } catch (error) {
    console.error('Internationalization health check failed:', error);
    return c.json({ 
      success: false, 
      status: 'unhealthy',
      error: 'Health check failed' 
    }, 500);
  }
});

export { internationalizationRoutes };
