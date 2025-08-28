import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  RefreshCw, 
  Trash2,
  Smartphone,
  Globe,
  HardDrive,
  Zap,
  CheckCircle,
  XCircle,
  Settings,
  Share2,
  MessageCircle,
  Send,
  Instagram
} from 'lucide-react';
import { pwaManager, CacheInfo, StorageInfo, BatteryInfo, NetworkInfo } from '@/lib/pwa-manager';

interface PWAStatusProps {
  className?: string;
}

export function PWAStatus({ className }: PWAStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Listen for PWA events
    const handleStatusChange = (event: CustomEvent) => {
      setIsOnline(event.detail.status === 'online');
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleInstallPrompt = () => {
      // Handle install prompt
      console.log('Install prompt available');
    };

    const handleInstalled = () => {
      console.log('App installed');
    };

    window.addEventListener('pwa:statusChange', handleStatusChange as EventListener);
    window.addEventListener('pwa:updateAvailable', handleUpdateAvailable);
    window.addEventListener('pwa:installPrompt', handleInstallPrompt);
    window.addEventListener('pwa:installed', handleInstalled);

    // Initial load
    loadPWAInfo();

    return () => {
      window.removeEventListener('pwa:statusChange', handleStatusChange as EventListener);
      window.removeEventListener('pwa:updateAvailable', handleUpdateAvailable);
      window.removeEventListener('pwa:installPrompt', handleInstallPrompt);
      window.removeEventListener('pwa:installed', handleInstalled);
    };
  }, []);

  const loadPWAInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load all PWA information
      const [cache, storage, battery, network] = await Promise.all([
        pwaManager.getCacheInfo(),
        pwaManager.getStorageInfo(),
        pwaManager.getBatteryInfo(),
        pwaManager.getNetworkInfo()
      ]);

      setCacheInfo(cache);
      setStorageInfo(storage);
      setBatteryInfo(battery);
      setNetworkInfo(network);

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Error loading PWA info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateApp = useCallback(async () => {
    try {
      await pwaManager.skipWaiting();
      await pwaManager.reloadApp();
    } catch (error) {
      console.error('Error updating app:', error);
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    try {
      await pwaManager.clearCache();
      await loadPWAInfo(); // Reload info
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [loadPWAInfo]);

  const handleRequestNotifications = useCallback(async () => {
    try {
      const granted = await pwaManager.requestNotificationPermission();
      if (granted) {
        setNotificationPermission('granted');
        await pwaManager.sendNotification('Notificările sunt activate!', {
          body: 'TechAnal poate acum să îți trimită notificări importante.',
          tag: 'notification-permission'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, []);

  const handleTestNotification = useCallback(async () => {
    try {
      await pwaManager.sendNotification('Test Notificare', {
        body: 'Aceasta este o notificare de test de la TechAnal!',
        tag: 'test-notification'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, []);

  const handleBackgroundSync = useCallback(async () => {
    try {
      const success = await pwaManager.requestBackgroundSync('background-sync');
      if (success) {
        console.log('Background sync requested successfully');
      }
    } catch (error) {
      console.error('Error requesting background sync:', error);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const data = {
      title: 'TechAnal - AI Trading Analysis',
      text: 'Descoperă platforma avansată de analiză trading cu AI!',
      url: window.location.href
    };

    try {
      setIsSharing(true);
      const success = await pwaManager.shareData(data);
      if (success) {
        console.log('Data shared successfully');
        return;
      }
    } catch (error) {
      console.error('Error sharing data via Web Share API:', error);
    } finally {
      setIsSharing(false);
    }

    // Fallback for desktop browsers or environments where Web Share API is unavailable
    try {
      await navigator.clipboard?.writeText(`${data.text} ${data.url}`);
    } catch {}
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleShareWhatsApp = useCallback(() => {
    const shareUrl = window.location.href;
    const shareText = `Descoperă platforma TechAnal: ${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleShareTelegram = useCallback(() => {
    const shareUrl = window.location.href;
    const text = 'Descoperă platforma avansată de analiză trading cu AI!';
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleShareInstagram = useCallback(async () => {
    const data = {
      title: 'TechAnal - AI Trading Analysis',
      text: 'Descoperă platforma avansată de analiză trading cu AI!',
      url: window.location.href
    };

    // Instagram nu oferă o schemă web oficială pentru share de link; încercăm Web Share, altfel copiem linkul și deschidem Instagram.
    try {
      const success = await pwaManager.shareData(data);
      if (!success) {
        try {
          await navigator.clipboard?.writeText(`${data.text} ${data.url}`);
        } catch {}
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }
    } catch {
      try {
        await navigator.clipboard?.writeText(`${data.text} ${data.url}`);
      } catch {}
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = (): number => {
    if (!storageInfo?.supported || !storageInfo.quota || !storageInfo.usage) return 0;
    return (storageInfo.usage / storageInfo.quota) * 100;
  };

  const getNetworkQuality = (): { quality: string; color: string } => {
    if (!networkInfo) return { quality: 'Unknown', color: 'bg-gray-500' };
    
    if (networkInfo.effectiveType === '4g' && networkInfo.downlink > 10) {
      return { quality: 'Excellent', color: 'bg-green-500' };
    } else if (networkInfo.effectiveType === '4g' || networkInfo.effectiveType === '3g') {
      return { quality: 'Good', color: 'bg-blue-500' };
    } else if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g') {
      return { quality: 'Poor', color: 'bg-red-500' };
    } else {
      return { quality: 'Unknown', color: 'bg-gray-500' };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Status PWA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Online Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Status Conexiune</span>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Update Status */}
          {updateAvailable && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">Actualizare disponibilă</span>
              </div>
              <Button size="sm" onClick={handleUpdateApp}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizează
              </Button>
            </div>
          )}

          {/* Network Quality */}
          {networkInfo && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calitate Rețea</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getNetworkQuality().color}`}></div>
                <Badge variant="outline" className="text-xs">
                  {getNetworkQuality().quality}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage & Cache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Usage */}
          {storageInfo?.supported && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Utilizat</span>
                <span>{formatBytes(storageInfo.usage || 0)} / {formatBytes(storageInfo.quota || 0)}</span>
              </div>
              <Progress value={getStoragePercentage()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Cache Info */}
          {cacheInfo?.supported && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Items</span>
                <Badge variant="outline">{cacheInfo.totalSize || 0}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cacheInfo.caches?.map((cache) => (
                  <div key={cache.name} className="text-xs p-2 bg-muted rounded">
                    <div className="font-medium">{cache.name}</div>
                    <div className="text-muted-foreground">{cache.size} items</div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Curăță Cache
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificări
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Permisiune</span>
            <Badge 
              variant={
                notificationPermission === 'granted' ? 'default' : 
                notificationPermission === 'denied' ? 'destructive' : 'outline'
              }
            >
              {notificationPermission === 'granted' ? 'Permis' : 
               notificationPermission === 'denied' ? 'Refuzat' : 'În așteptare'}
            </Badge>
          </div>

          <div className="flex gap-2">
            {notificationPermission !== 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestNotifications}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-2" />
                Permite
              </Button>
            )}
            
            {notificationPermission === 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Informații Device
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Battery */}
          {batteryInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Baterie</span>
                <Badge variant="outline">{Math.round(batteryInfo.level * 100)}%</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {batteryInfo.charging ? (
                  <Zap className="w-3 h-3 text-green-500" />
                ) : (
                  <Smartphone className="w-3 h-3" />
                )}
                <span>
                  {batteryInfo.charging ? 'Se încarcă' : 'Se descarcă'}
                </span>
              </div>
            </div>
          )}

          {/* Network Details */}
          {networkInfo && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Tip Rețea</div>
                <div className="font-medium">{networkInfo.effectiveType.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Viteză Downlink</div>
                <div className="font-medium">{networkInfo.downlink.toFixed(1)} Mbps</div>
              </div>
              <div>
                <div className="text-muted-foreground">RTT</div>
                <div className="font-medium">{networkInfo.rtt}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground">Save Data</div>
                <div className="font-medium">
                  {networkInfo.saveData ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Acțiuni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={handleBackgroundSync}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Background Sync
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isSharing}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isSharing ? 'Sharing…' : 'Share App'}
          </Button>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={handleShareWhatsApp}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={handleShareTelegram}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Share Telegram
            </Button>
            <Button
              variant="outline"
              onClick={handleShareInstagram}
              className="w-full"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Share Instagram
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={loadPWAInfo}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default PWAStatus;
