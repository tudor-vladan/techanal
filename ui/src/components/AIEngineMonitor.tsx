import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Activity,
  BarChart3,
  Plus,
  Settings,
  Eye as EyeIcon,
  X,
  Save,
  Loader2
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'nlp' | 'vision' | 'reinforcement';
  status: 'training' | 'ready' | 'inference' | 'error' | 'offline';
  accuracy: number;
  loss: number;
  trainingProgress: number;
  lastTraining: string;
  inferenceCount: number;
  avgResponseTime: number;
  gpuUtilization: number;
  memoryUsage: number;
  modelSize: number;
  parameters: number;
}

interface AITrainingJob {
  id: string;
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: string;
  estimatedCompletion: string;
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  gpuUsage: number;
  memoryUsage: number;
}

interface AIInferenceRequest {
  id: string;
  modelId: string;
  timestamp: string;
  inputSize: number;
  responseTime: number;
  success: boolean;
  error?: string;
  confidence?: number;
  prediction?: any;
}

interface AIEngineMonitorProps {
  isMonitoring: boolean;
}

export function AIEngineMonitor({ isMonitoring }: AIEngineMonitorProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<AITrainingJob[]>([]);
  const [inferenceRequests, setInferenceRequests] = useState<AIInferenceRequest[]>([]);
  
  // State pentru managementul modelelor
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data pentru model nou
  const [newModelData, setNewModelData] = useState({
    name: '',
    version: '1.0.0',
    type: 'classification' as AIModel['type'],
    description: '',
    parameters: 1000000,
    modelSize: 100
  });

  // Generează date mock pentru AI Engine
  useEffect(() => {
    if (!isMonitoring) return;

    const generateMockData = () => {
      // Mock AI Models
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'TechAnal Trading Predictor',
          version: '2.1.0',
          type: 'regression',
          status: 'ready',
          accuracy: 87.3,
          loss: 0.124,
          trainingProgress: 100,
          lastTraining: '2024-01-15 08:30:00',
          inferenceCount: 15420,
          avgResponseTime: 45,
          gpuUtilization: 65,
          memoryUsage: 2.8,
          modelSize: 156,
          parameters: 12500000
        },
        {
          id: 'model-2',
          name: 'Image Analysis Engine',
          version: '1.5.2',
          type: 'vision',
          status: 'ready',
          accuracy: 92.1,
          loss: 0.089,
          trainingProgress: 100,
          lastTraining: '2024-01-14 16:45:00',
          inferenceCount: 8920,
          avgResponseTime: 78,
          gpuUtilization: 78,
          memoryUsage: 4.2,
          modelSize: 234,
          parameters: 18700000
        },
        {
          id: 'model-3',
          name: 'Sentiment Analyzer',
          version: '1.8.0',
          type: 'nlp',
          status: 'training',
          accuracy: 76.8,
          loss: 0.234,
          trainingProgress: 65,
          lastTraining: '2024-01-15 10:20:00',
          inferenceCount: 0,
          avgResponseTime: 0,
          gpuUtilization: 45,
          memoryUsage: 3.1,
          modelSize: 189,
          parameters: 8900000
        }
      ];

      // Mock Training Jobs
      const mockTrainingJobs: AITrainingJob[] = [
        {
          id: 'job-1',
          modelId: 'model-3',
          status: 'running',
          progress: 65,
          startTime: '2024-01-15 10:20:00',
          estimatedCompletion: '2024-01-15 18:00:00',
          currentEpoch: 13,
          totalEpochs: 20,
          currentLoss: 0.234,
          currentAccuracy: 76.8,
          gpuUsage: 45,
          memoryUsage: 3.1
        }
      ];

      // Mock Inference Requests
      const mockInferenceRequests: AIInferenceRequest[] = [
        {
          id: 'req-1',
          modelId: 'model-1',
          timestamp: '2024-01-15 14:30:00',
          inputSize: 1024,
          responseTime: 42,
          success: true,
          confidence: 0.89,
          prediction: { trend: 'bullish', confidence: 0.89 }
        },
        {
          id: 'req-2',
          modelId: 'model-2',
          timestamp: '2024-01-15 14:25:00',
          inputSize: 2048,
          responseTime: 81,
          success: true,
          confidence: 0.92,
          prediction: { object: 'chart_pattern', confidence: 0.92 }
        },
        {
          id: 'req-3',
          modelId: 'model-1',
          timestamp: '2024-01-15 14:20:00',
          inputSize: 512,
          responseTime: 38,
          success: false,
          error: 'Input validation failed'
        }
      ];

      setModels(mockModels);
      setTrainingJobs(mockTrainingJobs);
      setInferenceRequests(mockInferenceRequests);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 5000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Funcții pentru managementul modelelor
  const handleAddModel = async () => {
    if (!newModelData.name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulează o operație asincronă
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newModel: AIModel = {
        id: `model-${Date.now()}`,
        name: newModelData.name,
        version: newModelData.version,
        type: newModelData.type,
        status: 'ready',
        accuracy: Math.random() * 20 + 80, // 80-100%
        loss: Math.random() * 0.2 + 0.05, // 0.05-0.25
        trainingProgress: 100,
        lastTraining: new Date().toISOString(),
        inferenceCount: 0,
        avgResponseTime: Math.random() * 50 + 30, // 30-80ms
        gpuUtilization: Math.random() * 30 + 20, // 20-50%
        memoryUsage: Math.random() * 3 + 1, // 1-4GB
        modelSize: newModelData.modelSize,
        parameters: newModelData.parameters
      };
      
      setModels(prev => [...prev, newModel]);
      
      // Reset form
      setNewModelData({
        name: '',
        version: '1.0.0',
        type: 'classification',
        description: '',
        parameters: 1000000,
        modelSize: 100
      });
      
      setIsAddModelOpen(false);
    } catch (error) {
      console.error('Error adding model:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditModel = (model: AIModel) => {
    setEditingModel(model);
    setIsEditModelOpen(true);
  };

  const handleUpdateModel = async () => {
    if (!editingModel) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setModels(prev => prev.map(model => 
        model.id === editingModel.id 
          ? { ...model, ...editingModel }
          : model
      ));
      
      setIsEditModelOpen(false);
      setEditingModel(null);
    } catch (error) {
      console.error('Error updating model:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setModels(prev => prev.filter(model => model.id !== modelId));
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const resetForm = () => {
    setNewModelData({
      name: '',
      version: '1.0.0',
      type: 'classification',
      description: '',
      parameters: 1000000,
      modelSize: 100
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'training':
        return 'bg-blue-500';
      case 'inference':
        return 'bg-purple-500';
      case 'error':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification':
        return <Target className="w-4 h-4" />;
      case 'regression':
        return <TrendingUp className="w-4 h-4" />;
      case 'nlp':
        return <Brain className="w-4 h-4" />;
      case 'vision':
        return <EyeIcon className="w-4 h-4" />;
      case 'reinforcement':
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'queued':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatModelSize = (size: number) => {
    if (size < 1024) return `${size} MB`;
    return `${(size / 1024).toFixed(1)} GB`;
  };

  const formatParameters = (params: number) => {
    if (params >= 1000000) return `${(params / 1000000).toFixed(1)}M`;
    if (params >= 1000) return `${(params / 1000).toFixed(1)}K`;
    return params.toString();
  };

  const overallAccuracy = models.length > 0 
    ? models.reduce((acc, model) => acc + model.accuracy, 0) / models.length 
    : 0;

  const trainingModels = models.filter(model => model.status === 'training');
  const readyModels = models.filter(model => model.status === 'ready');

  return (
    <div className="space-y-6">
      {/* AI Engine Overview */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Brain className="w-6 h-6" />
            AI Engine Overview
          </CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            Monitorizare completă a modelelor AI, training-ului și inferențelor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {models.length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Total Models</div>
            </div>
            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {readyModels.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Ready Models</div>
            </div>
            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {trainingModels.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Training</div>
            </div>
            <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {overallAccuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Avg Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Models */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Models
              </CardTitle>
              <CardDescription>
                Status și performanța modelelor AI
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddModelOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Model
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(model.type)}
                    <div>
                      <h3 className="font-semibold">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        v{model.version} • {model.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(model.status)}>
                      {model.status.toUpperCase()}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditModel(model)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{model.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{model.loss.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">Loss</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{model.avgResponseTime}ms</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{formatParameters(model.parameters)}</div>
                    <div className="text-xs text-muted-foreground">Parameters</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>GPU Usage</span>
                      <span>{model.gpuUtilization}%</span>
                    </div>
                    <Progress value={model.gpuUtilization} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory</span>
                      <span>{model.memoryUsage} GB</span>
                    </div>
                    <Progress value={(model.memoryUsage / 8) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Model Size</span>
                      <span>{formatModelSize(model.modelSize)}</span>
                    </div>
                    <Progress value={(model.modelSize / 500) * 100} className="h-2" />
                  </div>
                </div>

                {model.status === 'training' && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Training Progress</span>
                      <span>{model.trainingProgress}%</span>
                    </div>
                    <Progress value={model.trainingProgress} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Jobs */}
      {trainingJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Training Jobs
            </CardTitle>
            <CardDescription>
              Monitorizare training-ului modelelor AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTrainingStatusColor(job.status)}`}></div>
                      <div>
                        <h4 className="font-semibold">Training Job #{job.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          Model: {models.find(m => m.id === job.modelId)?.name}
                        </p>
                      </div>
                    </div>
                    <Badge className={getTrainingStatusColor(job.status)}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Epochs</span>
                        <span>{job.currentEpoch} / {job.totalEpochs}</span>
                      </div>
                      <Progress value={(job.currentEpoch / job.totalEpochs) * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Loss:</span>
                      <span className="ml-2 font-semibold">{job.currentLoss.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Accuracy:</span>
                      <span className="ml-2 font-semibold">{job.currentAccuracy.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">GPU Usage:</span>
                      <span className="ml-2 font-semibold">{job.gpuUsage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Inference Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Inference Requests
          </CardTitle>
          <CardDescription>
            Ultimele cereri de inferență și performanța lor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inferenceRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${request.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-medium">
                      {models.find(m => m.id === request.modelId)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Response: {request.responseTime}ms
                  </span>
                  {request.confidence && (
                    <span className="text-muted-foreground">
                      Confidence: {(request.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                  <Badge variant={request.success ? 'default' : 'destructive'}>
                    {request.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Model Dialog */}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New AI Model</DialogTitle>
            <DialogDescription>
              Add a new AI model to your engine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newModelData.name}
                onChange={(e) => setNewModelData({ ...newModelData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">
                Version
              </Label>
              <Input
                id="version"
                value={newModelData.version}
                onChange={(e) => setNewModelData({ ...newModelData, version: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select onValueChange={(value) => setNewModelData({ ...newModelData, type: value as AIModel['type'] })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="nlp">NLP</SelectItem>
                  <SelectItem value="vision">Vision</SelectItem>
                  <SelectItem value="reinforcement">Reinforcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parameters" className="text-right">
                Parameters
              </Label>
              <Input
                id="parameters"
                type="number"
                value={newModelData.parameters}
                onChange={(e) => setNewModelData({ ...newModelData, parameters: parseInt(e.target.value, 10) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelSize" className="text-right">
                Model Size (MB)
              </Label>
              <Input
                id="modelSize"
                type="number"
                value={newModelData.modelSize}
                onChange={(e) => setNewModelData({ ...newModelData, modelSize: parseInt(e.target.value, 10) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddModel} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Adding...' : 'Add Model'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={isEditModelOpen} onOpenChange={setIsEditModelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Model</DialogTitle>
            <DialogDescription>
              Edit the details of the AI model.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                Name
              </Label>
              <Input
                id="editName"
                value={editingModel?.name}
                onChange={(e) => setEditingModel({ ...editingModel!, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editVersion" className="text-right">
                Version
              </Label>
              <Input
                id="editVersion"
                value={editingModel?.version}
                onChange={(e) => setEditingModel({ ...editingModel!, version: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editType" className="text-right">
                Type
              </Label>
              <Select onValueChange={(value) => setEditingModel({ ...editingModel!, type: value as AIModel['type'] })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="nlp">NLP</SelectItem>
                  <SelectItem value="vision">Vision</SelectItem>
                  <SelectItem value="reinforcement">Reinforcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editParameters" className="text-right">
                Parameters
              </Label>
              <Input
                id="editParameters"
                type="number"
                value={editingModel?.parameters}
                onChange={(e) => setEditingModel({ ...editingModel!, parameters: parseInt(e.target.value, 10) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editModelSize" className="text-right">
                Model Size (MB)
              </Label>
              <Input
                id="editModelSize"
                type="number"
                value={editingModel?.modelSize}
                onChange={(e) => setEditingModel({ ...editingModel!, modelSize: parseInt(e.target.value, 10) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModelOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModel} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
