import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Eye, 
  Target, 
  TrendingUp, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Loader2,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

interface AnalysisProgressProps {
  isActive: boolean;
  currentStep: string;
  steps: AnalysisStep[];
  overallProgress: number;
  estimatedTimeRemaining: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function AnalysisProgress({
  isActive,
  currentStep,
  steps,
  overallProgress,
  estimatedTimeRemaining,
  onPause,
  onResume,
  onCancel,
  onRetry,
  className = ''
}: AnalysisProgressProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Update elapsed time
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Update current step index
  useEffect(() => {
    const index = steps.findIndex(step => step.id === currentStep);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  }, [currentStep, steps]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepColor = (step: AnalysisStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  };

  const handleRetry = () => {
    setElapsedTime(0);
    setIsPaused(false);
    onRetry?.();
  };

  const getStepDescription = (stepId: string): string => {
    const descriptions: Record<string, string> = {
      'image-upload': 'Processing and validating uploaded image',
      'chart-detection': 'Detecting chart type and structure',
      'pattern-recognition': 'Identifying technical patterns and indicators',
      'ai-analysis': 'Running AI analysis with advanced algorithms',
      'signal-generation': 'Generating trading signals and recommendations',
      'risk-assessment': 'Calculating risk levels and position sizing',
      'final-compilation': 'Compiling final analysis report'
    };
    return descriptions[stepId] || 'Processing step';
  };

  return (
    <div className={`analysis-progress ${className}`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Analysis Progress
            {isActive && (
              <Badge variant="secondary" className="ml-2">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Elapsed: {formatTime(elapsedTime)}</span>
              <span>ETA: {formatTime(estimatedTimeRemaining)}</span>
            </div>
          </div>

          {/* Current Step Highlight */}
          {currentStep && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="font-semibold text-blue-900">
                    Currently Processing: {steps.find(s => s.id === currentStep)?.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {getStepDescription(currentStep)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step-by-Step Progress */}
          <div className="space-y-3">
            <h4 className="font-semibold">Analysis Steps</h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 border rounded-lg transition-all duration-300 ${getStepColor(step)} ${
                    step.id === currentStep ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStepIcon(step)}
                      <div>
                        <h5 className="font-medium text-sm">{step.name}</h5>
                        <p className="text-xs text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.status === 'processing' && (
                        <div className="w-20">
                          <Progress value={step.progress} className="h-2" />
                        </div>
                      )}
                      <Badge
                        variant={step.status === 'completed' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          step.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : step.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Step Progress Bar */}
                  {step.status === 'processing' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress: {step.progress}%</span>
                        {step.duration && <span>Duration: {formatTime(step.duration)}</span>}
                      </div>
                      <Progress value={step.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-xs text-gray-600">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs text-gray-600">Elapsed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(estimatedTimeRemaining)}
              </div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {steps.filter(s => s.status === 'completed').length}/{steps.length}
              </div>
              <div className="text-xs text-gray-600">Steps Done</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                disabled={!isActive}
                className="flex items-center gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={!isActive}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </Button>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              disabled={!isActive}
              className="flex items-center gap-2"
            >
              Cancel Analysis
            </Button>
          </div>

          {/* Status Messages */}
          {isActive && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-800">
                  AI Engine is actively analyzing your chart. This process typically takes 2-5 seconds.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
