import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScreenshotUpload } from '@/components/ScreenshotUpload';
import { PromptEditor } from '@/components/PromptEditor';
import { AnalysisResults } from '@/components/AnalysisResults';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { ChartOverlay } from '@/components/ChartOverlay';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { AnalysisComparison } from '@/components/AnalysisComparison';
import { AIProviderSelector } from '@/components/AIProviderSelector';
import { analyzeScreenshot, analyzeScreenshotMultiAgent, getAnalysisHistory, getUserPrompts, saveUserPrompt } from '@/lib/serverComm';
import { 
  TradingAnalysis, 
  UserPrompt, 
  AIAnalysisResponse, 
  AnalysisRequest, 
  UploadProgress,
  DEFAULT_PROMPTS 
} from '@/types/analysis';
import { useAuth } from '@/lib/auth-context';
import { 
  Loader2, 
  Upload, 
  FileText, 
  History, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  Activity, 
  Play, 
  Pause, 
  RefreshCw,
  Eye,
  Sparkles,
  Lightbulb,
  Target as TargetIcon,
  Layers,
  GitCompare,
  BarChart4
} from 'lucide-react';
import HelpSystem from '@/components/HelpSystem';
import { UserHelp } from '@/components/UserHelpSystem';
import { getStoredAIPreferences } from '@/lib/preferences';
import { useNavigate } from 'react-router-dom';

interface TradingMetrics {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageConfidence: number;
  averageResponseTime: number;
  totalImagesProcessed: number;
  accuracyRate: number;
  trendingAccuracy: 'up' | 'down' | 'stable';
}

interface AnalysisStats {
  bullishSignals: number;
  bearishSignals: number;
  neutralSignals: number;
  highConfidenceAnalyses: number;
  lowConfidenceAnalyses: number;
  recentAccuracy: number;
}

export default function TradingAnalysisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPTS[0].content);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState<'intraday' | 'swing' | 'longTerm'>(() => {
    try {
      const saved = localStorage.getItem('selectedHorizon');
      if (saved === 'intraday' || saved === 'swing' || saved === 'longTerm') return saved;
    } catch {}
    return 'intraday';
  });
  React.useEffect(() => {
    try { localStorage.setItem('selectedHorizon', selectedHorizon); } catch {}
  }, [selectedHorizon]);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<TradingAnalysis[]>([]);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedAIProvider, setSelectedAIProvider] = useState<string>('ollama');
  const storedAIPrefs = getStoredAIPreferences();
  
  // New component states
  const [showChartOverlay, setShowChartOverlay] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<Array<{
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
  }>>([
    { id: 'image-upload', name: 'Image Upload', description: 'Processing and validating image', status: 'pending', progress: 0 },
    { id: 'chart-detection', name: 'Chart Detection', description: 'Detecting chart type and structure', status: 'pending', progress: 0 },
    { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Identifying technical patterns', status: 'pending', progress: 0 },
    { id: 'ai-analysis', name: 'AI Analysis', description: 'Running AI analysis algorithms', status: 'pending', progress: 0 },
    { id: 'signal-generation', name: 'Signal Generation', description: 'Generating trading signals', status: 'pending', progress: 0 },
    { id: 'final-compilation', name: 'Final Compilation', description: 'Compiling analysis report', status: 'pending', progress: 0 }
  ]);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  // Mock trading metrics for demonstration
  const [tradingMetrics] = useState<TradingMetrics>({
    totalAnalyses: 1247,
    successfulAnalyses: 1189,
    failedAnalyses: 58,
    averageConfidence: 87.3,
    averageResponseTime: 2.4,
    totalImagesProcessed: 1247,
    accuracyRate: 95.3,
    trendingAccuracy: 'up'
  });

  const [analysisStats] = useState<AnalysisStats>({
    bullishSignals: 423,
    bearishSignals: 312,
    neutralSignals: 512,
    highConfidenceAnalyses: 892,
    lowConfidenceAnalyses: 355,
    recentAccuracy: 96.7
  });

  // Load user prompts and analysis history on component mount
  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Live monitoring effect
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Here you would fetch real-time data
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  const loadUserData = async () => {
    try {
      const [promptsData, historyData] = await Promise.all([
        getUserPrompts(),
        getAnalysisHistory()
      ]);
      setUserPrompts(promptsData.prompts);
      setAnalysisHistory(historyData.analyses);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load your data. Please refresh the page.');
    }
  };

  const handleImageSelected = useCallback((file: File) => {
    setSelectedImage(file);
    setError(null);
    setUploadProgress({
      stage: 'uploading',
      progress: 0,
      message: 'Image selected successfully'
    });
  }, []);

  const handlePromptChange = useCallback((value: string) => {
    console.log('handlePromptChange called with:', value);
    console.log('Current prompt before change:', prompt);
    
    setPrompt(value);
    setError(null);
    // Clear active prompt when manually editing
    setActivePromptId(null);
    
    console.log('Prompt updated to:', value);
  }, []); // Remove prompt dependency to avoid infinite loops

  const handlePromptLoad = useCallback((promptId: string | '') => {
    if (promptId === '') {
      // Reset to default prompt
      setPrompt(DEFAULT_PROMPTS[0].content);
      setActivePromptId(null);
      setError(null);
      return;
    }
    
    const selectedPrompt = userPrompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      setPrompt(selectedPrompt.content);
      setActivePromptId(promptId);
      setError(null);
      // Switch to upload tab to show the loaded prompt
      setActiveTab('upload');
    }
  }, [userPrompts]);

  // Progress management functions
  const updateAnalysisStep = (stepId: string, status: 'pending' | 'processing' | 'completed' | 'error', progress: number = 0) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress }
        : step
    ));
  };

  const simulateAnalysisProgress = async () => {
    const stepDurations = [800, 1200, 1000, 1500, 800, 500]; // milliseconds per step
    
    for (let i = 0; i < analysisSteps.length; i++) {
      const step = analysisSteps[i];
      setCurrentAnalysisStep(step.id);
      updateAnalysisStep(step.id, 'processing', 0);
      
      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 10) {
        updateAnalysisStep(step.id, 'processing', progress);
        setOverallProgress(((i * 100) + progress) / analysisSteps.length);
        setEstimatedTimeRemaining(Math.max(0, (stepDurations[i] * (100 - progress) / 100) / 1000));
        await new Promise(resolve => setTimeout(resolve, stepDurations[i] / 10));
      }
      
      updateAnalysisStep(step.id, 'completed', 100);
    }
    
    setOverallProgress(100);
    setEstimatedTimeRemaining(0);
    setCurrentAnalysisStep('');
  };

  const resetAnalysisProgress = () => {
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, progress: 0 })));
    setOverallProgress(0);
    setEstimatedTimeRemaining(0);
    setCurrentAnalysisStep('');
  };

  const handlePromptSave = async (
    promptData: Omit<UserPrompt, 'id' | 'userId' | 'usageCount' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsSavingPrompt(true);
    try {
      const saved = await saveUserPrompt(promptData);
      const refreshed = await getUserPrompts();
      setUserPrompts(refreshed.prompts);
      if (saved?.id) {
        setActivePromptId(saved.id);
        if (saved.content) {
          setPrompt(saved.content);
        }
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setError('Failed to save prompt template');
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleAIProviderChange = useCallback((providerId: string) => {
    setSelectedAIProvider(providerId);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedImage || !prompt.trim()) {
      setError('Please select an image and enter a prompt');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    resetAnalysisProgress();
    
    setUploadProgress({
      stage: 'uploading',
      progress: 0,
      message: 'Starting analysis...'
    });

    try {
      // Start progress simulation
      simulateAnalysisProgress();
      
      const timeframeHint = selectedHorizon === 'intraday' ? '1m-1h'
        : selectedHorizon === 'swing' ? '4h-1d'
        : '1w-1M';
      const horizonInstruction = `\n\nHorizon: ${selectedHorizon} (timeframe guidance: ${timeframeHint}). Align all signals, risk, and entries to this horizon.`;
      const finalPrompt = `${prompt.trim()}${horizonInstruction}`;

      const request: AnalysisRequest = {
        image: selectedImage,
        prompt: finalPrompt
      };

      const result = await analyzeScreenshot(request);
      
      setAnalysisResult(result.result);
      setUploadProgress({
        stage: 'completed',
        progress: 100,
        message: 'Analysis completed successfully!'
      });

      // Refresh analysis history
      const historyData = await getAnalysisHistory();
      setAnalysisHistory(historyData.analyses);

      // Switch to results tab
      setActiveTab('results');

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      setUploadProgress(null);
      
      // Mark current step as error
      if (currentAnalysisStep) {
        updateAnalysisStep(currentAnalysisStep, 'error', 0);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeMultiAgent = async () => {
    if (!selectedImage || !prompt.trim()) {
      setError('Please select an image and enter a prompt');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    resetAnalysisProgress();
    setUploadProgress({ stage: 'uploading', progress: 0, message: 'Starting multi-agent analysis...' });

    try {
      simulateAnalysisProgress();

      const timeframeHint = selectedHorizon === 'intraday' ? '1m-1h'
        : selectedHorizon === 'swing' ? '4h-1d'
        : '1w-1M';
      const horizonInstruction = `\n\nHorizon: ${selectedHorizon} (timeframe guidance: ${timeframeHint}). Align all signals, risk, and entries to this horizon.`;
      const finalPrompt = `${prompt.trim()}${horizonInstruction}`;

      const request: AnalysisRequest = {
        image: selectedImage,
        prompt: finalPrompt
      };

      const multi = await analyzeScreenshotMultiAgent(request);

      const synthetic: AIAnalysisResponse = {
        success: true,
        analysis: {
          recommendation: multi.consensus.recommendation,
          confidence: Math.round((multi.consensus.confidence || 0) * 100),
          reasoning: multi.consensus.rationale,
          riskAssessment: 'Consensus-based risk not estimated',
          positionSizing: 'Use position sizing per individual agent if needed'
        },
        technicalIndicators: {
          trend: 'neutral',
          strength: 0,
          momentum: 'moderate',
          support: [],
          resistance: [],
          patterns: []
        },
        marketContext: {
          volatility: 'medium',
          volume: 'medium',
          marketSentiment: 'neutral',
          newsImpact: 'neutral'
        },
        processingTime: 0,
        modelVersion: 'multi-agent',
        timestamp: multi.timestamp,
        requestId: multi.requestId
      };

      setAnalysisResult(synthetic);
      setUploadProgress({ stage: 'completed', progress: 100, message: 'Multi-agent analysis completed!' });
      setActiveTab('results');
    } catch (err) {
      console.error('Multi-agent analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Multi-agent analysis failed');
      setUploadProgress(null);
      if (currentAnalysisStep) updateAnalysisStep(currentAnalysisStep, 'error', 0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHorizonClick = (h: 'intraday' | 'swing' | 'longTerm') => {
    setSelectedHorizon(h);
    if (selectedImage && prompt.trim()) {
      // Ensure state is flushed before using it in handleAnalyze
      setTimeout(() => {
        handleAnalyze();
      }, 0);
    } else {
      setActiveTab('upload');
      setError('Selectează o imagine și un prompt apoi pornește analiza. Orizontul este setat.');
    }
  };

  const handleNewAnalysis = () => {
    setSelectedImage(null);
    setPrompt(DEFAULT_PROMPTS[0].content);
    setAnalysisResult(null);
    setUploadProgress(null);
    setError(null);
    setActiveTab('upload');
  };

  const handleSelectHistoryItem = (analysis: TradingAnalysis) => {
    // For now, we'll just show the analysis ID
    // In a full implementation, you'd load the full analysis details
    setError(`Selected analysis: ${analysis.id}`);
  };

  const toggleLiveMonitoring = () => {
    setIsLiveMonitoring(!isLiveMonitoring);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TargetIcon className="w-8 h-8" />
            Trading Analysis Dashboard
          </h1>
          <p className="text-muted-foreground">
            Analiză AI avansată pentru screenshot-uri de trading cu monitorizare în timp real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HelpSystem feature="trading-analysis" variant="outline" size="sm" />
          <UserHelp
            type="tooltip"
            title="Monitorizare Live"
            description="Activează monitorizarea automată a pieței în timp real"
            tips={[
              'Monitorizează automat piețele la intervale regulate',
              'Primești notificări pentru oportunități noi',
              'Poți opri monitorizarea oricând'
            ]}
          >
            <Button
              variant={isLiveMonitoring ? "destructive" : "default"}
              onClick={toggleLiveMonitoring}
              className="flex items-center gap-2"
            >
              {isLiveMonitoring ? (
                <>
                  <Pause className="w-4 h-4" />
                  Oprește Monitorizarea
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Monitorizare Live
                </>
              )}
            </Button>
          </UserHelp>
          <UserHelp
            type="tooltip"
            title="Refresh Date"
            description="Actualizează toate datele și metricile"
            tips={[
              'Actualizează statisticile de performanță',
              'Reîncarcă istoricul analizelor',
              'Verifică status-ul serviciilor'
            ]}
          >
            <Button
              variant="outline"
              onClick={() => setLastUpdate(new Date())}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </UserHelp>
        </div>
      </div>

      {/* Trading Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Analize</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tradingMetrics.totalAnalyses}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {tradingMetrics.successfulAnalyses} reușite • {tradingMetrics.failedAnalyses} eșuate
            </p>
            <Progress value={tradingMetrics.accuracyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tradingMetrics.accuracyRate}%</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {tradingMetrics.trendingAccuracy === 'up' ? '↗ Trending Up' : tradingMetrics.trendingAccuracy === 'down' ? '↘ Trending Down' : '→ Stable'}
            </p>
            <Progress value={tradingMetrics.accuracyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Avg Confidence</CardTitle>
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tradingMetrics.averageConfidence}%</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {tradingMetrics.averageResponseTime}s response time
            </p>
            <Progress value={tradingMetrics.averageConfidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Images Processed</CardTitle>
            <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{tradingMetrics.totalImagesProcessed}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {analysisStats.highConfidenceAnalyses} high confidence
            </p>
            <Progress value={(analysisStats.highConfidenceAnalyses / tradingMetrics.totalAnalyses) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-800 dark:text-violet-200">AI Provider</CardTitle>
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {selectedAIProvider === 'ollama' ? 'Ollama' : selectedAIProvider === 'openai' ? 'OpenAI' : selectedAIProvider === 'anthropic' ? 'Anthropic' : selectedAIProvider}
            </div>
            <p className="text-xs text-violet-700 dark:text-violet-300">Provider activ pentru analize</p>
          </CardContent>
        </Card>
      </div>

      {/* Signal Distribution Overview */}
      <Card className="mb-6 border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
            <TrendingUp className="w-6 h-6" />
            Signal Distribution Overview
          </CardTitle>
          <CardDescription className="text-indigo-700 dark:text-indigo-300">
            Distribuția semnalelor de trading analizate de AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysisStats.bullishSignals}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Bullish Signals</div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {((analysisStats.bullishSignals / tradingMetrics.totalAnalyses) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analysisStats.bearishSignals}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Bearish Signals</div>
              <div className="text-xs text-red-600 dark:text-red-400">
                {((analysisStats.bearishSignals / tradingMetrics.totalAnalyses) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {analysisStats.neutralSignals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Neutral Signals</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {((analysisStats.neutralSignals / tradingMetrics.totalAnalyses) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Update Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>Ultima actualizare: {lastUpdate.toLocaleString()}</span>
        <span className="flex items-center gap-2">
          {isLiveMonitoring && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Monitorizare live activă
            </>
          )}
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prompt-uri
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Rezultate
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Istoric
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizon Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Alege Orizontul de Tranzacționare
                </CardTitle>
                <CardDescription>
                  Selectează stilul: Intraday, Swing sau Long‑Term. Va influența analiza AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {([
                    { key: 'intraday', title: 'Intraday', desc: 'Minute - Ore' },
                    { key: 'swing', title: 'Swing', desc: 'Zile - Săptămâni' },
                    { key: 'longTerm', title: 'Long‑Term', desc: 'Săptămâni - Luni' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleHorizonClick(opt.key)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedHorizon === opt.key
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-semibold">{opt.title}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Selectat: <span className="font-medium capitalize">{selectedHorizon}</span>. Preferința e salvată automat.
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Metrici de performanță pentru analizele AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>High Confidence Rate</span>
                    <span className="font-semibold">{((analysisStats.highConfidenceAnalyses / tradingMetrics.totalAnalyses) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(analysisStats.highConfidenceAnalyses / tradingMetrics.totalAnalyses) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recent Accuracy</span>
                    <span className="font-semibold">{analysisStats.recentAccuracy}%</span>
                  </div>
                  <Progress value={analysisStats.recentAccuracy} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-semibold">{((tradingMetrics.successfulAnalyses / tradingMetrics.totalAnalyses) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(tradingMetrics.successfulAnalyses / tradingMetrics.totalAnalyses) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Insights și recomandări pentru îmbunătățirea analizelor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">High Confidence Trend</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {analysisStats.highConfidenceAnalyses} din ultimele analize au avut confidență ridicată
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm">Accuracy Improvement</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Accuracy-ul a crescut cu 2.3% în ultima săptămână
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm">Model Performance</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Modelul AI procesează în medie {tradingMetrics.averageResponseTime}s per analiză
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Horizon Signals (compact) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Horizon Signals
                </CardTitle>
                <CardDescription>
                  Semnale Intraday / Swing / Long‑Term din ultima analiză
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(analysisResult?.horizonSignals || analysisHistory[0]?.aiResponse?.horizonSignals) ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['intraday','swing','longTerm'] as const).map((key) => {
                        const label = key === 'intraday' ? 'Intraday' : key === 'swing' ? 'Swing' : 'Long‑Term';
                        const source = analysisResult?.horizonSignals ? analysisResult.horizonSignals : (analysisHistory[0]?.aiResponse?.horizonSignals as any);
                        const signal = source[key];
                        const color = signal === 'buy' ? 'bg-green-100 text-green-800 border-green-200'
                                    : signal === 'sell' ? 'bg-red-100 text-red-800 border-red-200'
                                    : signal === 'hold' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200';
                        return (
                          <div key={key} className="p-3 border rounded-lg flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{label}</span>
                            <span className={`px-2 py-1 text-xs rounded-md border ${color}`}>{signal.toUpperCase()}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('history')}
                      >
                        View details
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nu există semnale pe orizonturi încă. Rulează o analiză în tabul „Upload”.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Încarcă Screenshot Trading</CardTitle>
              <CardDescription>
                Selectează o imagine de la platforma ta de trading pentru analiză
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UserHelp
                type="tooltip"
                title="Upload Screenshot"
                description="Încarcă o imagine cu chart-ul de trading pe care vrei să îl analizezi"
                tips={[
                  'Formate acceptate: PNG, JPG, JPEG',
                  'Dimensiune maximă: 10MB',
                  'Folosește imagini clare pentru rezultate mai bune'
                ]}
              >
                <ScreenshotUpload
                  onImageSelected={handleImageSelected}
                  onError={setError}
                  isLoading={isAnalyzing}
                />
              </UserHelp>

              <UserHelp
                type="tooltip"
                title="Editor Prompt-uri"
                description="Scrie instrucțiuni pentru AI despre ce să analizeze"
                tips={[
                  'Fii specific: "Analizează nivelurile de support/resistance"',
                  'Mentionează timeframe-ul: "1h, 4h, daily"',
                  'Specifică indicatorii: "RSI, MACD, Moving Averages"',
                  'Salvează prompt-urile utile pentru utilizare viitoare'
                ]}
              >
                <PromptEditor
                  value={prompt}
                  onChange={handlePromptChange}
                  onSave={handlePromptSave}
                  onLoad={handlePromptLoad}
                  savedPrompts={userPrompts}
                  isLoading={isAnalyzing || isSavingPrompt}
                  activePromptId={activePromptId}
                />
              </UserHelp>

              {/* AI Provider selection moved to AI tab to avoid redundancy */}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {uploadProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploadProgress.message}</span>
                    <span>{uploadProgress.progress}%</span>
                  </div>
                  <Progress value={uploadProgress.progress} />
                </div>
              )}

              <UserHelp
                type="tooltip"
                title="Analizează Screenshot"
                description="Lansează analiza AI a chart-ului de trading"
                tips={[
                  `Orizont selectat: ${selectedHorizon}. Poți schimba din Overview.`,
                  'Asigură-te că ai selectat o imagine și ai scris un prompt',
                  'Analiza durează 2-5 secunde',
                  'Rezultatele sunt salvate automat în istoric'
                ]}
              >
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!selectedImage || !prompt.trim() || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizează...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analizează Screenshot
                    </>
                  )}
                </Button>
              </UserHelp>
              <Button 
                onClick={handleAnalyzeMultiAgent} 
                disabled={!selectedImage || !prompt.trim() || isAnalyzing}
                variant="secondary"
                className="w-full"
              >
                Rulează Multi‑Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt-uri Salvate</CardTitle>
              <CardDescription>
                Gestionează template-urile tale pentru analize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPrompts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nu ai prompt-uri salvate încă. Creează primul tău template!
                  </p>
                ) : (
                  userPrompts.map((prompt) => (
                    <div key={prompt.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{prompt.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prompt.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {prompt.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-secondary rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResult ? (
            <AnalysisResults 
              analysis={analysisResult} 
              isLoading={false}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nu ai rezultate de analiză încă. Începe prin a încărca un screenshot!
                </p>
              </CardContent>
            </Card>
          )}
          
          {analysisResult && (
            <div className="flex gap-4">
              <Button onClick={handleNewAnalysis} variant="outline">
                Analiză Nouă
              </Button>
              <Button onClick={() => setActiveTab('history')}>
                Vezi Istoricul
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AnalysisHistory
            analyses={analysisHistory}
            onSelectAnalysis={handleSelectHistoryItem}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Analysis Progress Component */}
          {isAnalyzing && (
            <AnalysisProgress
              isActive={isAnalyzing}
              currentStep={currentAnalysisStep}
              steps={analysisSteps}
              overallProgress={overallProgress}
              estimatedTimeRemaining={estimatedTimeRemaining}
              onPause={() => console.log('Analysis paused')}
              onResume={() => console.log('Analysis resumed')}
              onCancel={() => {
                setIsAnalyzing(false);
                resetAnalysisProgress();
              }}
              onRetry={() => {
                resetAnalysisProgress();
                handleAnalyze();
              }}
            />
          )}

          {/* Chart Overlay Component */}
          {analysisResult && showChartOverlay && (
            <ChartOverlay
              imageUrl={selectedImage ? URL.createObjectURL(selectedImage) : ''}
              analysis={{
                recommendation: analysisResult.analysis?.recommendation || 'hold',
                confidence: analysisResult.analysis?.confidence || 75,
                reasoning: analysisResult.analysis?.reasoning || 'Analysis completed successfully',
                technicalIndicators: {
                  trend: analysisResult.technicalIndicators?.trend || 'neutral',
                  strength: analysisResult.technicalIndicators?.strength || 70,
                  support: analysisResult.technicalIndicators?.support || [],
                  resistance: analysisResult.technicalIndicators?.resistance || [],
                  patterns: analysisResult.technicalIndicators?.patterns || []
                },
                keyLevels: {
                  support: analysisResult.technicalIndicators?.support?.map(s => parseFloat(s)) || [100, 95, 90],
                  resistance: analysisResult.technicalIndicators?.resistance?.map(s => parseFloat(s)) || [110, 115, 120],
                  pivot: [105]
                }
              }}
              onToggleOverlay={setShowChartOverlay}
            />
          )}

          {/* Analysis Comparison Component */}
          {analysisHistory.length > 0 && (
            <AnalysisComparison
              analyses={analysisHistory.map(analysis => ({
                id: analysis.id,
                imageUrl: analysis.imageUrl || '',
                timestamp: analysis.createdAt,
                recommendation: analysis.recommendation || 'hold',
                confidence: analysis.confidenceLevel || 75,
                reasoning: analysis.aiResponse?.analysis?.reasoning || 'Analysis completed',
                technicalIndicators: {
                  trend: analysis.technicalIndicators?.trend || 'neutral',
                  strength: analysis.technicalIndicators?.strength || 70,
                  patterns: analysis.technicalIndicators?.patterns || []
                },
                keyLevels: {
                  support: analysis.technicalIndicators?.support?.map(s => parseFloat(s)) || [],
                  resistance: analysis.technicalIndicators?.resistance?.map(s => parseFloat(s)) || [],
                  pivot: []
                }
              }))}
              onClose={() => setShowComparison(false)}
            />
          )}

          {/* Advanced Analysis Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Advanced Analysis Tools
              </CardTitle>
              <CardDescription>
                Instrumente avansate pentru analiza și compararea chart-urilor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowChartOverlay(!showChartOverlay)}
                  disabled={!analysisResult}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showChartOverlay ? 'Hide' : 'Show'} Chart Overlay
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                  disabled={analysisHistory.length === 0}
                  className="flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4" />
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/v1/ai-test', '_blank')}
                  className="flex items-center gap-2"
                >
                  <BarChart4 className="w-4 h-4" />
                  Test AI Engine
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Advanced Features Available:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• <strong>Chart Overlay:</strong> Vizualizează analiza AI suprapusă pe chart-ul original</li>
                  <li>• <strong>Real-time Progress:</strong> Urmărește progresul analizei pas cu pas</li>
                  <li>• <strong>Analysis Comparison:</strong> Compară multiple analize side-by-side</li>
                  <li>• <strong>AI Engine Testing:</strong> Testează și monitorizează performanța AI</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Settings
              </CardTitle>
              <CardDescription>
                Configurează providerul și opțiunile AI folosite în analize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 border rounded-md">
                  <div className="text-muted-foreground">Model</div>
                  <div className="font-semibold">{storedAIPrefs.model}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-muted-foreground">Temperature</div>
                  <div className="font-semibold">{storedAIPrefs.temperature}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-muted-foreground">Max Tokens</div>
                  <div className="font-semibold">{storedAIPrefs.maxTokens}</div>
                </div>
              </div>
              <AIProviderSelector
                selectedProvider={selectedAIProvider}
                onProviderChange={handleAIProviderChange}
                onAnalysisStart={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
              <Alert>
                <AlertDescription>
                  Setările AI sunt centralizate. Modifică modelul/temperatura în Settings → AI Settings.
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={() => navigate('/settings?tab=ai')}>
                Deschide AI Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
