import { getDatabase } from './db';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  isDefault: boolean;
  isActive: boolean;
}

export interface Translation {
  key: string;
  language: string;
  value: string;
  context?: string;
  category: 'ui' | 'trading' | 'analysis' | 'system' | 'errors';
  lastUpdated: Date;
}

export interface LocalizedContent {
  language: string;
  content: Record<string, string>;
  metadata: {
    lastSync: Date;
    version: string;
    totalKeys: number;
  };
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  isDefault: boolean;
}

export interface TimezoneConfig {
  name: string;
  offset: string;
  description: string;
  isDefault: boolean;
}

export class InternationalizationSystem {
  private db: any = null;
  private translationsCache: Map<string, LocalizedContent> = new Map();
  private readonly CACHE_TTL = 1800000; // 30 minutes

  constructor() {
    // Don't call initializeDatabase in constructor
    // It will be called when needed
  }

  private async initializeDatabase() {
    this.db = await getDatabase();
  }

  // Language Management
  async getSupportedLanguages(): Promise<LanguageConfig[]> {
    return [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '$'
        },
        isDefault: true,
        isActive: true
      },
      {
        code: 'ro',
        name: 'Romanian',
        nativeName: 'Română',
        flag: '🇷🇴',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          currency: 'RON'
        },
        isDefault: false,
        isActive: true
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          currency: '€'
        },
        isDefault: false,
        isActive: true
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: {
          decimal: ',',
          thousands: ' ',
          currency: '€'
        },
        isDefault: false,
        isActive: true
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        direction: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          currency: '€'
        },
        isDefault: false,
        isActive: true
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        direction: 'rtl',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          currency: 'SAR'
        },
        isDefault: false,
        isActive: true
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '¥'
        },
        isDefault: false,
        isActive: true
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        direction: 'ltr',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          currency: '¥'
        },
        isDefault: false,
        isActive: true
      }
    ];
  }

  async getDefaultLanguage(): Promise<LanguageConfig> {
    const languages = await this.getSupportedLanguages();
    return languages.find(lang => lang.isDefault) || languages[0];
  }

  // Translation Management
  async getTranslations(language: string, category?: string): Promise<Record<string, string>> {
    const cacheKey = `${language}_${category || 'all'}`;
    const cached = this.translationsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.metadata.lastSync.getTime() < this.CACHE_TTL) {
      return cached.content;
    }

    // Simulate translations - in production this would come from database
    const translations = await this.generateTranslations(language, category);
    
    const localizedContent: LocalizedContent = {
      language,
      content: translations,
      metadata: {
        lastSync: new Date(),
        version: '1.0.0',
        totalKeys: Object.keys(translations).length
      }
    };

    this.translationsCache.set(cacheKey, localizedContent);
    return translations;
  }

  private async generateTranslations(language: string, category?: string): Promise<Record<string, string>> {
    const baseTranslations: Record<string, Record<string, string>> = {
      en: {
        // UI
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.sort': 'Sort',
        'common.refresh': 'Refresh',
        'common.export': 'Export',
        'common.import': 'Import',
        'common.download': 'Download',
        'common.upload': 'Upload',
        
        // Trading
        'trading.buy': 'Buy',
        'trading.sell': 'Sell',
        'trading.hold': 'Hold',
        'trading.long': 'Long',
        'trading.short': 'Short',
        'trading.entry': 'Entry',
        'trading.exit': 'Exit',
        'trading.stopLoss': 'Stop Loss',
        'trading.takeProfit': 'Take Profit',
        'trading.position': 'Position',
        'trading.volume': 'Volume',
        'trading.price': 'Price',
        'trading.timeframe': 'Timeframe',
        'trading.asset': 'Asset',
        'trading.strategy': 'Strategy',
        
        // Analysis
        'analysis.pattern': 'Pattern',
        'analysis.trend': 'Trend',
        'analysis.support': 'Support',
        'analysis.resistance': 'Resistance',
        'analysis.breakout': 'Breakout',
        'analysis.breakdown': 'Breakdown',
        'analysis.consolidation': 'Consolidation',
        'analysis.volatility': 'Volatility',
        'analysis.momentum': 'Momentum',
        'analysis.oscillator': 'Oscillator',
        'analysis.indicator': 'Indicator',
        'analysis.signal': 'Signal',
        'analysis.confidence': 'Confidence',
        'analysis.accuracy': 'Accuracy',
        
        // System
        'system.dashboard': 'Dashboard',
        'system.settings': 'Settings',
        'system.profile': 'Profile',
        'system.logout': 'Logout',
        'system.login': 'Login',
        'system.register': 'Register',
        'system.notifications': 'Notifications',
        'system.help': 'Help',
        'system.about': 'About',
        'system.contact': 'Contact',
        'system.support': 'Support',
        
        // Errors
        'error.general': 'An error occurred',
        'error.network': 'Network error',
        'error.validation': 'Validation error',
        'error.notFound': 'Not found',
        'error.unauthorized': 'Unauthorized',
        'error.forbidden': 'Forbidden',
        'error.server': 'Server error',
        'error.timeout': 'Request timeout'
      },
      ro: {
        // UI
        'common.loading': 'Se încarcă...',
        'common.save': 'Salvează',
        'common.cancel': 'Anulează',
        'common.delete': 'Șterge',
        'common.edit': 'Editează',
        'common.view': 'Vizualizează',
        'common.search': 'Caută',
        'common.filter': 'Filtrează',
        'common.sort': 'Sortează',
        'common.refresh': 'Reîmprospătează',
        'common.export': 'Exportă',
        'common.import': 'Importă',
        'common.download': 'Descarcă',
        'common.upload': 'Încarcă',
        
        // Trading
        'trading.buy': 'Cumpără',
        'trading.sell': 'Vinde',
        'trading.hold': 'Ține',
        'trading.long': 'Long',
        'trading.short': 'Short',
        'trading.entry': 'Intrare',
        'trading.exit': 'Ieșire',
        'trading.stopLoss': 'Stop Loss',
        'trading.takeProfit': 'Take Profit',
        'trading.position': 'Poziție',
        'trading.volume': 'Volum',
        'trading.price': 'Preț',
        'trading.timeframe': 'Timeframe',
        'trading.asset': 'Activ',
        'trading.strategy': 'Strategie',
        
        // Analysis
        'analysis.pattern': 'Pattern',
        'analysis.trend': 'Trend',
        'analysis.support': 'Suport',
        'analysis.resistance': 'Rezistență',
        'analysis.breakout': 'Breakout',
        'analysis.breakdown': 'Breakdown',
        'analysis.consolidation': 'Consolidare',
        'analysis.volatility': 'Volatilitate',
        'analysis.momentum': 'Momentum',
        'analysis.oscillator': 'Oscilator',
        'analysis.indicator': 'Indicator',
        'analysis.signal': 'Semnale',
        'analysis.confidence': 'Încredere',
        'analysis.accuracy': 'Acuratețe',
        
        // System
        'system.dashboard': 'Dashboard',
        'system.settings': 'Setări',
        'system.profile': 'Profil',
        'system.logout': 'Deconectare',
        'system.login': 'Conectare',
        'system.register': 'Înregistrare',
        'system.notifications': 'Notificări',
        'system.help': 'Ajutor',
        'system.about': 'Despre',
        'system.contact': 'Contact',
        'system.support': 'Suport',
        
        // Errors
        'error.general': 'A apărut o eroare',
        'error.network': 'Eroare de rețea',
        'error.validation': 'Eroare de validare',
        'error.notFound': 'Nu a fost găsit',
        'error.unauthorized': 'Neautorizat',
        'error.forbidden': 'Interzis',
        'error.server': 'Eroare de server',
        'error.timeout': 'Timeout cerere'
      },
      es: {
        // UI
        'common.loading': 'Cargando...',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.view': 'Ver',
        'common.search': 'Buscar',
        'common.filter': 'Filtrar',
        'common.sort': 'Ordenar',
        'common.refresh': 'Actualizar',
        'common.export': 'Exportar',
        'common.import': 'Importar',
        'common.download': 'Descargar',
        'common.upload': 'Subir',
        
        // Trading
        'trading.buy': 'Comprar',
        'trading.sell': 'Vender',
        'trading.hold': 'Mantener',
        'trading.long': 'Largo',
        'trading.short': 'Corto',
        'trading.entry': 'Entrada',
        'trading.exit': 'Salida',
        'trading.stopLoss': 'Stop Loss',
        'trading.takeProfit': 'Take Profit',
        'trading.position': 'Posición',
        'trading.volume': 'Volumen',
        'trading.price': 'Precio',
        'trading.timeframe': 'Marco temporal',
        'trading.asset': 'Activo',
        'trading.strategy': 'Estrategia',
        
        // Analysis
        'analysis.pattern': 'Patrón',
        'analysis.trend': 'Tendencia',
        'analysis.support': 'Soporte',
        'analysis.resistance': 'Resistencia',
        'analysis.breakout': 'Ruptura',
        'analysis.breakdown': 'Desglose',
        'analysis.consolidation': 'Consolidación',
        'analysis.volatility': 'Volatilidad',
        'analysis.momentum': 'Impulso',
        'analysis.oscillator': 'Oscilador',
        'analysis.indicator': 'Indicador',
        'analysis.signal': 'Señal',
        'analysis.confidence': 'Confianza',
        'analysis.accuracy': 'Precisión',
        
        // System
        'system.dashboard': 'Panel',
        'system.settings': 'Configuración',
        'system.profile': 'Perfil',
        'system.logout': 'Cerrar sesión',
        'system.login': 'Iniciar sesión',
        'system.register': 'Registrarse',
        'system.notifications': 'Notificaciones',
        'system.help': 'Ayuda',
        'system.about': 'Acerca de',
        'system.contact': 'Contacto',
        'system.support': 'Soporte',
        
        // Errors
        'error.general': 'Ocurrió un error',
        'error.network': 'Error de red',
        'error.validation': 'Error de validación',
        'error.notFound': 'No encontrado',
        'error.unauthorized': 'No autorizado',
        'error.forbidden': 'Prohibido',
        'error.server': 'Error del servidor',
        'error.timeout': 'Tiempo de espera agotado'
      }
    };

    const translations = baseTranslations[language] || baseTranslations.en;
    
    if (category) {
      const filtered: Record<string, string> = {};
      Object.keys(translations).forEach(key => {
        if (key.startsWith(category + '.')) {
          filtered[key] = translations[key];
        }
      });
      return filtered;
    }
    
    return translations;
  }

  // Currency Management
  async getSupportedCurrencies(): Promise<CurrencyConfig[]> {
    return [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        position: 'before',
        decimalPlaces: 2,
        isDefault: true
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        position: 'after',
        decimalPlaces: 2,
        isDefault: false
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        position: 'before',
        decimalPlaces: 2,
        isDefault: false
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        position: 'before',
        decimalPlaces: 0,
        isDefault: false
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        position: 'before',
        decimalPlaces: 2,
        isDefault: false
      },
      {
        code: 'RON',
        name: 'Romanian Leu',
        symbol: 'RON',
        position: 'after',
        decimalPlaces: 2,
        isDefault: false
      }
    ];
  }

  // Timezone Management
  async getSupportedTimezones(): Promise<TimezoneConfig[]> {
    return [
      {
        name: 'UTC',
        offset: '+00:00',
        description: 'Coordinated Universal Time',
        isDefault: true
      },
      {
        name: 'America/New_York',
        offset: '-05:00',
        description: 'Eastern Time',
        isDefault: false
      },
      {
        name: 'Europe/London',
        offset: '+00:00',
        description: 'British Time',
        isDefault: false
      },
      {
        name: 'Europe/Bucharest',
        offset: '+02:00',
        description: 'Romanian Time',
        isDefault: false
      },
      {
        name: 'Asia/Tokyo',
        offset: '+09:00',
        description: 'Japan Time',
        isDefault: false
      },
      {
        name: 'Asia/Shanghai',
        offset: '+08:00',
        description: 'China Time',
        isDefault: false
      }
    ];
  }

  // Formatting Functions
  formatNumber(value: number, language: string, currency?: string): string {
    const langConfig = this.getLanguageConfig(language);
    const currencyConfig = currency ? this.getCurrencyConfig(currency) : null;
    
    if (currencyConfig) {
      const formatted = new Intl.NumberFormat(language, {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: currencyConfig.decimalPlaces,
        maximumFractionDigits: currencyConfig.decimalPlaces
      }).format(value);
      
      return formatted;
    }
    
    return new Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(date: Date, language: string, format?: string): string {
    const langConfig = this.getLanguageConfig(language);
    
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatCurrency(value: number, language: string, currency: string): string {
    return this.formatNumber(value, language, currency);
  }

  // Utility Functions
  private getLanguageConfig(language: string): LanguageConfig {
    const languages = this.getSupportedLanguages() as unknown as LanguageConfig[];
    return languages.find((lang) => lang.code === language) || languages[0];
  }

  private getCurrencyConfig(currency: string): CurrencyConfig {
    const currencies = this.getSupportedCurrencies() as unknown as CurrencyConfig[];
    return currencies.find((curr) => curr.code === currency) || currencies[0];
  }

  // Cache Management
  clearCache(): void {
    this.translationsCache.clear();
  }

  async refreshTranslations(language: string): Promise<void> {
    const cacheKeys = Array.from(this.translationsCache.keys());
    const keysToRemove = cacheKeys.filter(key => key.startsWith(language));
    keysToRemove.forEach(key => this.translationsCache.delete(key));
  }
}

export const i18n = new InternationalizationSystem();
