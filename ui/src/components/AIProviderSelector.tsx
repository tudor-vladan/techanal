import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  TestTube,
  Star,
  Activity,
  Target,
  Clock,
  DollarSign,
  GitCompare,
  Loader2
} from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  health: number;
  responseTime: number;
  accuracy: number;
  costPerRequest: number;
  capabilities: string[];
  model: string;
  isDefault: boolean;
}

interface AIProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
  onAnalysisStart: () => void;
  isAnalyzing: boolean;
}

export function AIProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  onAnalysisStart,
  isAnalyzing 
}: AIProviderSelectorProps) {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      capabilities: ['text-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment'],
      model: 'llama3.1:8b',
      isDefault: true
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      status: 'active',
      health: 90,
      responseTime: 1800,
      accuracy: 92,
      costPerRequest: 0.03,
      capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
      model: 'gpt-4-vision-preview',
      isDefault: false
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      status: 'active',
      health: 88,
      responseTime: 2200,
      accuracy: 89,
      costPerRequest: 0.015,
      capabilities: ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'],
      model: 'claude-3-sonnet-20240229',
      isDefault: false
    }
  ];

  useEffect(() => {
    setProviders(mockProviders);
  }, []);

  const handleProviderChange = (providerId: string) => {
    onProviderChange(providerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'error': return 'Error';
      case 'testing': return 'Testing';
      default: return 'Unknown';
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Provider Selection
        </CardTitle>
        <CardDescription>
          Choose your preferred AI provider for chart analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select AI Provider</label>
          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`}></div>
                    {provider.name}
                    {provider.isDefault && <Star className="w-3 h-3 text-yellow-500" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Provider Info */}
        {selectedProviderData && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{selectedProviderData.name}</h4>
                {selectedProviderData.isDefault && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedProviderData.status)}`}></div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Model: {selectedProviderData.model}
            </div>

            {/* Health and Performance */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Health</span>
                <span>{selectedProviderData.health}%</span>
              </div>
              <Progress value={selectedProviderData.health} className="h-2" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Response Time</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedProviderData.responseTime}ms
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Accuracy</div>
                <div className="font-medium flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {selectedProviderData.accuracy}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Cost/Request</div>
                <div className="font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {selectedProviderData.costPerRequest > 0 
                    ? `$${selectedProviderData.costPerRequest.toFixed(4)}` 
                    : 'Free'
                  }
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium">{getStatusText(selectedProviderData.status)}</div>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Capabilities</div>
              <div className="flex flex-wrap gap-1">
                {selectedProviderData.capabilities.map((capability) => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Provider Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Provider Comparison</span>
            <Button variant="outline" size="sm" className="text-xs">
              <GitCompare className="w-3 h-3 mr-1" />
              Compare All
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {providers.map((provider) => (
              <div 
                key={provider.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  selectedProvider === provider.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`}></div>
                  <span className="text-sm font-medium">{provider.name}</span>
                  {provider.isDefault && <Star className="w-3 h-3 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{provider.responseTime}ms</span>
                  <span>{provider.accuracy}%</span>
                  <span>{provider.costPerRequest > 0 ? `$${provider.costPerRequest.toFixed(4)}` : 'Free'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Start Button */}
        <Button 
          onClick={onAnalysisStart} 
          disabled={isAnalyzing || !selectedProviderData || selectedProviderData.status !== 'active'}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Start Analysis with {selectedProviderData?.name}
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Provider Management Link */}
        <div className="text-center">
          <Button variant="link" size="sm" className="text-xs" onClick={() => navigate('/ai-management')}>
            <Settings className="w-3 h-3 mr-1" />
            Manage AI Providers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
