// PWA Manager pentru TechAnal
export class PWAManager {
  private static instance: PWAManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private onlineStatus = navigator.onLine;
  private updateAvailable = false;
  private isSharing = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async initialize() {
    this.setupEventListeners();
    // Allow forcing SW in dev via VITE_PWA_ENABLE_IN_DEV=true
    const enableInDev = (import.meta as any).env && (import.meta as any).env.VITE_PWA_ENABLE_IN_DEV === 'true';

    // Only register Service Worker in production by default to avoid dev caching/hot-reload issues
    if (import.meta.env.MODE === 'production' || enableInDev) {
      await this.registerServiceWorker();
      await this.checkForUpdates();
      return;
    } else {
      console.info('[PWA] Service Worker disabled in development mode');
      // Clean up any previously registered SWs that might still control the page
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            try { await reg.unregister(); } catch {}
          }
        }
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
        console.info('[PWA] Unregistered stale service workers and cleared caches (dev)');
      } catch (err) {
        console.debug('[PWA] Dev SW cleanup skipped:', err);
      }
    }
  }

  private setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.notifyStatusChange('online');
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      this.notifyStatusChange('offline');
    });

    // Before install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.showInstallPrompt();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.notifyInstallation();
    });
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[PWA] Service Worker registered successfully:', this.swRegistration);

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New Service Worker activated');
        this.updateAvailable = false;
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  private async checkForUpdates(): Promise<void> {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        console.error('[PWA] Update check failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('[PWA] Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[PWA] Error requesting notification permission:', error);
      return false;
    }
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.swRegistration) {
      console.warn('[PWA] Service Worker not registered');
      return;
    }

    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) {
      return;
    }

    try {
      await this.swRegistration.showNotification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });
    } catch (error) {
      console.error('[PWA] Error sending notification:', error);
    }
  }

  async requestBackgroundSync(tag: string): Promise<boolean> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      console.warn('[PWA] Background sync not supported');
      return false;
    }

    try {
      await (this.swRegistration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error);
      return false;
    }
  }

  async getCacheInfo(): Promise<CacheInfo> {
    if (!('caches' in window)) {
      return { supported: false };
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo: CacheInfo = {
        supported: true,
        caches: [],
        totalSize: 0
      };

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const size = keys.length;
        
        if (cacheInfo.caches) {
          cacheInfo.caches.push({
            name: cacheName,
            size,
            keys: keys.map(req => req.url)
          });
        }
        
        if (cacheInfo.totalSize !== undefined) {
          cacheInfo.totalSize += size;
        }
      }

      return cacheInfo;
    } catch (error) {
      console.error('[PWA] Error getting cache info:', error);
      return { supported: false };
    }
  }

  async clearCache(cacheName?: string): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      if (cacheName) {
        await caches.delete(cacheName);
        console.log(`[PWA] Cache cleared: ${cacheName}`);
      } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[PWA] All caches cleared');
      }
    } catch (error) {
      console.error('[PWA] Error clearing cache:', error);
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return { supported: false };
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        supported: true,
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usageDetails: {}
      };
    } catch (error) {
      console.error('[PWA] Error getting storage info:', error);
      return { supported: false };
    }
  }

  async shareData(data: ShareData): Promise<boolean> {
    if (!('share' in navigator)) {
      console.warn('[PWA] Web Share API not supported');
      return false;
    }

    try {
      if (this.isSharing) {
        console.warn('[PWA] Share already in progress; ignoring duplicate request');
        // Pretend success to avoid fallbacks opening while native share is open
        return true;
      }
      this.isSharing = true;
      await navigator.share(data);
      return true;
    } catch (error) {
      const err = error as Error & { name?: string };
      if (err?.name === 'InvalidStateError') {
        console.warn('[PWA] Share failed: another share is still active');
      } else if (err?.name !== 'AbortError') {
        console.error('[PWA] Error sharing data:', error);
      }
      return false;
    } finally {
      this.isSharing = false;
    }
  }

  async getBatteryInfo(): Promise<BatteryInfo | null> {
    if (!('getBattery' in navigator)) {
      return null;
    }

    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      console.error('[PWA] Error getting battery info:', error);
      return null;
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      return {
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        saveData: false
      };
    }

    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }

  // Utility methods
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  isOnline(): boolean {
    return this.onlineStatus;
  }

  async skipWaiting(): Promise<void> {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  async reloadApp(): Promise<void> {
    window.location.reload();
  }

  // Event notifications
  private notifyStatusChange(status: 'online' | 'offline') {
    const event = new CustomEvent('pwa:statusChange', { detail: { status } });
    window.dispatchEvent(event);
  }

  private notifyUpdateAvailable() {
    const event = new CustomEvent('pwa:updateAvailable');
    window.dispatchEvent(event);
  }

  private notifyInstallation() {
    const event = new CustomEvent('pwa:installed');
    window.dispatchEvent(event);
  }

  private showInstallPrompt() {
    const event = new CustomEvent('pwa:installPrompt');
    window.dispatchEvent(event);
  }
}

// Types
export interface CacheInfo {
  supported: boolean;
  caches?: Array<{
    name: string;
    size: number;
    keys: string[];
  }>;
  totalSize?: number;
}

export interface StorageInfo {
  supported: boolean;
  usage?: number;
  quota?: number;
  usageDetails?: Record<string, number>;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();
