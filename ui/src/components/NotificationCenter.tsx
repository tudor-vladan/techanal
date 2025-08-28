import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  category: 'system' | 'security' | 'performance' | 'maintenance';
}

interface NotificationCenterProps {
  isMonitoring: boolean;
  resources: any;
}

export function NotificationCenter({ isMonitoring, resources }: NotificationCenterProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generează notificări în timp real
  useEffect(() => {
    if (!isMonitoring || !resources) return;

    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const now = new Date().toISOString();

      // CPU Notifications
      if (resources.cpu?.usage > 90) {
        newNotifications.push({
          id: `cpu-critical-${Date.now()}`,
          type: 'critical',
          title: 'CPU Critical Alert',
          message: `CPU usage is at ${resources.cpu.usage.toFixed(1)}%, system may become unresponsive`,
          timestamp: now,
          isRead: false,
          isDismissed: false,
          source: 'system-monitor',
          priority: 'urgent',
          actionRequired: true,
          category: 'performance'
        });
      } else if (resources.cpu?.usage > 80) {
        newNotifications.push({
          id: `cpu-warning-${Date.now()}`,
          type: 'warning',
          title: 'CPU High Usage',
          message: `CPU usage is elevated at ${resources.cpu.usage.toFixed(1)}%`,
          timestamp: now,
          isRead: false,
          isDismissed: false,
          source: 'system-monitor',
          priority: 'high',
          actionRequired: false,
          category: 'performance'
        });
      }

      // Memory Notifications
      if (resources.memory?.usage > 95) {
        newNotifications.push({
          id: `memory-critical-${Date.now()}`,
          type: 'critical',
          title: 'Memory Critical Alert',
          message: `Memory usage is at ${resources.memory.usage.toFixed(1)}%, risk of out-of-memory errors`,
          timestamp: now,
          isRead: false,
          isDismissed: false,
          source: 'system-monitor',
          priority: 'urgent',
          actionRequired: true,
          category: 'performance'
        });
      } else if (resources.memory?.usage > 85) {
        newNotifications.push({
          id: `memory-warning-${Date.now()}`,
          type: 'warning',
          title: 'Memory High Usage',
          message: `Memory usage is elevated at ${resources.memory.usage.toFixed(1)}%`,
          timestamp: now,
          isRead: false,
          isDismissed: false,
          source: 'system-monitor',
          priority: 'high',
          actionRequired: false,
          category: 'performance'
        });
      }

      // Disk Notifications
      if (resources.disk?.usage > 95) {
        newNotifications.push({
          id: `disk-critical-${Date.now()}`,
          type: 'critical',
          title: 'Disk Space Critical',
          message: `Disk usage is at ${resources.disk.usage.toFixed(1)}%, system stability at risk`,
          timestamp: now,
          isRead: false,
          isDismissed: false,
          source: 'system-monitor',
          priority: 'urgent',
          actionRequired: true,
          category: 'maintenance'
        });
      }

      // System Health Notifications
      const overallHealth = calculateOverallHealth(resources);
      if (overallHealth < 50) {
        newNotifications.push({
          id: `system-critical-${Date.now()}`,
          type: 'critical',
          title: 'System Health Critical',
          message: `Overall system health is ${overallHealth}%, immediate attention required`,
          timestamp: now,
          isRead: false,
          isDismissed: false,
          source: 'system-monitor',
          priority: 'urgent',
          actionRequired: true,
          category: 'system'
        });
      }

      // Add new notifications
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        
        // Play sound if enabled
        if (soundEnabled) {
          playNotificationSound();
        }
      }
    };

    // Generate notifications every 30 seconds
    const interval = setInterval(generateNotifications, 30000);
    generateNotifications(); // Initial generation

    return () => clearInterval(interval);
  }, [isMonitoring, resources, soundEnabled]);

  // Auto-dismiss notifications after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(notification => {
        const notificationTime = new Date(notification.timestamp).getTime();
        const currentTime = Date.now();
        const timeDiff = currentTime - notificationTime;
        
        // Dismiss notifications older than 5 minutes
        if (timeDiff > 5 * 60 * 1000 && !notification.actionRequired) {
          return false;
        }
        return true;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const calculateOverallHealth = (resources: any) => {
    if (!resources) return 0;
    const scores = [
      resources.cpu?.usage < 80 ? 100 : Math.max(0, 100 - (resources.cpu?.usage - 80) * 2),
      resources.memory?.usage < 85 ? 100 : Math.max(0, 100 - (resources.memory?.usage - 85) * 2),
      resources.disk?.usage < 90 ? 100 : Math.max(0, 100 - (resources.disk?.usage - 90) * 2)
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isDismissed: true } : notification
    ));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isDismissed: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
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
        return <Info className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      case 'performance':
        return <Info className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.isDismissed).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.isDismissed).length;
  const activeNotifications = notifications.filter(n => !n.isDismissed);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showNotifications && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Info className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {unreadCount} unread • {criticalCount} critical
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-3 transition-all ${
                      notification.isRead ? 'opacity-75' : 'opacity-100'
                    } ${
                      notification.type === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                      notification.type === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                      notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
                      notification.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                      'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(notification.category)}
                            {notification.category}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Mark Read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissNotification(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
