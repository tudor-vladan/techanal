import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelManagementDashboard } from '@/components/ModelManagementDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  Settings,
  Activity,
  RefreshCw,
  TestTube,
  BarChart3,
  Target,
  Star,
  AlertCircle,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';
// import { fetchWithAuth } from '@/lib/serverComm';

interface AIProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  health: number;
  responseTime: number;
  accuracy: number;
  costPerRequest: number;
  requestsPerMinute: number;
  totalRequests: number;
  lastUsed: string;
  capabilities: string[];
  model: string;
  apiKey?: string;
  baseUrl?: string;
  timeout: number;
  maxTokens: number;
  temperature: number;
  isDefault: boolean;
}

interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'mock';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeout: number;
  maxTokens: number;
  temperature: number;
  isDefault: boolean;
}

interface AIProviderTest {
  id: string;
  provider: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  result?: any;
  error?: string;
}

interface AIProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalCost: number;
  accuracyRate: number;
  uptime: number;
  last24Hours: {
    requests: number;
    errors: number;
    cost: number;
  };
}

// Tiny inline sparkline component (SVG) for KPI mini-graphs
function Sparkline({ data, width = 120, height = 28, stroke = 'currentColor' }: { data: number[]; width?: number; height?: number; stroke?: string }) {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="text-muted-foreground">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export function AIManagementDashboard() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const [providerConfig, setProviderConfig] = useState<AIProviderConfig>({
    provider: 'ollama',
    timeout: 30000,
    maxTokens: 1000,
    temperature: 0.3,
    isDefault: false
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<AIProviderTest[]>([]);
  const [metrics, setMetrics] = useState<AIProviderMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  // (moved below handleSetDefault to avoid TDZ)

  // Mock data pentru demo
  const mockProviders: AIProvider[] = [
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
      baseUrl: 'http://localhost:11434',
      timeout: 30000,
      maxTokens: 1000,
      temperature: 0.3,
      isDefault: true
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      status: 'inactive',
      health: 0,
      responseTime: 0,
      accuracy: 0,
      costPerRequest: 0.03,
      requestsPerMinute: 0,
      totalRequests: 0,
      lastUsed: '',
      capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
      model: 'gpt-4-vision-preview',
      timeout: 30000,
      maxTokens: 1000,
      temperature: 0.3,
      isDefault: false
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      status: 'inactive',
      health: 0,
      responseTime: 0,
      accuracy: 0,
      costPerRequest: 0.015,
      requestsPerMinute: 0,
      totalRequests: 0,
      lastUsed: '',
      capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
      model: 'claude-3-sonnet-20240229',
      timeout: 30000,
      maxTokens: 1000,
      temperature: 0.3,
      isDefault: false
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
      isDefault: false
    }
  ];

  const mockMetrics: AIProviderMetrics = {
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

  // Derived mini-series for sparklines (mock trending data)
  const kpiSeries = useMemo(() => {
    const seriesLen = 16;
    const gen = (start: number, vol: number) => Array.from({ length: seriesLen }, (_, i) => Math.max(0, start + Math.round((Math.sin(i / 2) + Math.random() * vol) * vol)));
    return {
      successRate: gen(80, 5),
      latencyMs: gen(Math.max(100, Math.round(metrics?.averageResponseTime || 800)), 40),
      cost: gen(Math.round(metrics?.last24Hours.cost || 0), 1),
    };
  }, [metrics]);

  useEffect(() => {
    setProviders(mockProviders);
    setMetrics(mockMetrics);
  }, []);

  const handleProviderChange = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setProviderConfig({
        provider: provider.id as any,
        apiKey: provider.apiKey,
        model: provider.model,
        baseUrl: provider.baseUrl,
        timeout: provider.timeout,
        maxTokens: provider.maxTokens,
        temperature: provider.temperature,
        isDefault: provider.isDefault
      });
    }
  }, [providers]);

  const handleConfigUpdate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProviders(prev => prev.map(p => 
        p.id === selectedProvider 
          ? { ...p, ...providerConfig }
          : p
      ));
      
      // Show success message
      setError(null);
    } catch (err) {
      setError('Failed to update provider configuration');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider, providerConfig]);

  const handleTestProvider = useCallback(async (providerId: string) => {
    setIsTesting(true);
    const testId = `test-${Date.now()}`;
    
    const newTest: AIProviderTest = {
      id: testId,
      provider: providerId,
      status: 'running',
      startTime: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, newTest]);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const success = Math.random() > 0.2; // 80% success rate
      
      setTestResults(prev => prev.map(t => 
        t.id === testId 
          ? {
              ...t,
              status: success ? 'completed' : 'failed',
              endTime: new Date().toISOString(),
              duration: Date.now() - new Date(t.startTime).getTime(),
              result: success ? { status: 'healthy', responseTime: 1200 + Math.random() * 800 } : null,
              error: success ? undefined : 'Connection timeout'
            }
          : t
      ));
      
      // Update provider health
      if (success) {
        setProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, health: Math.min(100, p.health + 5), status: 'active' as any }
            : p
        ));
      }
    } catch (err) {
      setTestResults(prev => prev.map(t => 
        t.id === testId 
          ? {
              ...t,
              status: 'failed',
              endTime: new Date().toISOString(),
              duration: Date.now() - new Date(t.startTime).getTime(),
              error: 'Test failed unexpectedly'
            }
          : t
      ));
    } finally {
      setIsTesting(false);
    }
  }, []);

  const handleSetDefault = useCallback(async (providerId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Instant visual update: Default badge switches immediately
      setProviders(prev => prev.map(p => ({
        ...p,
        isDefault: p.id === providerId
      })));
      
      setProviderConfig(prev => ({
        ...prev,
        isDefault: prev.provider === providerId
      }));
    } catch (err) {
      setError('Failed to set default provider');
    }
  }, []);

  // Listen for model activation event and set default provider if matches
  useEffect(() => {
    const handler = (e: any) => {
      const { modelName } = e.detail || {};
      if (!modelName) return;
      const match = providers.find(p => (p.model || '').toLowerCase().includes(String(modelName).toLowerCase()));
      if (match) {
        handleSetDefault(match.id);
      }
    };
    window.addEventListener('model-activated', handler as any);
    return () => window.removeEventListener('model-activated', handler as any);
  }, [providers, handleSetDefault]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'error': return 'Error';
      case 'testing': return 'Testing';
      default: return 'Unknown';
    }
  }, []);

  const activeProviders = useMemo(() => 
    providers.filter(p => p.status === 'active'), [providers]
  );

  const totalCost = useMemo(() => 
    providers.reduce((sum, p) => sum + (p.costPerRequest * p.totalRequests), 0), [providers]
  );

  const averageAccuracy = useMemo(() => 
    activeProviders.length > 0 
      ? activeProviders.reduce((sum, p) => sum + p.accuracy, 0) / activeProviders.length
      : 0, [activeProviders]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage AI providers, monitor performance, and configure settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/model-management">
            <Button variant="outline" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Model Management
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowApiKeys(!showApiKeys)}
            className="flex items-center gap-2"
          >
            {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showApiKeys ? 'Hide' : 'Show'} API Keys
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProviders.length}</div>
            <p className="text-xs text-muted-foreground">
              of {providers.length} total providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequests.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.last24Hours.requests || 0} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all active providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        {/* AI Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className={`${(selectedProvider === provider.id) ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(provider.status)}`}></div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      {provider.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleTestProvider(provider.id); }}
                        disabled={isTesting}
                      >
                        <TestTube className="w-4 h-4" />
                        Test
                      </Button>
                      {!provider.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleSetDefault(provider.id); }}
                        >
                          <Star className="w-4 h-4" />
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Model: {provider.model} • Status: {getStatusText(provider.status)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health</span>
                      <span>{provider.health}%</span>
                    </div>
                    <Progress value={provider.health} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Response Time</div>
                      <div className="font-medium">{provider.responseTime}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Accuracy</div>
                      <div className="font-medium">{provider.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Requests/min</div>
                      <div className="font-medium">{provider.requestsPerMinute}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Requests</div>
                      <div className="font-medium">{provider.totalRequests.toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Capabilities</div>
                    <div className="flex flex-wrap gap-1">
                      {provider.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {provider.costPerRequest > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Cost per request: </span>
                      <span className="font-medium">${provider.costPerRequest.toFixed(4)}</span>
                    </div>
                  )}
                  {provider.lastUsed && (
                    <div className="text-sm text-muted-foreground">
                      Last used: {new Date(provider.lastUsed).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Configuration</CardTitle>
              <CardDescription>
                Configure settings for the selected AI provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={selectedProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={providerConfig.model || ''}
                    onChange={(e) => setProviderConfig(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Model name"
                  />
                </div>

                {providerConfig.provider !== 'ollama' && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type={showApiKeys ? 'text' : 'password'}
                      value={providerConfig.apiKey || ''}
                      onChange={(e) => setProviderConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter API key"
                    />
                  </div>
                )}

                {providerConfig.provider === 'ollama' && (
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input
                      id="baseUrl"
                      value={providerConfig.baseUrl || ''}
                      onChange={(e) => setProviderConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={providerConfig.timeout}
                    onChange={(e) => setProviderConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={providerConfig.maxTokens}
                    onChange={(e) => setProviderConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={providerConfig.temperature}
                    onChange={(e) => setProviderConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={providerConfig.isDefault}
                  onCheckedChange={(checked) => setProviderConfig(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">Set as default provider</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleConfigUpdate} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Update Configuration
                </Button>
                <Button variant="outline" onClick={() => handleTestProvider(selectedProvider)}>
                  <TestTube className="w-4 h-4" />
                  Test Configuration
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Real-time performance monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>{metrics?.uptime || 0}%</span>
                  </div>
                  <Progress value={metrics?.uptime || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>{metrics ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <Progress 
                    value={metrics ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="pt-2">
                    <Sparkline data={kpiSeries.successRate} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Avg Response Time</div>
                    <div className="font-medium">{metrics?.averageResponseTime || 0}ms</div>
                    <div className="pt-2"><Sparkline data={kpiSeries.latencyMs} /></div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Accuracy Rate</div>
                    <div className="font-medium">{metrics?.accuracyRate || 0}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Usage and cost tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>24h Requests</span>
                    <span>{metrics?.last24Hours.requests || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>24h Errors</span>
                    <span>{metrics?.last24Hours.errors || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>24h Cost</span>
                    <span>${metrics?.last24Hours.cost || 0}</span>
                  </div>
                  <div className="pt-2">
                    <Sparkline data={kpiSeries.cost} />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Cost by Provider</div>
                  {providers.map((provider) => (
                    <div key={provider.id} className="flex justify-between text-sm mb-1">
                      <span>{provider.name}</span>
                      <span>${(provider.costPerRequest * provider.totalRequests).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Testing</CardTitle>
              <CardDescription>Test AI providers and monitor results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => providers.forEach(p => handleTestProvider(p.id))}
                  disabled={isTesting}
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Test All Providers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTestResults([])}
                >
                  Clear Results
                </Button>
              </div>

              <div className="space-y-2">
                {testResults.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        test.status === 'completed' ? 'bg-green-500' :
                        test.status === 'failed' ? 'bg-red-500' :
                        test.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{test.provider}</div>
                        <div className="text-sm text-muted-foreground">
                          {test.status === 'running' ? 'Testing...' :
                           test.status === 'completed' ? 'Test completed' :
                           test.status === 'failed' ? `Failed: ${test.error}` : 'Pending'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {test.duration ? `${test.duration}ms` : ''}
                    </div>
                  </div>
                ))}
                
                {testResults.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No test results yet. Run a test to see results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models (embedded Model Management) */}
        <TabsContent value="models" className="space-y-4">
          <ModelManagementDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing icon component
const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);
