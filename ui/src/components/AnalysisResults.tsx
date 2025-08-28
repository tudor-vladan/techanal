import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AnalysisResultsProps } from '@/types/analysis';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react';

export function AnalysisResults({ analysis, isLoading }: AnalysisResultsProps) {
  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'sell':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      case 'hold':
        return <Minus className="w-6 h-6 text-yellow-600" />;
      case 'wait':
        return <BarChart3 className="w-6 h-6 text-blue-600" />;
      default:
        return <BarChart3 className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sell':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'Cumpără';
      case 'sell':
        return 'Vinde';
      case 'hold':
        return 'Ține';
      default:
        return 'Necunoscut';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Înaltă';
    if (confidence >= 0.6) return 'Medie';
    return 'Scăzută';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Se procesează rezultatele...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Recommendation */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {getRecommendationIcon(analysis.analysis.recommendation)}
            <Badge 
              variant="outline" 
              className={`text-lg px-4 py-2 ${getRecommendationColor(analysis.analysis.recommendation)}`}
            >
              {getRecommendationText(analysis.analysis.recommendation).toUpperCase()}
            </Badge>
          </div>
          <CardTitle className="text-2xl">
            Recomandare: {getRecommendationText(analysis.analysis.recommendation)}
          </CardTitle>
          <CardDescription>
            Analiza AI a screenshot-ului de trading
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Nivel de Încredere</span>
                <span className={`font-semibold ${getConfidenceColor(analysis.analysis.confidence / 100)}`}>
                  {getConfidenceText(analysis.analysis.confidence / 100)} ({analysis.analysis.confidence}%)
                </span>
              </div>
              <Progress value={analysis.analysis.confidence} className="h-3" />
            </div>
            
            {analysis.analysis.positionSizing && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Recomandare Poziție</span>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.analysis.positionSizing}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Levels */}
      {(analysis.analysis.stopLoss || analysis.analysis.takeProfit) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Niveluri de Preț
            </CardTitle>
            <CardDescription>
              Nivelurile sugerate pentru stop-loss și take-profit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.analysis.stopLoss && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-sm">Stop Loss</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{analysis.analysis.stopLoss}</p>
                  <p className="text-xs text-muted-foreground">Nivel de protecție împotriva pierderilor</p>
                </div>
              )}
              
              {analysis.analysis.takeProfit && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Take Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{analysis.analysis.takeProfit}</p>
                  <p className="text-xs text-muted-foreground">Nivel țintă pentru profit</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analiza Tehnică
          </CardTitle>
          <CardDescription>
            Analiza detaliată a indicatorilor tehnici
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {analysis.analysis.reasoning}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Justificarea Recomandării
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.analysis.reasoning}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Evaluarea Riscului
          </CardTitle>
          <CardDescription>
            Analiza riscurilor și recomandări de management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {analysis.analysis.riskAssessment}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      {analysis.technicalIndicators && Object.keys(analysis.technicalIndicators).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Indicatori Tehnici</CardTitle>
            <CardDescription>
              Valorile indicatorilor identificați în analiză
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysis.technicalIndicators).map(([key, value]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-lg font-semibold">
                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              ⚠️ <strong>Atenție:</strong> Această analiză este generată de AI și nu constituie sfat financiar.
            </p>
            <p>
              Întotdeauna faci propriile cercetări și consultă un consultant financiar înainte de a lua decizii de trading.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
