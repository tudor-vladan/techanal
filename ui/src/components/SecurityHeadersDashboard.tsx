import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Download,
  Settings,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BarChart3,
  Zap,
  Globe,
  Server
} from 'lucide-react';

interface SecurityHeader {
  name: string;
  value: string;
  status: 'present' | 'missing' | 'weak';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

interface SecurityTestResult {
  url: string;
  timestamp: Date;
  score: number;
  headers: SecurityHeader[];
  summary: {
    total: number;
    present: number;
    missing: number;
    weak: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const SECURITY_HEADERS: Omit<SecurityHeader, 'value' | 'status'>[] = [
  {
    name: 'Strict-Transport-Security',
    description: 'Forces HTTPS connections and prevents protocol downgrade attacks',
    impact: 'high',
    recommendation: 'Set to max-age=31536000; includeSubDomains; preload'
  },
  {
    name: 'Content-Security-Policy',
    description: 'Prevents XSS attacks by controlling resource loading',
    impact: 'critical',
    recommendation: 'Implement strict CSP with nonce-based script execution'
  },
  {
    name: 'X-Frame-Options',
    description: 'Prevents clickjacking attacks',
    impact: 'high',
    recommendation: 'Set to DENY or SAMEORIGIN'
  },
  {
    name: 'X-Content-Type-Options',
    description: 'Prevents MIME type sniffing',
    impact: 'medium',
    recommendation: 'Set to nosniff'
  },
  {
    name: 'X-XSS-Protection',
    description: 'Enables browser XSS filtering',
    impact: 'medium',
    recommendation: 'Set to 1; mode=block'
  },
  {
    name: 'Referrer-Policy',
    description: 'Controls referrer information in requests',
    impact: 'low',
    recommendation: 'Set to strict-origin-when-cross-origin'
  },
  {
    name: 'Permissions-Policy',
    description: 'Controls browser feature permissions',
    impact: 'medium',
    recommendation: 'Restrict unnecessary permissions'
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    description: 'Enables cross-origin isolation',
    impact: 'high',
    recommendation: 'Set to require-corp for enhanced security'
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    description: 'Prevents cross-origin window access',
    impact: 'high',
    recommendation: 'Set to same-origin'
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    description: 'Controls cross-origin resource access',
    impact: 'medium',
    recommendation: 'Set to same-origin'
  }
];

export function SecurityHeadersDashboard() {
  const [testUrl, setTestUrl] = useState('http://localhost:5600');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SecurityTestResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock security test pentru demo
  const runSecurityTest = useCallback(async (url: string) => {
    setIsTesting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock results
      const mockHeaders: SecurityHeader[] = SECURITY_HEADERS.map(header => {
        const random = Math.random();
        let status: 'present' | 'missing' | 'weak';
        let value = '';
        
        if (random > 0.7) {
          status = 'present';
          value = getMockHeaderValue(header.name);
        } else if (random > 0.4) {
          status = 'weak';
          value = getWeakHeaderValue(header.name);
        } else {
          status = 'missing';
        }
        
        return {
          ...header,
          value,
          status
        };
      });

      const presentCount = mockHeaders.filter(h => h.status === 'present').length;
      const missingCount = mockHeaders.filter(h => h.status === 'missing').length;
      const weakCount = mockHeaders.filter(h => h.status === 'weak').length;
      
      const score = Math.round((presentCount / mockHeaders.length) * 100);
      
      const result: SecurityTestResult = {
        url,
        timestamp: new Date(),
        score,
        headers: mockHeaders,
        summary: {
          total: mockHeaders.length,
          present: presentCount,
          missing: missingCount,
          weak: weakCount,
          critical: mockHeaders.filter(h => h.impact === 'critical' && h.status !== 'present').length,
          high: mockHeaders.filter(h => h.impact === 'high' && h.status !== 'present').length,
          medium: mockHeaders.filter(h => h.impact === 'medium' && h.status !== 'present').length,
          low: mockHeaders.filter(h => h.impact === 'low' && h.status !== 'present').length
        }
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      setCurrentResult(result);
      
    } catch (error) {
      console.error('Error running security test:', error);
    } finally {
      setIsTesting(false);
    }
  }, []);

  const getMockHeaderValue = (headerName: string): string => {
    switch (headerName) {
      case 'Strict-Transport-Security':
        return 'max-age=31536000; includeSubDomains; preload';
      case 'Content-Security-Policy':
        return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
      case 'X-Frame-Options':
        return 'SAMEORIGIN';
      case 'X-Content-Type-Options':
        return 'nosniff';
      case 'X-XSS-Protection':
        return '1; mode=block';
      case 'Referrer-Policy':
        return 'strict-origin-when-cross-origin';
      case 'Permissions-Policy':
        return 'geolocation=(), microphone=(), camera=()';
      case 'Cross-Origin-Embedder-Policy':
        return 'require-corp';
      case 'Cross-Origin-Opener-Policy':
        return 'same-origin';
      case 'Cross-Origin-Resource-Policy':
        return 'same-origin';
      default:
        return 'enabled';
    }
  };

  const getWeakHeaderValue = (headerName: string): string => {
    switch (headerName) {
      case 'Strict-Transport-Security':
        return 'max-age=86400'; // Too short
      case 'Content-Security-Policy':
        return "default-src *"; // Too permissive
      case 'X-Frame-Options':
        return 'ALLOWALL'; // Invalid value
      case 'X-XSS-Protection':
        return '0'; // Disabled
      case 'Referrer-Policy':
        return 'unsafe-url'; // Too permissive
      default:
        return 'weak-value';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'missing': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'weak': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'weak': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const exportResults = useCallback(() => {
    if (!currentResult) return;
    
    const csvContent = [
      'Header Name,Status,Value,Impact,Description,Recommendation',
      ...currentResult.headers.map(header => 
        `"${header.name}","${header.status}","${header.value}","${header.impact}","${header.description}","${header.recommendation}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-headers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentResult]);

  useEffect(() => {
    if (testUrl) {
      runSecurityTest(testUrl);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Headers Dashboard</h1>
          <p className="text-muted-foreground">
            Testează și monitorizează security headers pentru aplicații web
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => runSecurityTest(testUrl)}
            disabled={isTesting || !testUrl}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing...' : 'Test Again'}
          </Button>
          {currentResult && (
            <Button
              onClick={exportResults}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="test-url">URL to Test</Label>
              <Input
                id="test-url"
                placeholder="https://example.com"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => runSecurityTest(testUrl)}
              disabled={isTesting || !testUrl}
              className="mt-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Run Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Test Results */}
      {currentResult && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(currentResult.score)}`}>
                  {currentResult.score}%
                </div>
                <div className="text-sm text-muted-foreground">Security Score</div>
                <Badge className={`mt-2 ${getScoreBadge(currentResult.score)}`}>
                  {currentResult.score >= 90 ? 'Excellent' : 
                   currentResult.score >= 70 ? 'Good' : 
                   currentResult.score >= 50 ? 'Fair' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentResult.summary.present}
                </div>
                <div className="text-sm text-muted-foreground">Headers Present</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {currentResult.summary.missing}
                </div>
                <div className="text-sm text-muted-foreground">Headers Missing</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {currentResult.summary.weak}
                </div>
                <div className="text-sm text-muted-foreground">Weak Headers</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {currentResult.summary.critical + currentResult.summary.high}
                </div>
                <div className="text-sm text-muted-foreground">Critical/High Issues</div>
              </CardContent>
            </Card>
          </div>

          {/* Headers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Headers Analysis</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Header</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Impact</th>
                      {showDetails && (
                        <>
                          <th className="text-left p-2">Value</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-left p-2">Recommendation</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentResult.headers.map((header) => (
                      <tr key={header.name} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="font-medium">{header.name}</div>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(header.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(header.status)}
                              {header.status}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getImpactColor(header.impact)}>
                            {header.impact}
                          </Badge>
                        </td>
                        {showDetails && (
                          <>
                            <td className="p-2">
                              <div className="text-sm font-mono bg-muted p-2 rounded max-w-xs truncate">
                                {header.value || 'Not set'}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm text-muted-foreground max-w-xs">
                                {header.description}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-sm text-blue-600 max-w-xs">
                                {header.recommendation}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Test History */}
          {testResults.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Test History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.slice(1).map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => setCurrentResult(result)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">
                          {result.timestamp.toLocaleString()}
                        </div>
                        <div className="text-sm font-mono">{result.url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getScoreBadge(result.score)}>
                          {result.score}%
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Results State */}
      {!currentResult && !isTesting && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Security Test Results</h3>
            <p className="text-muted-foreground mb-4">
              Enter a URL and run a security test to analyze security headers
            </p>
            <Button onClick={() => runSecurityTest(testUrl)} disabled={!testUrl}>
              <Zap className="w-4 h-4 mr-2" />
              Run First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SecurityHeadersDashboard;
