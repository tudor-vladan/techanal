import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Languages, 
  DollarSign, 
  Clock, 
  Settings, 
  RefreshCw,
  Download,
  Upload,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';

interface LanguageConfig {
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

interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  isDefault: boolean;
}

interface TimezoneConfig {
  name: string;
  offset: string;
  description: string;
  isDefault: boolean;
}

interface Translation {
  key: string;
  language: string;
  value: string;
  context?: string;
  category: 'ui' | 'trading' | 'analysis' | 'system' | 'errors';
  lastUpdated: Date;
}

interface LanguageSettingsProps {
  className?: string;
}

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  className = ''
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC');
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([]);
  const [timezones, setTimezones] = useState<TimezoneConfig[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('languages');
  const [rtlSupport, setRtlSupport] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      loadTranslations(selectedLanguage);
    }
  }, [selectedLanguage]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [languagesRes, currenciesRes, timezonesRes] = await Promise.all([
        fetch('/api/i18n/languages'),
        fetch('/api/i18n/currencies'),
        fetch('/api/i18n/timezones')
      ]);

      if (languagesRes.ok) {
        const languagesData = await languagesRes.json();
        setLanguages(languagesData.data);
        if (languagesData.data.length > 0) {
          const defaultLang = languagesData.data.find((lang: LanguageConfig) => lang.isDefault);
          setSelectedLanguage(defaultLang?.code || 'en');
          setRtlSupport(defaultLang?.direction === 'rtl');
        }
      }

      if (currenciesRes.ok) {
        const currenciesData = await currenciesRes.json();
        setCurrencies(currenciesData.data);
        if (currenciesData.data.length > 0) {
          const defaultCurrency = currenciesData.data.find((curr: CurrencyConfig) => curr.isDefault);
          setSelectedCurrency(defaultCurrency?.code || 'USD');
        }
      }

      if (timezonesRes.ok) {
        const timezonesData = await timezonesRes.json();
        setTimezones(timezonesData.data);
        if (timezonesData.data.length > 0) {
          const defaultTimezone = timezonesData.data.find((tz: TimezoneConfig) => tz.isDefault);
          setSelectedTimezone(defaultTimezone?.name || 'UTC');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslations = async (language: string) => {
    try {
      const response = await fetch(`/api/i18n/translations/${language}`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data.data.translations);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      setRtlSupport(language.direction === 'rtl');
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
  };

  const handleTimezoneChange = (timezoneName: string) => {
    setSelectedTimezone(timezoneName);
  };

  const refreshTranslations = async () => {
    try {
      const response = await fetch(`/api/i18n/translations/${selectedLanguage}/refresh`, {
        method: 'POST'
      });
      if (response.ok) {
        await loadTranslations(selectedLanguage);
      }
    } catch (error) {
      console.error('Error refreshing translations:', error);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/i18n/cache/clear', {
        method: 'POST'
      });
      if (response.ok) {
        await loadTranslations(selectedLanguage);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const exportTranslations = async (format: 'json' | 'csv') => {
    try {
      const data = {
        language: selectedLanguage,
        translations,
        exportDate: new Date().toISOString()
      };
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translations_${selectedLanguage}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting translations:', error);
    }
  };

  const getCurrentLanguage = () => languages.find(lang => lang.code === selectedLanguage);
  const getCurrentCurrency = () => currencies.find(curr => curr.code === selectedCurrency);
  const getCurrentTimezone = () => timezones.find(tz => tz.name === selectedTimezone);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Language & Regional Settings</h2>
          <p className="text-gray-600">Configure language, currency, and timezone preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={refreshTranslations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearCache} variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Badge variant="outline" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Multi-Language
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="timezones">Timezones</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
        </TabsList>

        {/* Languages Tab */}
        <TabsContent value="languages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Language Selection
                </CardTitle>
                <CardDescription>Choose your preferred language for the interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Primary Language</label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          <div className="flex items-center gap-2">
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                            <span className="text-gray-500">({language.nativeName})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getCurrentLanguage() && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-medium">Language Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Direction:</span>
                        <div className="font-medium capitalize">{getCurrentLanguage()?.direction}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date Format:</span>
                        <div className="font-medium">{getCurrentLanguage()?.dateFormat}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Decimal Separator:</span>
                        <div className="font-medium">{getCurrentLanguage()?.numberFormat.decimal}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Thousands Separator:</span>
                        <div className="font-medium">{getCurrentLanguage()?.numberFormat.thousands}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-detect Language</label>
                    <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">RTL Support</label>
                    <Switch checked={rtlSupport} onCheckedChange={setRtlSupport} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Language Statistics
                </CardTitle>
                <CardDescription>Overview of language support and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{languages.length}</div>
                    <div className="text-sm text-gray-600">Supported Languages</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {languages.filter(lang => lang.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Languages</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Language Categories</h4>
                  <div className="space-y-2">
                    {['ui', 'trading', 'analysis', 'system', 'errors'].map((category) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm capitalize">{category}</span>
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(translations).filter(key => key.startsWith(category + '.')).length} keys
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Currencies Tab */}
        <TabsContent value="currencies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Currency Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Currency Selection
                </CardTitle>
                <CardDescription>Choose your preferred currency for financial displays</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Primary Currency</label>
                  <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{currency.symbol}</span>
                            <span>{currency.name}</span>
                            <span className="text-gray-500">({currency.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getCurrentCurrency() && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-medium">Currency Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Symbol:</span>
                        <div className="font-medium">{getCurrentCurrency()?.symbol}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Position:</span>
                        <div className="font-medium capitalize">{getCurrentCurrency()?.position}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Decimal Places:</span>
                        <div className="font-medium">{getCurrentCurrency()?.decimalPlaces}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Default:</span>
                        <div className="font-medium">
                          {getCurrentCurrency()?.isDefault ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Currency Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Currency Preview
                </CardTitle>
                <CardDescription>See how numbers and currencies will be displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Sample Formatting</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Small Amount:</span>
                      <span className="font-medium">
                        {getCurrentCurrency()?.symbol}1.99
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Amount:</span>
                      <span className="font-medium">
                        {getCurrentCurrency()?.symbol}1,234.56
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Large Amount:</span>
                      <span className="font-medium">
                        {getCurrentCurrency()?.symbol}1,234,567.89
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Currency Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{currencies.length}</div>
                      <div className="text-xs text-gray-600">Supported</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {currencies.filter(curr => curr.isDefault).length}
                      </div>
                      <div className="text-xs text-gray-600">Default</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timezones Tab */}
        <TabsContent value="timezones" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timezone Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timezone Selection
                </CardTitle>
                <CardDescription>Choose your preferred timezone for date and time displays</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Primary Timezone</label>
                  <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.name} value={timezone.name}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{timezone.offset}</span>
                            <span>{timezone.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getCurrentTimezone() && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-medium">Timezone Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{getCurrentTimezone()?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Offset:</span>
                        <span className="font-medium">{getCurrentTimezone()?.offset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Description:</span>
                        <span className="font-medium">{getCurrentTimezone()?.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Default:</span>
                        <div className="font-medium">
                          {getCurrentTimezone()?.isDefault ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timezone Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Timezone Preview
                </CardTitle>
                <CardDescription>See how dates and times will be displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Time</h4>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {new Date().toLocaleString('en-US', {
                        timeZone: getCurrentTimezone()?.name || 'UTC',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {getCurrentTimezone()?.name} ({getCurrentTimezone()?.offset})
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Timezone Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{timezones.length}</div>
                      <div className="text-xs text-gray-600">Supported</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {timezones.filter(tz => tz.isDefault).length}
                      </div>
                      <div className="text-xs text-gray-600">Default</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Translation Management
              </CardTitle>
              <CardDescription>View and manage translations for the selected language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCurrentLanguage()?.flag}</span>
                  <div>
                    <div className="font-medium">{getCurrentLanguage()?.name}</div>
                    <div className="text-sm text-gray-600">{getCurrentLanguage()?.nativeName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => exportTranslations('json')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Badge variant="outline">
                    {Object.keys(translations).length} translations
                  </Badge>
                </div>
              </div>

              {/* Translation Categories */}
              <div className="space-y-4">
                <h4 className="font-medium">Translation Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['ui', 'trading', 'analysis', 'system', 'errors'].map((category) => {
                    const categoryKeys = Object.keys(translations).filter(key => key.startsWith(category + '.'));
                    return (
                      <Card key={category} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium capitalize">{category}</h5>
                          <Badge variant="outline" className="text-xs">
                            {categoryKeys.length} keys
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {categoryKeys.slice(0, 3).map((key) => (
                            <div key={key} className="text-sm">
                              <div className="font-medium">{key}</div>
                              <div className="text-gray-600">{translations[key]}</div>
                            </div>
                          ))}
                          {categoryKeys.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{categoryKeys.length - 3} more translations
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
