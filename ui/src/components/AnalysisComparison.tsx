import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Download,
  Share2,
  Plus,
  X
} from 'lucide-react';
import { pwaManager } from '@/lib/pwa-manager';

interface AnalysisResult {
  id: string;
  imageUrl: string;
  timestamp: string;
  recommendation: 'buy' | 'sell' | 'hold' | 'wait';
  confidence: number;
  reasoning: string;
  technicalIndicators: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    patterns: string[];
  };
  keyLevels?: {
    support: number[];
    resistance: number[];
  };
}

interface AnalysisComparisonProps {
  analyses: AnalysisResult[];
  onClose?: () => void;
  className?: string;
}

export function AnalysisComparison({ 
  analyses, 
  onClose,
  className = '' 
}: AnalysisComparisonProps) {
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'summary'>('side-by-side');
  const [isSharing, setIsSharing] = useState(false);

  const handleAnalysisToggle = (analysisId: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId) 
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'buy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sell': return 'bg-red-100 text-red-800 border-red-200';
      case 'hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'wait': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleShareResults = useCallback(async () => {
    const selected = analyses.filter(a => selectedAnalyses.includes(a.id));
    if (selected.length === 0) return;

    const title = 'TechAnal - Analysis Comparison';
    const text = `Comparație pentru ${selected.length} analize (${selected.map(a => a.recommendation).join(', ')})`;
    const url = window.location.href;

    try {
      setIsSharing(true);
      const ok = await pwaManager.shareData({ title, text, url });
      if (ok) return;
    } catch {}
    finally {
      setIsSharing(false);
    }

    try {
      await navigator.clipboard?.writeText(`${title}: ${url}`);
    } catch {}
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  }, [analyses, selectedAnalyses]);

  const renderSideBySideView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {selectedAnalyses.map(analysisId => {
        const analysis = analyses.find(a => a.id === analysisId);
        if (!analysis) return null;

        return (
          <Card key={analysis.id} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Analysis {analysis.id}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {new Date(analysis.timestamp).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chart Image */}
              <div className="relative border rounded-lg overflow-hidden">
                <img 
                  src={analysis.imageUrl} 
                  alt="Chart analysis" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getRecommendationColor(analysis.recommendation)}>
                    {analysis.recommendation.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getConfidenceColor(analysis.confidence)}`}>
                    {analysis.confidence}%
                  </div>
                  <div className="text-xs text-gray-600">Confidence</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(analysis.technicalIndicators.trend)}
                    <span className="text-lg font-bold capitalize">
                      {analysis.technicalIndicators.trend}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">Trend</div>
                </div>
              </div>

              {/* Key Levels */}
              {analysis.keyLevels && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Key Levels</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {analysis.keyLevels.support && (
                      <div>
                        <p className="text-xs text-gray-600">Support:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keyLevels.support.map((level, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.keyLevels.resistance && (
                      <div>
                        <p className="text-xs text-gray-600">Resistance:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keyLevels.resistance.map((level, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700 text-xs">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Patterns */}
              <div>
                <h5 className="font-semibold text-sm mb-2">Detected Patterns</h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.technicalIndicators.patterns.map((pattern, index) => (
                    <Badge key={index} variant="secondary">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h5 className="font-semibold text-sm mb-2">Reasoning</h5>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded text-xs">
                  {analysis.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderSummaryView = () => {
    const selectedAnalysisData = analyses.filter(a => selectedAnalyses.includes(a.id));
    
    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedAnalysisData.length}
                </div>
                <div className="text-xs text-gray-600">Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedAnalysisData.filter(a => a.recommendation === 'buy').length}
                </div>
                <div className="text-xs text-gray-600">Buy Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {selectedAnalysisData.filter(a => a.recommendation === 'sell').length}
                </div>
                <div className="text-xs text-gray-600">Sell Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(selectedAnalysisData.reduce((sum, a) => sum + a.confidence, 0) / selectedAnalysisData.length)}
                </div>
                <div className="text-xs text-gray-600">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['buy', 'sell', 'hold', 'wait'].map(recommendation => {
                const count = selectedAnalysisData.filter(a => a.recommendation === recommendation).length;
                const percentage = selectedAnalysisData.length > 0 ? (count / selectedAnalysisData.length) * 100 : 0;
                
                return (
                  <div key={recommendation} className="flex items-center gap-3">
                    <Badge className={getRecommendationColor(recommendation)}>
                      {recommendation.toUpperCase()}
                    </Badge>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          recommendation === 'buy' ? 'bg-green-500' :
                          recommendation === 'sell' ? 'bg-red-500' :
                          recommendation === 'hold' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['bullish', 'bearish', 'neutral'].map(trend => {
                const count = selectedAnalysisData.filter(a => a.technicalIndicators.trend === trend).length;
                const percentage = selectedAnalysisData.length > 0 ? (count / selectedAnalysisData.length) * 100 : 0;
                
                return (
                  <div key={trend} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getTrendIcon(trend)}
                      <span className="font-semibold capitalize">{trend}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-xs text-gray-600">{Math.round(percentage)}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`analysis-comparison ${className}`}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analysis Comparison
              {selectedAnalyses.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedAnalyses.length} selected
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Selection */}
          <div className="space-y-3">
            <h4 className="font-semibold">Select Analyses to Compare</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {analyses.map(analysis => (
                <Button
                  key={analysis.id}
                  variant={selectedAnalyses.includes(analysis.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAnalysisToggle(analysis.id)}
                  className="flex items-center gap-2 h-auto p-3"
                >
                  <div className="flex flex-col items-center text-center">
                    <img 
                      src={analysis.imageUrl} 
                      alt="Chart" 
                      className="w-12 h-12 object-cover rounded mb-1"
                    />
                    <span className="text-xs">
                      {analysis.recommendation.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-600">
                      {analysis.confidence}%
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode Selection */}
          {selectedAnalyses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">View Mode</h4>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                  <TabsTrigger value="overlay">Overlay</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="side-by-side" className="mt-4">
                  {renderSideBySideView()}
                </TabsContent>
                
                <TabsContent value="overlay" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Overlay view coming soon...</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="summary" className="mt-4">
                  {renderSummaryView()}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Actions */}
          {selectedAnalyses.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Comparison
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShareResults}
                  disabled={isSharing}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {isSharing ? 'Sharing…' : 'Share Results'}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {selectedAnalyses.length} analyses selected for comparison
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
