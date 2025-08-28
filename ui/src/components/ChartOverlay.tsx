import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ChartOverlayProps {
  imageUrl: string;
  analysis: {
    recommendation: 'buy' | 'sell' | 'hold' | 'wait';
    confidence: number;
    reasoning: string;
    technicalIndicators: {
      trend: 'bullish' | 'bearish' | 'neutral';
      strength: number;
      support: string[];
      resistance: string[];
      patterns: string[];
    };
    keyLevels?: {
      support: number[];
      resistance: number[];
      pivot: number[];
    };
  };
  onToggleOverlay?: (visible: boolean) => void;
  className?: string;
}

interface OverlayElement {
  id: string;
  type: 'support' | 'resistance' | 'pattern' | 'signal';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  confidence?: number;
}

export function ChartOverlay({ 
  imageUrl, 
  analysis, 
  onToggleOverlay,
  className = '' 
}: ChartOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [overlayElements, setOverlayElements] = useState<OverlayElement[]>([]);
  const [hoveredElement, setHoveredElement] = useState<OverlayElement | null>(null);

  // Generate overlay elements based on analysis
  useEffect(() => {
    if (!analysis) return;

    const elements: OverlayElement[] = [];
    
    // Add support levels
    if (analysis.keyLevels?.support) {
      analysis.keyLevels.support.forEach((level, index) => {
        elements.push({
          id: `support-${index}`,
          type: 'support',
          x: 50 + (index * 100),
          y: 300 - (index * 20),
          width: 80,
          height: 2,
          label: `Support: ${level}`,
          color: '#10b981', // Green
          confidence: 85
        });
      });
    }

    // Add resistance levels
    if (analysis.keyLevels?.resistance) {
      analysis.keyLevels.resistance.forEach((level, index) => {
        elements.push({
          id: `resistance-${index}`,
          type: 'resistance',
          x: 50 + (index * 100),
          y: 100 + (index * 20),
          width: 80,
          height: 2,
          label: `Resistance: ${level}`,
          color: '#ef4444', // Red
          confidence: 85
        });
      });
    }

    // Add pattern indicators
    if (analysis.technicalIndicators.patterns) {
      analysis.technicalIndicators.patterns.forEach((pattern, index) => {
        elements.push({
          id: `pattern-${index}`,
          type: 'pattern',
          x: 200 + (index * 120),
          y: 150 + (index * 30),
          width: 100,
          height: 60,
          label: pattern,
          color: '#8b5cf6', // Purple
          confidence: 80
        });
      });
    }

    // Add main signal
    elements.push({
      id: 'main-signal',
      type: 'signal',
      x: 400,
      y: 50,
      width: 120,
      height: 40,
      label: `${analysis.recommendation.toUpperCase()} (${analysis.confidence}%)`,
      color: getSignalColor(analysis.recommendation),
      confidence: analysis.confidence
    });

    setOverlayElements(elements);
  }, [analysis]);

  // Draw overlay on canvas
  useEffect(() => {
    if (!canvasRef.current || !showOverlay) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw overlay elements
    overlayElements.forEach(element => {
      drawOverlayElement(ctx, element);
    });

    // Draw hover tooltip
    if (hoveredElement) {
      drawTooltip(ctx, hoveredElement);
    }
  }, [overlayElements, showOverlay, hoveredElement]);

  const drawOverlayElement = (ctx: CanvasRenderingContext2D, element: OverlayElement) => {
    ctx.save();
    
    // Set styles
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    switch (element.type) {
      case 'support':
        // Draw horizontal support line
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + element.width, element.y);
        ctx.stroke();
        
        // Draw label
        ctx.fillText(element.label, element.x, element.y - 5);
        break;

      case 'resistance':
        // Draw horizontal resistance line
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + element.width, element.y);
        ctx.stroke();
        
        // Draw label
        ctx.fillText(element.label, element.x, element.y - 5);
        break;

      case 'pattern':
        // Draw pattern box
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        ctx.fillText(element.label, element.x + 5, element.y + 20);
        break;

      case 'signal':
        // Draw signal badge
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(element.label, element.x + 10, element.y + 25);
        break;
    }

    ctx.restore();
  };

  const drawTooltip = (ctx: CanvasRenderingContext2D, element: OverlayElement) => {
    const tooltipWidth = 200;
    const tooltipHeight = 80;
    const x = element.x + element.width + 10;
    const y = element.y;

    // Draw tooltip background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(x, y, tooltipWidth, tooltipHeight);
    
    // Draw tooltip border
    ctx.strokeStyle = element.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);

    // Draw tooltip content
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Type: ${element.type}`, x + 10, y + 20);
    ctx.fillText(`Label: ${element.label}`, x + 10, y + 35);
    if (element.confidence) {
      ctx.fillText(`Confidence: ${element.confidence}%`, x + 10, y + 50);
    }
  };

  const getSignalColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'buy': return '#10b981'; // Green
      case 'sell': return '#ef4444'; // Red
      case 'hold': return '#f59e0b'; // Yellow
      case 'wait': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is on an overlay element
    const clickedElement = overlayElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );

    if (clickedElement) {
      setHoveredElement(clickedElement);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find hovered element
    const element = overlayElements.find(el => 
      x >= el.x && x <= el.x + el.width &&
      y >= el.y && y <= el.y + el.height
    );

    setHoveredElement(element || null);
  };

  const toggleOverlay = () => {
    const newState = !showOverlay;
    setShowOverlay(newState);
    onToggleOverlay?.(newState);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'chart-analysis.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`chart-overlay ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Chart Analysis Overlay
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleOverlay}
              className="flex items-center gap-2"
            >
              {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showOverlay ? 'Hide' : 'Show'} Overlay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-2"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${getSignalColor(analysis.recommendation)}`}></div>
              <div>
                <p className="text-sm font-medium">Signal</p>
                <p className="text-lg font-bold capitalize">{analysis.recommendation}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Confidence</p>
                <p className="text-lg font-bold">{analysis.confidence}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {getTrendIcon(analysis.technicalIndicators.trend)}
              <div>
                <p className="text-sm font-medium">Trend</p>
                <p className="text-lg font-bold capitalize">{analysis.technicalIndicators.trend}</p>
              </div>
            </div>
          </div>

          {/* Chart with Overlay */}
          <div className="relative border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-auto cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Overlay Legend */}
            {showOverlay && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
                <h4 className="font-semibold text-sm mb-2">Overlay Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Support Levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Resistance Levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Patterns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Signals</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Key Levels</h4>
              <div className="space-y-2">
                {analysis.keyLevels?.support && (
                  <div>
                    <p className="text-sm text-gray-600">Support:</p>
                    <div className="flex gap-2">
                      {analysis.keyLevels.support.map((level, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.keyLevels?.resistance && (
                  <div>
                    <p className="text-sm text-gray-600">Resistance:</p>
                    <div className="flex gap-2">
                      {analysis.keyLevels.resistance.map((level, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Detected Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.technicalIndicators.patterns.map((pattern, index) => (
                  <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700">
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <h4 className="font-semibold mb-2">Analysis Reasoning</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {analysis.reasoning}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
