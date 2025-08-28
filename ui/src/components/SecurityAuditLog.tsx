import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Download,
  Filter,
  Search,
  RefreshCw,
  Clock,
  User,
  Globe,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  Settings,
  Trash2,
  FileText
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  metadata: Record<string, any>;
}

interface AuditFilter {
  dateRange: '1h' | '24h' | '7d' | '30d' | 'all';
  severity: string[];
  status: string[];
  action: string[];
  userId: string;
  search: string;
}

const AUDIT_ACTIONS = [
  'login', 'logout', 'mfa_enable', 'mfa_disable', 'mfa_verify',
  'password_change', 'profile_update', 'role_change', 'permission_grant',
  'permission_revoke', 'api_access', 'file_upload', 'file_download',
  'data_export', 'data_import', 'system_config', 'user_create',
  'user_delete', 'session_create', 'session_destroy'
];

const AUDIT_RESOURCES = [
  'auth', 'user', 'profile', 'mfa', 'api', 'file', 'data',
  'system', 'permissions', 'roles', 'sessions', 'logs'
];

export function SecurityAuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [filters, setFilters] = useState<AuditFilter>({
    dateRange: '24h',
    severity: [],
    status: [],
    action: [],
    userId: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  // Mock data generator pentru demo
  const generateMockEvents = useCallback((): AuditEvent[] => {
    const mockEvents: AuditEvent[] = [];
    const now = new Date();
    
    const actions = [
      { action: 'login', resource: 'auth', severity: 'low', status: 'success' },
      { action: 'mfa_verify', resource: 'mfa', severity: 'medium', status: 'success' },
      { action: 'api_access', resource: 'api', severity: 'low', status: 'success' },
      { action: 'file_upload', resource: 'file', severity: 'medium', status: 'success' },
      { action: 'login', resource: 'auth', severity: 'high', status: 'failure' },
      { action: 'mfa_verify', resource: 'mfa', severity: 'critical', status: 'failure' },
      { action: 'permission_grant', resource: 'permissions', severity: 'high', status: 'success' },
      { action: 'data_export', resource: 'data', severity: 'medium', status: 'success' },
      { action: 'system_config', resource: 'system', severity: 'high', status: 'success' },
      { action: 'session_create', resource: 'sessions', severity: 'low', status: 'success' }
    ];

    for (let i = 0; i < 50; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      mockEvents.push({
        id: `audit_${i + 1}`,
        timestamp,
        userId: `user_${Math.floor(Math.random() * 10) + 1}`,
        userEmail: `user${Math.floor(Math.random() * 10) + 1}@example.com`,
        action: action.action,
        resource: action.resource,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: action.status as 'success' | 'failure' | 'warning',
        severity: action.severity as 'low' | 'medium' | 'high' | 'critical',
        details: `User performed ${action.action} on ${action.resource}`,
        metadata: {
          browser: 'Chrome',
          os: 'macOS',
          location: 'Romania',
          device: 'desktop'
        }
      });
    }

    return mockEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (error) {
      console.error('Error loading audit events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Apply filters
  useEffect(() => {
    let filtered = events;

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoff: Date;
      
      switch (filters.dateRange) {
        case '1h':
          cutoff = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      
      filtered = filtered.filter(event => event.timestamp >= cutoff);
    }

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(event => filters.severity.includes(event.severity));
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(event => filters.status.includes(event.status));
    }

    // Action filter
    if (filters.action.length > 0) {
      filtered = filtered.filter(event => filters.action.includes(event.action));
    }

    // User ID filter
    if (filters.userId) {
      filtered = filtered.filter(event => 
        event.userId.includes(filters.userId) || 
        event.userEmail.includes(filters.userId)
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.action.toLowerCase().includes(searchLower) ||
        event.resource.toLowerCase().includes(searchLower) ||
        event.details.toLowerCase().includes(searchLower) ||
        event.userEmail.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failure': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const exportAuditLog = useCallback(() => {
    const csvContent = [
      'Timestamp,User ID,User Email,Action,Resource,IP Address,Status,Severity,Details',
      ...filteredEvents.map(event => 
        `${event.timestamp.toISOString()},"${event.userId}","${event.userEmail}","${event.action}","${event.resource}","${event.ipAddress}","${event.status}","${event.severity}","${event.details}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEvents]);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: '24h',
      severity: [],
      status: [],
      action: [],
      userId: '',
      search: ''
    });
  }, []);

  const toggleSeverity = useCallback((severity: string) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity.includes(severity)
        ? prev.severity.filter(s => s !== severity)
        : [...prev.severity, severity]
    }));
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  }, []);

  const toggleAction = useCallback((action: string) => {
    setFilters(prev => ({
      ...prev,
      action: prev.action.includes(action)
        ? prev.action.filter(a => a !== action)
        : [...prev.action, action]
    }));
  }, []);

  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const bySeverity = filteredEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = filteredEvents.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const criticalEvents = filteredEvents.filter(e => e.severity === 'critical').length;
    const failedEvents = filteredEvents.filter(e => e.status === 'failure').length;

    return { total, bySeverity, byStatus, criticalEvents, failedEvents };
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Audit Log</h1>
          <p className="text-muted-foreground">
            Monitorizare completă a evenimentelor de securitate și acces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadEvents}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={exportAuditLog}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.criticalEvents}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.failedEvents}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(filteredEvents.map(e => e.userId)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(filteredEvents.map(e => e.ipAddress)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique IPs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* User ID/Email */}
              <div className="space-y-2">
                <Label>User ID/Email</Label>
                <Input
                  placeholder="Search by user..."
                  value={filters.userId}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                />
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search in details..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex flex-wrap gap-2">
                {['low', 'medium', 'high', 'critical'].map(severity => (
                  <Button
                    key={severity}
                    variant={filters.severity.includes(severity) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSeverity(severity)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {['success', 'failure', 'warning'].map(status => (
                  <Button
                    key={status}
                    variant={filters.status.includes(status) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex flex-wrap gap-2">
                {AUDIT_ACTIONS.slice(0, 10).map(action => (
                  <Button
                    key={action}
                    variant={filters.action.includes(action) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleAction(action)}
                  >
                    {action.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All Filters
              </Button>
              <Button onClick={() => setShowFilters(false)} size="sm">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audit Events ({filteredEvents.length})</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Resource</th>
                  <th className="text-left p-2">IP Address</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Severity</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{event.userId}</div>
                        <div className="text-xs text-muted-foreground">{event.userEmail}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {event.action.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.resource}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm font-mono">{event.ipAddress}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(event.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(event.status)}
                          {event.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-4 z-50 overflow-y-auto bg-background border-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Event Details
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEvent(null)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Event ID</Label>
                <div className="text-sm font-mono bg-muted p-2 rounded">{selectedEvent.id}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Timestamp</Label>
                <div className="text-sm">{selectedEvent.timestamp.toLocaleString()}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">User ID</Label>
                <div className="text-sm">{selectedEvent.userId}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">User Email</Label>
                <div className="text-sm">{selectedEvent.userEmail}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Action</Label>
                <div className="text-sm">{selectedEvent.action}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Resource</Label>
                <div className="text-sm">{selectedEvent.resource}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">IP Address</Label>
                <div className="text-sm font-mono">{selectedEvent.ipAddress}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">User Agent</Label>
                <div className="text-sm text-xs bg-muted p-2 rounded">{selectedEvent.userAgent}</div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Details</Label>
              <div className="text-sm bg-muted p-2 rounded">{selectedEvent.details}</div>
            </div>

            <div>
              <Label className="text-sm font-medium">Metadata</Label>
              <div className="text-sm bg-muted p-2 rounded">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SecurityAuditLog;
