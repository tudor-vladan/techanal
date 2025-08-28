import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye
} from 'lucide-react';
import { AnalysisHistoryProps } from '@/types/analysis';

export function AnalysisHistory({ analyses, onSelectAnalysis, isLoading = false }: AnalysisHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'recommendation'>('date');

  const filteredAndSortedAnalyses = useMemo(() => {
    let filtered = analyses.filter(analysis => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        analysis.userPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.originalFilename.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || analysis.analysisStatus === statusFilter;
      
      // Recommendation filter
      const matchesRecommendation = recommendationFilter === 'all' || 
        analysis.recommendation === recommendationFilter;
      
      return matchesSearch && matchesStatus && matchesRecommendation;
    });

    // Sort analyses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'confidence':
          return (b.confidenceLevel || 0) - (a.confidenceLevel || 0);
        case 'recommendation':
          const recOrder = { 'buy': 3, 'sell': 2, 'hold': 1 };
          return (recOrder[b.recommendation as keyof typeof recOrder] || 0) - 
                 (recOrder[a.recommendation as keyof typeof recOrder] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [analyses, searchTerm, statusFilter, recommendationFilter, sortBy]);

  const getRecommendationIcon = (recommendation?: string) => {
    switch (recommendation) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'hold':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading analysis history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyses Yet</h3>
          <p className="text-gray-500">
            Start by uploading a trading screenshot to get your first analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Analysis History</span>
              <Badge variant="outline">{filteredAndSortedAnalyses.length} analyses</Badge>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by prompt or filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div>
              <select
                value={recommendationFilter}
                onChange={(e) => setRecommendationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Recommendations</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="hold">Hold</option>
              </select>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex space-x-2">
              {[
                { key: 'date', label: 'Date', icon: Calendar },
                { key: 'confidence', label: 'Confidence', icon: TrendingUp },
                { key: 'recommendation', label: 'Recommendation', icon: Minus } // Changed from Filter to Minus
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(key as any)}
                  className="text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis List */}
      <div className="space-y-4">
        {filteredAndSortedAnalyses.map((analysis) => (
          <Card 
            key={analysis.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectAnalysis(analysis)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    {getRecommendationIcon(analysis.recommendation)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {analysis.originalFilename}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {analysis.userPrompt}
                      </p>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(analysis.analysisStatus)}`}>
                        {analysis.analysisStatus}
                      </Badge>
                    </div>
                    
                    {analysis.recommendation && (
                      <div>
                        <span className="text-gray-500">Recommendation:</span>
                        <Badge className={`ml-2 ${getRecommendationColor(analysis.recommendation)}`}>
                          {analysis.recommendation.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    
                    {analysis.confidenceLevel && (
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <span className="ml-2 font-medium">
                          {Math.round(analysis.confidenceLevel * 100)}%
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <span className="ml-2">{formatFileSize(analysis.fileSize)}</span>
                    </div>
                  </div>
                  
                  {/* Technical Indicators Preview */}
                  {analysis.technicalIndicators && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysis.technicalIndicators).map(([key, value]) => {
                        if (value !== undefined && value !== null) {
                          return (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
                
                {/* Actions and Metadata */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="text-xs text-gray-500 text-right">
                    {formatDate(analysis.createdAt)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnalysis(analysis);
                      }}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedAnalyses.length === 0 && analyses.length > 0 && (
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <Minus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
