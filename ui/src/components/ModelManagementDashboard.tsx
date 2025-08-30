import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  // Zap, 
  // Settings, 
  Activity, 
  CheckCircle, 
  // XCircle, 
  // AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  // TestTube,
  // BarChart3,
  // Cpu,
  // MemoryStick,
  // HardDrive,
  // Network,
  // Clock,
  // TrendingUp,
  // Shield,
  // Globe,
  // Key,
  // Database,
  // Monitor,
  // Gauge,
  Target,
  // Rocket,
  Star,
  AlertCircle,
  // Info,
  // Wrench,
  // Cog,
  Eye,
  // EyeOff,
  // GitBranch,
  // GitCompare,
  // History,
  Layers,
  // Target as TargetIcon,
  // TrendingDown,
  // Activity as ActivityIcon
  X,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Monitor,
  Gauge,
  Info,
  HelpCircle
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/serverComm';

interface Model {
  name: string;
  type: 'base-model' | 'specialized';
  status: 'active' | 'training' | 'inactive' | 'error';
  currentVersion: string;
  accuracy: number;
  responseTime: number;
  lastTraining: string;
  trainingDataSize: number;
}

interface ModelVersion {
  id: string;
  modelName: string;
  version: string;
  accuracy: number;
  responseTime: number;
  trainingDataSize: number;
  trainingDate: Date;
  status: 'training' | 'active' | 'deprecated' | 'failed';
  performanceMetrics: {
    patternRecognition: number;
    signalAccuracy: number;
    riskAssessment: number;
    overallScore: number;
  };
  metadata: {
    hyperparameters: Record<string, any>;
    trainingDuration: number;
    epochs: number;
    loss: number;
    validationAccuracy: number;
  };
}

interface FineTuningConfig {
  modelName: string;
  baseModel: string;
  trainingDataSize: number;
  epochs: number;
  learningRate: number;
  batchSize: number;
  validationSplit: number;
  earlyStoppingPatience: number;
  hyperparameters: Record<string, any>;
}

interface TrainingJob {
  id: string;
  config: FineTuningConfig;
  startTime: Date;
  progress: number;
}

export function ModelManagementDashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentTrainingJob, setCurrentTrainingJob] = useState<TrainingJob | null>(null);
  const [fineTuningConfig, setFineTuningConfig] = useState<FineTuningConfig>({
    modelName: '',
    baseModel: 'llama3.1:8b',
    trainingDataSize: 10000,
    epochs: 100,
    learningRate: 0.001,
    batchSize: 64,
    validationSplit: 0.2,
    earlyStoppingPatience: 10,
    hyperparameters: {
      optimizer: 'adam',
      weightDecay: 0.01,
      gradientClipNorm: 1.0,
      warmupSteps: 1000
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedModelForView, setSelectedModelForView] = useState<Model | null>(null);

  // Mock data pentru demo
  const mockModels: Model[] = [
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

  useEffect(() => {
    setModels(mockModels);
    if (mockModels.length > 0) {
      setSelectedModel(mockModels[0].name);
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadModelVersions(selectedModel);
    }
  }, [selectedModel]);

  const loadModelVersions = useCallback(async (modelName: string) => {
    try {
      // Try real API first
      const resp = await fetchWithAuth(`/api/model-management/models/${encodeURIComponent(modelName)}/versions`);
      const payload = await resp.json();
      if (payload?.success && Array.isArray(payload.versions)) {
        // Normalize server dates to Date
        const normalized = (payload.versions as any[]).map(v => ({
          ...v,
          trainingDate: v.trainingDate ? new Date(v.trainingDate) : new Date(),
        })) as ModelVersion[];
        setModelVersions(normalized);
        return;
      }
      throw new Error('Invalid versions payload');
    } catch {
      // Fallback to mock
      const mockVersions: ModelVersion[] = [
        {
          id: 'model-1',
          modelName,
          version: 'v1.0.0',
          accuracy: 0.82,
          responseTime: 450,
          trainingDataSize: 5000,
          trainingDate: new Date('2025-01-15'),
          status: 'deprecated',
          performanceMetrics: {
            patternRecognition: 0.80,
            signalAccuracy: 0.78,
            riskAssessment: 0.85,
            overallScore: 0.81
          },
          metadata: {
            hyperparameters: { learningRate: 0.001, batchSize: 32 },
            trainingDuration: 3600000,
            epochs: 50,
            loss: 0.15,
            validationAccuracy: 0.82
          }
        },
        {
          id: 'model-2',
          modelName,
          version: 'v1.1.0',
          accuracy: 0.87,
          responseTime: 380,
          trainingDataSize: 7500,
          trainingDate: new Date('2025-02-01'),
          status: 'active',
          performanceMetrics: {
            patternRecognition: 0.85,
            signalAccuracy: 0.83,
            riskAssessment: 0.88,
            overallScore: 0.85
          },
          metadata: {
            hyperparameters: { learningRate: 0.0008, batchSize: 64 },
            trainingDuration: 4800000,
            epochs: 75,
            loss: 0.12,
            validationAccuracy: 0.87
          }
        }
      ];
      setModelVersions(mockVersions);
    }
  }, []);

  const handleStartFineTuning = useCallback(async () => {
    if (!selectedModel) {
      setError('Please select a model first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const body = {
        modelName: selectedModel,
        baseModel: fineTuningConfig.baseModel,
        trainingDataSize: fineTuningConfig.trainingDataSize,
        epochs: fineTuningConfig.epochs,
        learningRate: fineTuningConfig.learningRate,
        batchSize: fineTuningConfig.batchSize,
        validationSplit: fineTuningConfig.validationSplit,
        earlyStoppingPatience: fineTuningConfig.earlyStoppingPatience,
        hyperparameters: fineTuningConfig.hyperparameters
      };
      const resp = await fetchWithAuth(`/api/model-management/models/${encodeURIComponent(selectedModel)}/fine-tune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await resp.json();
      if (!payload?.success) throw new Error('Failed to start fine-tuning');

      const trainingJob: TrainingJob = {
        id: (payload.trainingId as string) || `training-${Date.now()}`,
        config: { ...fineTuningConfig, modelName: selectedModel },
        startTime: new Date(),
        progress: 0
      };

      setCurrentTrainingJob(trainingJob);
      setIsTraining(true);

      // Begin polling status
      startStatusPolling(selectedModel);
    } catch {
      // Fallback to simulated training
      const trainingJob: TrainingJob = {
        id: `training-${Date.now()}`,
        config: { ...fineTuningConfig, modelName: selectedModel },
        startTime: new Date(),
        progress: 0
      };
      setCurrentTrainingJob(trainingJob);
      setIsTraining(true);
      simulateTrainingProgress(trainingJob.id);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, fineTuningConfig]);

  const startStatusPolling = useCallback((modelName: string) => {
    let cancelled = false;
    const poll = async () => {
      try {
        const resp = await fetchWithAuth(`/api/model-management/models/${encodeURIComponent(modelName)}/fine-tune/status`);
        const payload = await resp.json();
        if (payload?.success && payload.status) {
          const progress = Math.min(100, Math.max(0, Math.round(payload.status.currentJob?.progress ?? 0)));
          if (!cancelled) {
            if (progress >= 100) {
              setIsTraining(false);
              setCurrentTrainingJob(null);
              await loadModelVersions(modelName);
              return;
            }
            setCurrentTrainingJob(prev => prev ? { ...prev, progress } : prev);
          }
        }
      } catch {
        // ignore transient polling errors
      }
      if (!cancelled) setTimeout(poll, 1500);
    };
    poll();
    return () => { cancelled = true; };
  }, [loadModelVersions]);

  const handleStopTraining = useCallback(async () => {
    try {
      if (selectedModel) {
        await fetchWithAuth(`/api/model-management/models/${encodeURIComponent(selectedModel)}/fine-tune/stop`, {
          method: 'POST'
        });
      }
      setIsTraining(false);
      setCurrentTrainingJob(null);
    } catch (err) {
      setError('Failed to stop training');
    }
  }, [selectedModel]);

  const simulateTrainingProgress = useCallback((_trainingId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsTraining(false);
        setCurrentTrainingJob(null);
        
        // Add new version
        const newVersion: ModelVersion = {
          id: `model-${Date.now()}`,
          modelName: selectedModel,
          version: `v${Date.now()}`,
          accuracy: 0.85 + Math.random() * 0.1,
          responseTime: 300 + Math.random() * 200,
          trainingDataSize: fineTuningConfig.trainingDataSize,
          trainingDate: new Date(),
          status: 'active',
          performanceMetrics: {
            patternRecognition: 0.85 + Math.random() * 0.1,
            signalAccuracy: 0.80 + Math.random() * 0.15,
            riskAssessment: 0.88 + Math.random() * 0.08,
            overallScore: 0.84 + Math.random() * 0.12
          },
          metadata: {
            hyperparameters: fineTuningConfig.hyperparameters,
            trainingDuration: Date.now() - new Date().getTime(),
            epochs: fineTuningConfig.epochs,
            loss: 0.1 + Math.random() * 0.2,
            validationAccuracy: 0.85 + Math.random() * 0.1
          }
        };
        
        setModelVersions(prev => [newVersion, ...prev]);
      }
      
      setCurrentTrainingJob(prev => prev ? { ...prev, progress } : null);
    }, 500);
  }, [selectedModel, fineTuningConfig]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'training': return 'Training';
      case 'inactive': return 'Inactive';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  }, []);

  const activeModels = useMemo(() => 
    models.filter(m => m.status === 'active'), [models]
  );

  const trainingModels = useMemo(() => 
    models.filter(m => m.status === 'training'), [models]
  );

  const averageAccuracy = useMemo(() => 
    activeModels.length > 0 
      ? activeModels.reduce((sum, m) => sum + m.accuracy, 0) / activeModels.length
      : 0, [activeModels]
  );

  // const selectedModelData = useMemo(() => 
  //   models.find(m => m.name === selectedModel), [models, selectedModel]
  // );

  const openViewModal = useCallback(() => {
    setSelectedModelForView(models.find(m => m.name === selectedModel) || null);
    setIsViewModalOpen(true);
  }, [selectedModel, models]);

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedModelForView(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            Model Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage AI models, fine-tuning, and versioning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
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
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeModels.length} active • {trainingModels.length} training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModels.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(averageAccuracy * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all active models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingModels.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="fine-tuning">Fine-tuning</TabsTrigger>
          <TabsTrigger value="versions">Model Versions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card
                key={model.name}
                className={`${selectedModel === model.name ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
                onClick={() => setSelectedModel(model.name)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`}></div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge variant={model.type === 'base-model' ? 'default' : 'secondary'}>
                        {model.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setSelectedModelForView(model); setIsViewModalOpen(true); }}
                        disabled={isTraining}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Version: {model.currentVersion} • Status: {getStatusText(model.status)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={model.accuracy * 100} className="h-2" />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Response Time</div>
                      <div className="font-medium">{model.responseTime}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Training Data</div>
                      <div className="font-medium">{model.trainingDataSize.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Training</div>
                      <div className="font-medium">{model.lastTraining}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-medium capitalize">{model.type.replace('-', ' ')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fine-tuning Tab */}
        <TabsContent value="fine-tuning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fine-tuning Configuration</CardTitle>
              <CardDescription>
                Configure and start fine-tuning for selected model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model">Select Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    value={fineTuningConfig.epochs}
                    onChange={(e) => setFineTuningConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningRate">Learning Rate</Label>
                  <Input
                    id="learningRate"
                    type="number"
                    step="0.0001"
                    value={fineTuningConfig.learningRate}
                    onChange={(e) => setFineTuningConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={fineTuningConfig.batchSize}
                    onChange={(e) => setFineTuningConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingDataSize">Training Data Size</Label>
                  <Input
                    id="trainingDataSize"
                    type="number"
                    value={fineTuningConfig.trainingDataSize}
                    onChange={(e) => setFineTuningConfig(prev => ({ ...prev, trainingDataSize: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Training Controls */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartFineTuning} 
                  disabled={isLoading || isTraining || !selectedModel}
                  className="flex items-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Start Fine-tuning
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleStopTraining}
                  disabled={!isTraining}
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Stop Training
                </Button>
              </div>

              {/* Current Training Job */}
              {currentTrainingJob && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Training Progress</span>
                    <span>{Math.round(currentTrainingJob.progress)}%</span>
                  </div>
                  <Progress value={currentTrainingJob.progress} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Model: {currentTrainingJob.config.modelName} • Epochs: {currentTrainingJob.config.epochs}
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Versions Tab */}
        <TabsContent value="versions" className="space-y-4">
          {selectedModel ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Versions for {selectedModel}</h3>
                <Badge variant="outline">
                  {modelVersions.length} versions
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {modelVersions.map((version) => (
                  <Card key={version.id} className={`${version.status === 'active' ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(version.status)}`}></div>
                          <CardTitle className="text-lg">{version.version}</CardTitle>
                          {version.status === 'active' && (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={version.status === 'active'}
                            onClick={async () => {
                              try {
                                await fetchWithAuth(`/api/model-management/models/${encodeURIComponent(selectedModel)}/versions/${encodeURIComponent(version.version)}/activate`, { method: 'POST' });
                                // Update local list to reflect activation
                                setModelVersions(prev => prev.map(v => ({ ...v, status: v.id === version.id ? 'active' : v.status })));
                                // Notify AI Management to set default provider heuristically
                                window.dispatchEvent(new CustomEvent('model-activated', { detail: { modelName: selectedModel, version: version.version } }));
                                alert('Model version activated');
                              } catch (e) {
                                alert('Failed to activate model version');
                              }
                            }}
                          >
                            <Star className="w-4 h-4" />
                            Activate
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Trained on {version.trainingDate.toLocaleDateString()} • Status: {getStatusText(version.status)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Overall Accuracy</div>
                          <div className="font-medium">{(version.accuracy * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Response Time</div>
                          <div className="font-medium">{version.responseTime}ms</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Pattern Recognition</div>
                          <div className="font-medium">{(version.performanceMetrics.patternRecognition * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Signal Accuracy</div>
                          <div className="font-medium">{(version.performanceMetrics.signalAccuracy * 100).toFixed(1)}%</div>
                        </div>
                      </div>

                      {/* Training Metadata */}
                      <div className="border-t pt-4">
                        <div className="text-sm text-muted-foreground mb-2">Training Details</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Epochs</div>
                            <div className="font-medium">{version.metadata.epochs}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Final Loss</div>
                            <div className="font-medium">{version.metadata.loss.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Validation Accuracy</div>
                            <div className="font-medium">{(version.metadata.validationAccuracy * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Training Data</div>
                            <div className="font-medium">{version.trainingDataSize.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Please select a model to view its versions
            </div>
          )}
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Overview</CardTitle>
                <CardDescription>Performance metrics across all models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Accuracy</span>
                    <span>{(averageAccuracy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={averageAccuracy * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Active Models</div>
                    <div className="font-medium">{activeModels.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Training Models</div>
                    <div className="font-medium">{trainingModels.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Status */}
            <Card>
              <CardHeader>
                <CardTitle>Training Status</CardTitle>
                <CardDescription>Current training jobs and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isTraining && currentTrainingJob ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{Math.round(currentTrainingJob.progress)}%</span>
                    </div>
                    <Progress value={currentTrainingJob.progress} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      Model: {currentTrainingJob.config.modelName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Epochs: {currentTrainingJob.config.epochs} • Data: {currentTrainingJob.config.trainingDataSize.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No active training jobs
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Model View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  {selectedModelForView?.name && (
                    <>
                      <Brain className="w-8 h-8 text-blue-600" />
                      {selectedModelForView.name}
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  Detailed model information and performance metrics
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={closeViewModal}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedModelForView && (
            <div className="space-y-6">
              {/* Model Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Model Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Type</div>
                        <Badge variant={selectedModelForView.type === 'base-model' ? 'default' : 'secondary'}>
                          {selectedModelForView.type}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedModelForView.status)}`}></div>
                          <span className="capitalize">{selectedModelForView.status}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Version</div>
                        <div className="font-medium">{selectedModelForView.currentVersion}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Last Training</div>
                        <div className="font-medium">{selectedModelForView.lastTraining}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accuracy</span>
                          <span>{(selectedModelForView.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={selectedModelForView.accuracy * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Response Time</span>
                          <span>{selectedModelForView.responseTime}ms</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((selectedModelForView.responseTime / 500) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Training Data Size</div>
                        <div className="font-medium">{selectedModelForView.trainingDataSize.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Model Type</div>
                        <div className="font-medium capitalize">{selectedModelForView.type.replace('-', ' ')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Model Versions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Model Versions
                  </CardTitle>
                  <CardDescription>
                    Historical versions and their performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {modelVersions.length > 0 ? (
                    <div className="space-y-3">
                      {modelVersions.slice(0, 5).map((version) => (
                        <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">v{version.version}</div>
                            <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                              {version.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {(version.accuracy * 100).toFixed(1)}% accuracy
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {version.trainingDate.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No version history available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      This dashboard provides comprehensive information about your AI models including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Performance metrics and accuracy scores</li>
                      <li>Training history and version management</li>
                      <li>Real-time status monitoring</li>
                      <li>Fine-tuning configuration options</li>
                    </ul>
                    <p className="mt-3">
                      For technical support or questions about model performance, please contact your system administrator.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
