import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartOverlay } from './ChartOverlay';
import { AnalysisProgress } from './AnalysisProgress';
import { AnalysisComparison } from './AnalysisComparison';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

// Mock data for demo
const mockAnalysis = {
  recommendation: 'buy' as const,
  confidence: 87,
  reasoning: 'Strong bullish momentum detected with clear support at key levels. RSI indicates oversold conditions and MACD shows positive divergence. Volume confirms the upward trend.',
  technicalIndicators: {
    trend: 'bullish' as const,
    strength: 85,
    support: ['Support Level 1', 'Support Level 2'],
    resistance: ['Resistance Level 1', 'Resistance Level 2'],
    patterns: ['Double Bottom', 'Bull Flag', 'Golden Cross']
  },
  keyLevels: {
    support: [100, 95, 90],
    resistance: [110, 115, 120],
    pivot: [105]
  }
};

const mockAnalyses = [
  {
    id: '1',
    imageUrl: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Chart+1',
    timestamp: '2024-01-15T10:30:00Z',
    recommendation: 'buy' as const,
    confidence: 87,
    reasoning: 'Strong bullish momentum with clear support levels',
    technicalIndicators: {
      trend: 'bullish' as const,
      strength: 85,
      patterns: ['Double Bottom', 'Bull Flag']
    },
    keyLevels: {
      support: [100, 95],
      resistance: [110, 115],
      pivot: [105]
    }
  },
  {
    id: '2',
    imageUrl: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Chart+2',
    timestamp: '2024-01-14T15:45:00Z',
    recommendation: 'sell' as const,
    confidence: 78,
    reasoning: 'Bearish reversal pattern forming at resistance',
    technicalIndicators: {
      trend: 'bearish' as const,
      strength: 72,
      patterns: ['Head and Shoulders', 'Death Cross']
    },
    keyLevels: {
      support: [90, 85],
      resistance: [105, 110],
      pivot: [100]
    }
  },
  {
    id: '3',
    imageUrl: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Chart+3',
    timestamp: '2024-01-13T09:15:00Z',
    recommendation: 'hold' as const,
    confidence: 65,
    reasoning: 'Mixed signals with consolidation pattern',
    technicalIndicators: {
      trend: 'neutral' as const,
      strength: 60,
      patterns: ['Triangle', 'Sideways Channel']
    },
    keyLevels: {
      support: [95, 90],
      resistance: [105, 110],
      pivot: [100]
    }
  }
];

const mockSteps = [
  { id: 'image-upload', name: 'Image Upload', description: 'Processing and validating image', status: 'completed' as const, progress: 100 },
  { id: 'chart-detection', name: 'Chart Detection', description: 'Detecting chart type and structure', status: 'completed' as const, progress: 100 },
  { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Identifying technical patterns', status: 'completed' as const, progress: 100 },
  { id: 'ai-analysis', name: 'AI Analysis', description: 'Running AI analysis algorithms', status: 'processing' as const, progress: 65 },
  { id: 'signal-generation', name: 'Signal Generation', description: 'Generating trading signals', status: 'pending' as const, progress: 0 },
  { id: 'final-compilation', name: 'Final Compilation', description: 'Compiling analysis report', status: 'pending' as const, progress: 0 }
];

export function ComponentDemo() {
  const [showChartOverlay, setShowChartOverlay] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showErrorDemo, setShowErrorDemo] = useState(false);

  const triggerError = () => {
    throw new Error('This is a demo error to showcase the EnhancedErrorBoundary component!');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TechAnal Advanced Components Demo
        </h1>
        <p className="text-xl text-gray-600">
          Showcasing the new User Experience improvements and advanced features
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Component Demo Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowChartOverlay(!showChartOverlay)}
              className="flex items-center gap-2"
            >
              {showChartOverlay ? 'Hide' : 'Show'} Chart Overlay
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowProgress(!showProgress)}
              className="flex items-center gap-2"
            >
              {showProgress ? 'Hide' : 'Show'} Progress
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowErrorDemo(!showErrorDemo)}
              className="flex items-center gap-2"
            >
              {showErrorDemo ? 'Hide' : 'Show'} Error Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Overlay Demo */}
      {showChartOverlay && (
        <Card>
          <CardHeader>
            <CardTitle>Chart Overlay Component Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartOverlay
              imageUrl="https://via.placeholder.com/800x400/1f2937/ffffff?text=Trading+Chart+Demo"
              analysis={mockAnalysis}
              onToggleOverlay={setShowChartOverlay}
            />
          </CardContent>
        </Card>
      )}

      {/* Analysis Progress Demo */}
      {showProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Progress Component Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalysisProgress
              isActive={true}
              currentStep="ai-analysis"
              steps={mockSteps}
              overallProgress={65}
              estimatedTimeRemaining={8}
              onPause={() => console.log('Paused')}
              onResume={() => console.log('Resumed')}
              onCancel={() => setShowProgress(false)}
              onRetry={() => console.log('Retry')}
            />
          </CardContent>
        </Card>
      )}

      {/* Analysis Comparison Demo */}
      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Comparison Component Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalysisComparison
              analyses={mockAnalyses}
              onClose={() => setShowComparison(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Error Boundary Demo */}
      {showErrorDemo && (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Error Boundary Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Click the button below to trigger an error and see how the EnhancedErrorBoundary handles it:
            </p>
            <EnhancedErrorBoundary>
              <Button onClick={triggerError} variant="destructive">
                Trigger Demo Error
              </Button>
            </EnhancedErrorBoundary>
          </CardContent>
        </Card>
      )}

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle>New Features Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Chart Overlay Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Interactive support/resistance lines</li>
                <li>• Pattern detection visualization</li>
                <li>• Signal badges with confidence levels</li>
                <li>• Hover tooltips with detailed information</li>
                <li>• Fullscreen mode and download functionality</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Progress Tracking Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time step-by-step progress</li>
                <li>• Performance metrics and efficiency tracking</li>
                <li>• Pause/Resume functionality</li>
                <li>• Retry mechanisms and error handling</li>
                <li>• Estimated time remaining calculations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Comparison Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Side-by-side analysis comparison</li>
                <li>• Summary statistics and distribution charts</li>
                <li>• Trend analysis aggregation</li>
                <li>• Pattern recognition comparison</li>
                <li>• Export and sharing options</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Error Handling Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Automatic error categorization</li>
                <li>• Personalized solution suggestions</li>
                <li>• Error reporting with unique IDs</li>
                <li>• Copy/Download error details</li>
                <li>• Professional error UI with clear actions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Chart Overlay Component</span>
              <span className="text-sm text-green-600">✓ Integrated</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Analysis Progress Component</span>
              <span className="text-sm text-green-600">✓ Integrated</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Analysis Comparison Component</span>
              <span className="text-sm text-green-600">✓ Integrated</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Enhanced Error Boundary</span>
              <span className="text-sm text-green-600">✓ Integrated</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Advanced Tab in Trading Analysis</span>
              <span className="text-sm text-blue-600">✓ Integrated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
