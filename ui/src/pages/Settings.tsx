import { useState } from 'react';
import { api } from '@/lib/serverComm';
import { setStoredAIPreferences } from '@/lib/preferences';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Monitor,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Brain,
  Target,
  BarChart3,
  Download,
  Upload,
  Trash2,
  HelpCircle
} from 'lucide-react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    tradingAlerts: boolean;
    aiInsights: boolean;
    systemUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  trading: {
    autoAnalysis: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    maxDrawdown: number;
    positionSizing: 'conservative' | 'moderate' | 'aggressive';
  };
}

interface AIPreferences {
  model: string;
  temperature: number;
  maxTokens: number;
  features: {
    autoAnalysis: boolean;
    tradingRecommendations: boolean;
    technicalAnalysis: boolean;
  };
  prompts: {
    main: string;
    risk: string;
    technical: string;
  };
  processing: {
    background: boolean;
    cacheResults: boolean;
    batchProcessing: boolean;
  };
  display: {
    jsonFormat: boolean;
    highlightKeywords: boolean;
    exportPDF: boolean;
  };
  limits: {
    dailyLimit: string;
    concurrentLimit: string;
    timeout: string;
  };
}

export function Settings() {
  const { user } = useAuth();
  const location = useLocation();
  const initialTab = (new URLSearchParams(location.search).get('tab')) || 'profile';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [profile, setProfile] = useState({
    email: user?.email || '',
    displayName: (user as any)?.displayName || '',
    bio: '',
    location: '',
    website: ''
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
      tradingAlerts: true,
      aiInsights: true,
      systemUpdates: true
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
      marketing: false
    },
    trading: {
      autoAnalysis: true,
      riskLevel: 'medium',
      maxDrawdown: 10,
      positionSizing: 'moderate'
    }
  });

  const [aiPreferences, setAIPreferences] = useState<AIPreferences>({
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    features: {
      autoAnalysis: true,
      tradingRecommendations: true,
      technicalAnalysis: true
    },
    prompts: {
      main: 'Analizează acest screenshot de trading și oferă o analiză detaliată care include: 1) Identificarea pattern-urilor tehnice, 2) Recomandări de trading, 3) Niveluri de risc, 4) Oportunități identificate.',
      risk: 'Evaluează riscurile asociate cu această oportunitate de trading, incluzând volatilitatea, lichiditatea și factorii externi.',
      technical: 'Identifică și analizează indicatorii tehnici, pattern-urile de preț și nivelurile de suport/rezistență.'
    },
    processing: {
      background: true,
      cacheResults: true,
      batchProcessing: false
    },
    display: {
      jsonFormat: true,
      highlightKeywords: true,
      exportPDF: false
    },
    limits: {
      dailyLimit: '100',
      concurrentLimit: '5',
      timeout: '60'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Local state for AI test actions
  const [aiTestState, setAiTestState] = useState<'idle' | 'connectivity' | 'model' | 'analysis'>('idle');
  const [aiTestMessage, setAiTestMessage] = useState<string | null>(null);

  // Database Info modal state
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbInfo, setDbInfo] = useState<any | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Data Management functions
  const handleExportData = async () => {
    try {
      const dataToExport = {
        userProfile: profile,
        preferences: preferences,
        aiPreferences: aiPreferences,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `techanal-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleImportData = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const importedData = JSON.parse(e.target?.result as string);
              
              // Validate imported data structure
              if (importedData.userProfile && importedData.preferences && importedData.aiPreferences) {
                setProfile(importedData.userProfile);
                setPreferences(importedData.preferences);
                setAIPreferences(importedData.aiPreferences);
                alert('Data imported successfully!');
              } else {
                alert('Invalid data format. Please use a valid export file.');
              }
            } catch (error) {
              alert('Error parsing imported file. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      if (confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear any cached data in memory
        setPreferences({
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false,
            tradingAlerts: true,
            aiInsights: true,
            systemUpdates: true
          },
          privacy: {
            profileVisibility: 'private',
            dataSharing: false,
            analytics: true,
            marketing: false
          },
          trading: {
            autoAnalysis: true,
            riskLevel: 'medium',
            maxDrawdown: 10,
            positionSizing: 'moderate'
          }
        });
        
        alert('Cache cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please try again.');
    }
  };

  const handleDatabaseInfo = async () => {
    setIsDbModalOpen(true);
    setDbLoading(true);
    setDbError(null);
    setDbInfo(null);
    try {
      const response = await api.get('/api/system/database-info');
      const data = await response.json();
      if (data?.success) {
        setDbInfo(data.database || null);
      } else {
        setDbError(data?.details || data?.error || 'Unable to fetch database information.');
      }
    } catch (error: any) {
      console.error('Error fetching database info:', error);
      setDbError(error?.message || 'Error fetching database information.');
    } finally {
      setDbLoading(false);
    }
  };

  async function handleTestConnectivity() {
    setAiTestState('connectivity');
    setAiTestMessage(null);
    try {
      const response = await api.get('/api/v1/ai-test');
      const data = await response.json();
      if (data?.success !== false) {
        const msg = data?.message || 'Conectivitate OK';
        setAiTestMessage(`✅ ${msg}`);
      } else {
        setAiTestMessage(`❌ Eroare conectivitate: ${data?.details || data?.error || 'necunoscută'}`);
      }
    } catch (error: any) {
      setAiTestMessage(`❌ Eroare conectivitate: ${error?.message || 'necunoscută'}`);
    } finally {
      setAiTestState('idle');
    }
  }

  async function handleTestModel() {
    setAiTestState('model');
    setAiTestMessage(null);
    try {
      const response = await api.get('/api/v1/ai-engine-performance');
      const data = await response.json();
      if (data?.success) {
        const duration = data?.result?.processingTime ?? data?.performance?.processingTime;
        setAiTestMessage(`✅ Model OK • timp procesare ~ ${duration ?? 'n/a'} ms`);
      } else {
        setAiTestMessage(`❌ Eroare model: ${data?.details || data?.error || 'necunoscută'}`);
      }
    } catch (error: any) {
      setAiTestMessage(`❌ Eroare model: ${error?.message || 'necunoscută'}`);
    } finally {
      setAiTestState('idle');
    }
  }

  async function handleTestAnalysis() {
    setAiTestState('analysis');
    setAiTestMessage(null);
    try {
      const response = await api.get('/api/v1/chart-analysis-test');
      const data = await response.json();
      if (data?.success) {
        const metrics = data?.performance?.processingTime;
        setAiTestMessage(`✅ Analiză simulată OK • timp ~ ${metrics ?? 'n/a'} ms`);
      } else {
        setAiTestMessage(`❌ Eroare analiză: ${data?.details || data?.error || 'necunoscută'}`);
      }
    } catch (error: any) {
      setAiTestMessage(`❌ Eroare analiză: ${error?.message || 'necunoscută'}`);
    } finally {
      setAiTestState('idle');
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Implement actual save functionality
      console.log('Saving settings...', { profile, preferences, aiPreferences });
      setStoredAIPreferences({
        model: aiPreferences.model,
        temperature: aiPreferences.temperature,
        maxTokens: aiPreferences.maxTokens,
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof preferences.notifications, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof typeof preferences.privacy, value: any) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleTradingChange = (key: keyof typeof preferences.trading, value: any) => {
    setPreferences(prev => ({
      ...prev,
      trading: {
        ...prev.trading,
        [key]: value
      }
    }));
  };

  const handleAIChange = (key: keyof typeof aiPreferences, value: any) => {
    setAIPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAIFeaturesChange = (key: keyof typeof aiPreferences.features, value: boolean) => {
    setAIPreferences(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  const handleAIPromptsChange = (key: keyof typeof aiPreferences.prompts, value: string) => {
    setAIPreferences(prev => ({
      ...prev,
      prompts: {
        ...prev.prompts,
        [key]: value
      }
    }));
  };

  const handleAIProcessingChange = (key: keyof typeof aiPreferences.processing, value: boolean) => {
    setAIPreferences(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        [key]: value
      }
    }));
  };

  const handleAIDisplayChange = (key: keyof typeof aiPreferences.display, value: boolean) => {
    setAIPreferences(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }));
  };

  const handleAILimitsChange = (key: keyof typeof aiPreferences.limits, value: string) => {
    setAIPreferences(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [key]: value
      }
    }));
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPositionSizingColor = (sizing: string) => {
    switch (sizing) {
      case 'conservative':
        return 'text-blue-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'aggressive':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Settings & Preferences
          </h1>
          <p className="text-muted-foreground">
            Gestionează setările contului, preferințele și configurațiile personale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          saveStatus === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
            : saveStatus === 'error'
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
            : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : saveStatus === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4 animate-spin" />
            )}
            <span className="font-medium">
              {saveStatus === 'success' 
                ? 'Settings saved successfully!' 
                : saveStatus === 'error' 
                ? 'Error saving settings. Please try again.' 
                : 'Saving settings...'
              }
            </span>
          </div>
        </div>
      )}

      {/* Settings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Profile</CardTitle>
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Complete</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Profile updated recently
            </p>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Security</CardTitle>
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">High</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              2FA enabled • Strong password
            </p>
            <Progress value={95} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">AI Settings</CardTitle>
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Optimal</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Auto-analysis enabled
            </p>
            <Progress value={87} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Active</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              5 notification types enabled
            </p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Actualizează informațiile personale și detaliile profilului
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Email-ul nu poate fi modificat</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance & Language
                </CardTitle>
                <CardDescription>
                  Personalizează aspectul și limba aplicației
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <Button
                        key={theme}
                        variant={preferences.theme === theme ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreferences(prev => ({ ...prev, theme }))}
                        className="capitalize"
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="w-full p-2 border rounded-md"
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="en">English</option>
                    <option value="ro">Romanian</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border rounded-md"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/Bucharest">Europe/Bucharest</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Display Settings
                </CardTitle>
                <CardDescription>
                  Configurări pentru afișarea datelor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Afișează mai multe informații pe ecran
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Activează animațiile în interfață
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-refresh Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Actualizează automat datele
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configurează cum și când primești notificări
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Communication Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Primește notificări pe email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.email}
                      onCheckedChange={(value) => handleNotificationChange('email', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificări push în browser
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.push}
                      onCheckedChange={(value) => handleNotificationChange('push', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificări prin SMS (costuri suplimentare)
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.sms}
                      onCheckedChange={(value) => handleNotificationChange('sms', value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Trading Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Alerte pentru oportunități de trading
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.tradingAlerts}
                      onCheckedChange={(value) => handleNotificationChange('tradingAlerts', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Insights</Label>
                      <p className="text-sm text-muted-foreground">
                        Insights și recomandări AI
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.aiInsights}
                      onCheckedChange={(value) => handleNotificationChange('aiInsights', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Actualizări de sistem și mentenanță
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.systemUpdates}
                      onCheckedChange={(value) => handleNotificationChange('systemUpdates', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Data Settings
              </CardTitle>
              <CardDescription>
                Controlează confidențialitatea și partajarea datelor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Profile Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="public"
                      name="visibility"
                      value="public"
                      checked={preferences.privacy.profileVisibility === 'public'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    <Label htmlFor="public">Public - Vizibil pentru toți utilizatorii</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="friends"
                      name="visibility"
                      value="friends"
                      checked={preferences.privacy.profileVisibility === 'friends'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    <Label htmlFor="friends">Friends - Doar pentru prieteni</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      checked={preferences.privacy.profileVisibility === 'private'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    />
                    <Label htmlFor="private">Private - Doar pentru tine</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Data Sharing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Trading Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Partajează datele de trading pentru analiză
                      </p>
                    </div>
                    <Switch
                      checked={preferences.privacy.dataSharing}
                      onCheckedChange={(value) => handlePrivacyChange('dataSharing', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics & Research</Label>
                      <p className="text-sm text-muted-foreground">
                        Contribuie la îmbunătățirea sistemului
                      </p>
                    </div>
                    <Switch
                      checked={preferences.privacy.analytics}
                      onCheckedChange={(value) => handlePrivacyChange('analytics', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Primește oferte și promoții
                      </p>
                    </div>
                    <Switch
                      checked={preferences.privacy.marketing}
                      onCheckedChange={(value) => handlePrivacyChange('marketing', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trading Preferences
                </CardTitle>
                <CardDescription>
                  Configurări pentru strategia de trading
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto AI Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Analizează automat screenshot-urile
                    </p>
                  </div>
                  <Switch
                    checked={preferences.trading.autoAnalysis}
                    onCheckedChange={(value) => handleTradingChange('autoAnalysis', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={preferences.trading.riskLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTradingChange('riskLevel', level)}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(preferences.trading.riskLevel)}`}></div>
                    <span className="text-sm text-muted-foreground">
                      Current: {preferences.trading.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Position Sizing</Label>
                  <div className="flex gap-2">
                    {(['conservative', 'moderate', 'aggressive'] as const).map((sizing) => (
                      <Button
                        key={sizing}
                        variant={preferences.trading.positionSizing === sizing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTradingChange('positionSizing', sizing)}
                        className="capitalize"
                      >
                        {sizing}
                      </Button>
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${getPositionSizingColor(preferences.trading.positionSizing)}`}>
                    Current: {preferences.trading.positionSizing}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Risk Management
                </CardTitle>
                <CardDescription>
                  Setări pentru gestionarea riscurilor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Maximum Drawdown</Label>
                    <span className="text-sm font-medium">{preferences.trading.maxDrawdown}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={preferences.trading.maxDrawdown}
                    onChange={(e) => handleTradingChange('maxDrawdown', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span>10%</span>
                    <span>15%</span>
                    <span>20%</span>
                    <span>25%</span>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Risk Warning</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Trading-ul implică riscuri. Asigură-te că înțelegi riscurile înainte de a investi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>
                  Configurează modelul AI și parametrii de analiză
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <select
                    id="aiModel"
                    className="w-full p-2 border rounded-md"
                    defaultValue="gpt-4-turbo"
                  >
                    <option value="gpt-4-turbo">GPT-4 Turbo (Recomandat)</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Selectează modelul AI pentru analiza screenshot-urilor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (Creativitate)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="0.7"
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">0.7</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Determinist (0.0)</span>
                    <span>Balansat (1.0)</span>
                    <span>Creativ (2.0)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens per Analiză</Label>
                  <select
                    id="maxTokens"
                    className="w-full p-2 border rounded-md"
                    defaultValue="2000"
                  >
                    <option value="1000">1000 (Scurt)</option>
                    <option value="2000">2000 (Mediu)</option>
                    <option value="4000">4000 (Detaliat)</option>
                    <option value="8000">8000 (Complet)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Funcții AI</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Analiză Automată</Label>
                        <p className="text-sm text-muted-foreground">
                          Analizează automat screenshot-urile încărcate
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recomandări de Trading</Label>
                        <p className="text-sm text-muted-foreground">
                          Generează recomandări de trading
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Analiză Tehnică</Label>
                        <p className="text-sm text-muted-foreground">
                          Include analiză tehnică în rezultate
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Prompturi Personalizate
                </CardTitle>
                <CardDescription>
                  Personalizează cum AI-ul analizează screenshot-urile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Prompt Principal</Label>
                  <textarea
                    id="customPrompt"
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                    placeholder="Instrucțiuni personalizate pentru AI..."
                    defaultValue="Analizează acest screenshot de trading și oferă o analiză detaliată care include: 1) Identificarea pattern-urilor tehnice, 2) Recomandări de trading, 3) Niveluri de risc, 4) Oportunități identificate."
                  />
                  <p className="text-xs text-muted-foreground">
                    Prompt-ul principal pentru analiza screenshot-urilor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskPrompt">Prompt pentru Riscuri</Label>
                  <textarea
                    id="riskPrompt"
                    className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                    placeholder="Instrucțiuni pentru evaluarea riscurilor..."
                    defaultValue="Evaluează riscurile asociate cu această oportunitate de trading, incluzând volatilitatea, lichiditatea și factorii externi."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technicalPrompt">Prompt Tehnic</Label>
                  <textarea
                    id="technicalPrompt"
                    className="w-full min-h-[80px] p-3 border rounded-md resize-none"
                    placeholder="Instrucțiuni pentru analiza tehnică..."
                    defaultValue="Identifică și analizează indicatorii tehnici, pattern-urile de preț și nivelurile de suport/rezistență."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Setări de Analiză
              </CardTitle>
              <CardDescription>
                Configurări pentru procesarea și afișarea rezultatelor AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Procesare</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Procesare în Background</Label>
                        <p className="text-sm text-muted-foreground">
                          Procesează screenshot-urile în background
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Cache Rezultate</Label>
                        <p className="text-sm text-muted-foreground">
                          Salvează rezultatele pentru reutilizare
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Batch Processing</Label>
                        <p className="text-sm text-muted-foreground">
                          Procesează mai multe screenshot-uri simultan
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Afișare</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Format JSON</Label>
                        <p className="text-sm text-muted-foreground">
                          Afișează rezultatele în format structurat
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Highlight Keywords</Label>
                        <p className="text-sm text-muted-foreground">
                          Evidențiază cuvintele cheie în rezultate
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Export PDF</Label>
                        <p className="text-sm text-muted-foreground">
                          Permite exportul rezultatelor în PDF
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Limitări și Rate Limiting</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Limită Zilnică</Label>
                    <select
                      id="dailyLimit"
                      className="w-full p-2 border rounded-md"
                      defaultValue="100"
                    >
                      <option value="50">50 analize/zi</option>
                      <option value="100">100 analize/zi</option>
                      <option value="200">200 analize/zi</option>
                      <option value="500">500 analize/zi</option>
                      <option value="unlimited">Nelimitat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="concurrentLimit">Limită Concurrentă</Label>
                    <select
                      id="concurrentLimit"
                      className="w-full p-2 border rounded-md"
                      defaultValue="5"
                    >
                      <option value="1">1 analiză</option>
                      <option value="3">3 analize</option>
                      <option value="5">5 analize</option>
                      <option value="10">10 analize</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (secunde)</Label>
                    <select
                      id="timeout"
                      className="w-full p-2 border rounded-md"
                      defaultValue="60"
                    >
                      <option value="30">30 sec</option>
                      <option value="60">60 sec</option>
                      <option value="120">120 sec</option>
                      <option value="300">300 sec</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                AI Service Status
              </CardTitle>
              <CardDescription>
                Monitorizează statusul serviciilor AI și performanța
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2.3s</div>
                  <div className="text-sm text-muted-foreground">Timp Răspuns</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1,247</div>
                  <div className="text-sm text-muted-foreground">Analize Astăzi</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">99.2%</div>
                  <div className="text-sm text-muted-foreground">Precizie</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Testare AI</h4>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleTestConnectivity}
                    disabled={aiTestState !== 'idle'}
                  >
                    <RefreshCw className={`w-4 h-4 ${aiTestState === 'connectivity' ? 'animate-spin' : ''}`} />
                    Test Conectivitate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleTestModel}
                    disabled={aiTestState !== 'idle'}
                  >
                    <Brain className={`w-4 h-4 ${aiTestState === 'model' ? 'animate-spin' : ''}`} />
                    Test Model
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleTestAnalysis}
                    disabled={aiTestState !== 'idle'}
                  >
                    <BarChart3 className={`w-4 h-4 ${aiTestState === 'analysis' ? 'animate-spin' : ''}`} />
                    Test Analiză
                  </Button>
                </div>
                {aiTestMessage && (
                  <div className="text-sm rounded-md border p-3 mt-2 dark:border-neutral-800">
                    {aiTestMessage}
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-sm">AI Service Info</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Serviciul AI este configurat pentru a analiza screenshot-uri de trading cu precizie ridicată. 
                  Modelul curent: GPT-4 Turbo, optimizat pentru analiza tehnică și recomandări de trading.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>
                    Configurări avansate pentru utilizatori experimentați
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/docs/ADVANCED_SETTINGS.html', '_blank')}
                  className="flex items-center gap-2"
                  title="Help with Advanced Settings"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Data Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleExportData}>
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleImportData}>
                    <Upload className="w-4 h-4" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleClearCache}>
                    <Trash2 className="w-4 h-4" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleDatabaseInfo}>
                    <Database className="w-4 h-4" />
                    Database Info
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">API & Integration</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Activează accesul API pentru integrare
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Webhook Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificări prin webhook-uri
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">App Version:</span>
                    <div className="font-semibold">1.0.0</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <div className="font-semibold">2024-01-15</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Database:</span>
                    <div className="font-semibold">PostgreSQL 15</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">AI Model:</span>
                    <div className="font-semibold">GPT-4 Turbo</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Database Info Modal */}
      <Dialog open={isDbModalOpen} onOpenChange={setIsDbModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Information
            </DialogTitle>
            <DialogDescription>
              Detalii despre conexiunea la baza de date și starea serviciului
            </DialogDescription>
          </DialogHeader>
          {dbLoading && (
            <div className="p-4 text-sm">Se încarcă informațiile despre baza de date...</div>
          )}
          {!dbLoading && dbError && (
            <div className="p-4 text-sm border rounded-md text-red-600 dark:text-red-300">
              {dbError}
            </div>
          )}
          {!dbLoading && !dbError && dbInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-semibold">{dbInfo.type || 'PostgreSQL'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Version</div>
                  <div className="font-semibold">{dbInfo.version || 'Unknown'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-semibold">{dbInfo.status || (dbInfo?.health?.connection ? 'Connected' : 'Disconnected')}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <div className="font-semibold">{typeof dbInfo?.health?.responseTime === 'number' ? `${dbInfo.health.responseTime} ms` : 'n/a'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Host</div>
                  <div className="font-semibold">{dbInfo.host || 'Unknown'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Port</div>
                  <div className="font-semibold">{dbInfo.port || 'Unknown'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">SSL</div>
                  <div className="font-semibold">{dbInfo.ssl || 'Disabled'}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Last Backup</div>
                  <div className="font-semibold">{dbInfo.lastBackup || 'Not configured'}</div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/docs/ADVANCED_SETTINGS.html#database-info', '_blank')}
                  className="flex items-center gap-2"
                  title="Help about Database Info"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}