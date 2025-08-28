import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  BarChart3,
  Users,
  Globe,
  Database,
  Upload,
  Brain
} from 'lucide-react';

interface RateLimitStats {
  endpoint: string;
  currentRequests: number;
  maxRequests: number;
  remainingRequests: number;
  resetTime: number;
  blockedIPs: number;
  totalRequests: number;
  blockedRequests: number;
}

interface RateLimitConfig {
  name: string;
  windowMs: number;
  maxRequests: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const rateLimitConfigs: RateLimitConfig[] = [
  {
    name: 'Global API',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    description: 'Rate limiting global pentru toate endpoint-urile',
    icon: <Globe className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    name: 'Authentication',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    description: 'Rate limiting strict pentru endpoint-urile de autentificare',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-red-500'
  },
  {
    name: 'AI Services',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    description: 'Rate limiting pentru serviciile AI (cost control)',
    icon: <Brain className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    name: 'System Monitor',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    description: 'Rate limiting pentru monitorizarea sistemului',
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    name: 'File Upload',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    description: 'Rate limiting pentru upload-ul de fișiere',
    icon: <Upload className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    name: 'Database',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    description: 'Rate limiting pentru operațiile cu baza de date',
    icon: <Database className="w-4 h-4" />,
    color: 'bg-indigo-500'
  }
];

export function RateLimitDashboard() {
  const [stats, setStats] = useState<RateLimitStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data pentru demo
  const generateMockStats = useCallback(() => {
    return rateLimitConfigs.map(config => {
      const currentRequests = Math.floor(Math.random() * config.maxRequests);
      const remainingRequests = Math.max(0, config.maxRequests - currentRequests);
      const resetTime = Date.now() + config.windowMs;
      const blockedIPs = Math.floor(Math.random() * 5);
      const totalRequests = currentRequests + Math.floor(Math.random() * 100);
      const blockedRequests = Math.floor(Math.random() * 20);

      return {
        endpoint: config.name,
        currentRequests,
        maxRequests: config.maxRequests,
        remainingRequests,
        resetTime,
        blockedIPs,
        totalRequests,
        blockedRequests
      };
    });
  }, []);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockStats = generateMockStats();
      setStats(mockStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading rate limit stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockStats]);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Expirat';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const getUsagePercentage = (current: number, max: number): number => {
    return (current / max) * 100;
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Critical</Badge>;
    if (percentage >= 75) return <Badge variant="secondary">High</Badge>;
    if (percentage >= 50) return <Badge variant="outline">Medium</Badge>;
    return <Badge variant="default">Low</Badge>;
  };

  const handleClearBlockedIPs = async (endpoint: string) => {
    try {
      // In real app, this would call the API to clear blocked IPs
      console.log(`Clearing blocked IPs for ${endpoint}`);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error clearing blocked IPs:', error);
    }
  };

  const handleResetLimits = async (endpoint: string) => {
    try {
      // In real app, this would call the API to reset limits
      console.log(`Resetting limits for ${endpoint}`);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error resetting limits:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rate Limiting Dashboard</h1>
          <p className="text-muted-foreground">
            Monitorizare și configurare rate limiting pentru toate endpoint-urile
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Ultima actualizare: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button
            onClick={loadStats}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimitConfigs.length}</div>
            <p className="text-xs text-muted-foreground">
              Endpoint-uri protejate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce((sum, stat) => sum + stat.totalRequests, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              În ultima perioadă
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.reduce((sum, stat) => sum + stat.blockedRequests, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Cereri blocate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.reduce((sum, stat) => sum + stat.blockedIPs, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              IP-uri blocate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const config = rateLimitConfigs.find(c => c.name === stat.endpoint);
          const usagePercentage = getUsagePercentage(stat.currentRequests, stat.maxRequests);
          
          return (
            <Card key={stat.endpoint}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config?.color}`}></div>
                    <CardTitle className="text-lg">{stat.endpoint}</CardTitle>
                  </div>
                  {getStatusBadge(usagePercentage)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {config?.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Usage Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Utilizare</span>
                    <span className={getStatusColor(usagePercentage)}>
                      {stat.currentRequests} / {stat.maxRequests}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rămase</div>
                    <div className="font-medium text-green-600">
                      {stat.remainingRequests}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reset în</div>
                    <div className="font-medium">
                      {formatTime(stat.resetTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Cereri</div>
                    <div className="font-medium">
                      {stat.totalRequests.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Blocate</div>
                    <div className="font-medium text-red-600">
                      {stat.blockedRequests.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClearBlockedIPs(stat.endpoint)}
                    className="flex-1"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Clear IPs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetLimits(stat.endpoint)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurare Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rateLimitConfigs.map(config => (
              <div key={config.name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                <div className="flex-1">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.maxRequests} cereri / {Math.round(config.windowMs / 60000)} min
                  </div>
                </div>
                <Badge variant="outline">
                  {config.icon}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RateLimitDashboard;
