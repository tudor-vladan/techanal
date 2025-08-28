import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Zap,
  Shield,
  Activity,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Trash2,
  Star,
  StarOff,
  Filter,
  Search,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  category: 'system' | 'security' | 'performance' | 'ai' | 'maintenance';
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
  autoAcknowledge: boolean;
  retentionDays: number;
  categories: {
    system: boolean;
    security: boolean;
    performance: boolean;
    ai: boolean;
    maintenance: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
}

interface PushNotificationsProps {
  isMonitoring: boolean;
  resources: any;
  criticalAlerts: number;
}

export function PushNotifications({ 
  isMonitoring, 
  resources, 
  criticalAlerts 
}: PushNotificationsProps) {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    soundEnabled: true,
    browserNotifications: true,
    autoAcknowledge: false,
    retentionDays: 30,
    categories: {
      system: true,
      security: true,
      performance: true,
      ai: true,
      maintenance: true
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      urgent: true
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Verifică dacă browser-ul suportă notificări
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Generează notificări în timp real
  useEffect(() => {
    if (!isMonitoring || !settings.enabled) return;

    const generateNotifications = () => {
      const newNotifications: PushNotification[] = [];

      // Notificări de performanță
      if (resources?.cpu?.usage > 80) {
        newNotifications.push({
          id: `cpu-${Date.now()}`,
          title: 'High CPU Usage Alert',
          message: `CPU usage is at ${resources.cpu.usage.toFixed(1)}%, which is above the 80% threshold`,
          type: 'warning',
          category: 'performance',
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          priority: 'high',
          source: 'system-monitor',
          actionRequired: true,
          actionUrl: '/system-monitor?tab=resources'
        });
      }

      if (resources?.memory?.usage > 85) {
        newNotifications.push({
          id: `memory-${Date.now()}`,
          title: 'High Memory Usage Alert',
          message: `Memory usage is at ${resources.memory.usage.toFixed(1)}%, which is above the 85% threshold`,
          type: 'warning',
          category: 'performance',
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          priority: 'high',
          source: 'system-monitor',
          actionRequired: true,
          actionUrl: '/system-monitor?tab=resources'
        });
      }

      if (resources?.disk?.usage > 90) {
        newNotifications.push({
          id: `disk-${Date.now()}`,
          title: 'Critical Disk Usage Alert',
          message: `Disk usage is at ${resources.disk.usage.toFixed(1)}%, which is above the 90% threshold`,
          type: 'critical',
          category: 'system',
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          priority: 'urgent',
          source: 'system-monitor',
          actionRequired: true,
          actionUrl: '/system-monitor?tab=resources'
        });
      }

      // Notificări de securitate
      if (Math.random() > 0.8) {
        newNotifications.push({
          id: `security-${Date.now()}`,
          title: 'Security Scan Completed',
          message: 'System security scan completed successfully. No threats detected.',
          type: 'success',
          category: 'security',
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          priority: 'low',
          source: 'security-scanner',
          actionRequired: false
        });
      }

      // Notificări AI
      if (Math.random() > 0.7) {
        newNotifications.push({
          id: `ai-${Date.now()}`,
          title: 'AI Model Update Available',
          message: 'New AI model version available for download and deployment',
          type: 'info',
          category: 'ai',
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          priority: 'medium',
          source: 'ai-engine',
          actionRequired: true,
          actionUrl: '/system-monitor?tab=ai-engine'
        });
      }

      // Notificări de mentenanță
      if (Math.random() > 0.9) {
        newNotifications.push({
          id: `maintenance-${Date.now()}`,
          title: 'Scheduled Maintenance Reminder',
          message: 'System maintenance scheduled for tomorrow at 2:00 AM',
          type: 'info',
          category: 'maintenance',
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          priority: 'medium',
          source: 'maintenance-scheduler',
          actionRequired: false
        });
      }

      // Adaugă notificările noi
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        
        // Trimite notificări browser
        if (settings.browserNotifications && Notification.permission === 'granted') {
          newNotifications.forEach(notification => {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id,
              requireInteraction: notification.actionRequired
            });
          });
        }

        // Redă sunet
        if (settings.soundEnabled) {
          playNotificationSound();
        }
      }
    };

    generateNotifications();
    
    const interval = setInterval(generateNotifications, 15000);
    return () => clearInterval(interval);
  }, [isMonitoring, settings, resources]);

  // Curăță notificările vechi
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);
      
      setNotifications(prev => 
        prev.filter(notification => 
          new Date(notification.timestamp) > cutoffDate
        )
      );
    };

    const interval = setInterval(cleanupOldNotifications, 3600000); // O dată pe oră
    return () => clearInterval(interval);
  }, [settings.retentionDays]);

  // Redă sunet de notificare
  const playNotificationSound = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      setTimeout(() => setIsPlaying(false), 300);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Marchează notificarea ca citită
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Acknowledges notificarea
  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, acknowledged: true }
          : notification
      )
    );
  };

  // Șterge notificarea
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Marchează toate ca citite
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Șterge toate notificările
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Filtrează notificările
  const filteredNotifications = notifications.filter(notification => {
    const categoryMatch = selectedCategory === 'all' || notification.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || notification.priority === selectedPriority;
    const searchMatch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && priorityMatch && searchMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'critical':
        return 'bg-red-600';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Activity className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'ai':
        return <Activity className="w-4 h-4" />;
      case 'maintenance':
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications Header */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Bell className="w-6 h-6" />
            Real-time Push Notifications
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Instant alerts, browser notifications, and sound alerts for critical system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">Notifications:</span>
                <Badge variant="outline">{unreadCount} unread</Badge>
                <Badge variant="outline">{unacknowledgedCount} unacknowledged</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={playNotificationSound}
                disabled={isPlaying}
              >
                {isPlaying ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                Test Sound
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure notification preferences and behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">General Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable Notifications</span>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sound Alerts</span>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Browser Notifications</span>
                    <Switch
                      checked={settings.browserNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, browserNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-acknowledge</span>
                    <Switch
                      checked={settings.autoAcknowledge}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAcknowledge: checked }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Categories & Priorities</h4>
                <div className="space-y-3">
                  <div className="text-sm font-medium">Categories:</div>
                  {Object.entries(settings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            categories: { ...prev.categories, [category]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                  
                  <div className="text-sm font-medium mt-4">Priorities:</div>
                  {Object.entries(settings.priorities).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{priority}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            priorities: { ...prev.priorities, [priority]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Notification Filters
              </CardTitle>
              <CardDescription>
                Filter and search through notifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 border rounded text-sm w-64"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Categories</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="performance">Performance</option>
              <option value="ai">AI</option>
              <option value="maintenance">Maintenance</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            {filteredNotifications.length} notifications found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 ${notification.read ? 'bg-muted/30' : 'bg-background'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-2 ${getTypeColor(notification.type)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${notification.read ? 'text-muted-foreground' : ''}`}>
                            {notification.title}
                          </h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.category.toUpperCase()}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                              ACTION REQUIRED
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${notification.read ? 'text-muted-foreground' : ''}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Source: {notification.source}</span>
                          <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {!notification.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeNotification(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">No notifications found</p>
              <p className="text-sm">Notifications will appear here when system events occur</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
