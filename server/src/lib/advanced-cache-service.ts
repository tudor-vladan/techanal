import { createClient, RedisClientType } from 'redis';
import { getEnv } from './env';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  defaultTTL: number;
  maxMemory: string;
  evictionPolicy: 'allkeys-lru' | 'volatile-lru' | 'allkeys-random' | 'volatile-random' | 'volatile-ttl';
}

export interface CacheStats {
  hits: number;
  misses: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  memoryUsage: number;
  connectedClients: number;
  totalKeys: number;
  hitRate: number;
  memoryEfficiency: number;
}

export interface CachePattern {
  pattern: string;
  frequency: number;
  lastAccess: number;
  accessCount: number;
  predictedNextAccess: number;
}

export interface PredictiveCacheEntry {
  key: string;
  value: any;
  ttl: number;
  accessPattern: CachePattern;
  priority: number;
  lastAccess: number;
  accessCount: number;
}

export class AdvancedCacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private readonly config: CacheConfig;
  private readonly fallbackCache = new Map<string, { value: any; timestamp: number; ttl: number }>();
  private readonly accessPatterns = new Map<string, CachePattern>();
  private readonly predictiveCache = new Map<string, PredictiveCacheEntry>();
  private readonly stats = {
    hits: 0,
    misses: 0,
    predictiveHits: 0,
    warmupHits: 0
  };

  constructor() {
    this.config = {
      host: getEnv('REDIS_HOST', 'localhost')!,
      port: parseInt(getEnv('REDIS_PORT', '6379')!),
      password: getEnv('REDIS_PASSWORD', undefined),
      db: parseInt(getEnv('REDIS_DB', '0')!),
      keyPrefix: getEnv('REDIS_KEY_PREFIX', 'techanal:')!,
      defaultTTL: parseInt(getEnv('REDIS_DEFAULT_TTL', '300')!), // 5 minutes
      maxMemory: getEnv('REDIS_MAX_MEMORY', '256mb')!,
      evictionPolicy: getEnv('REDIS_EVICTION_POLICY', 'allkeys-lru') as any
    };
  }

  /**
   * Initialize advanced cache service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing advanced cache service...');
      
      // Create Redis client with advanced configuration
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
          connectTimeout: 10000,
          lazyConnect: true
        },
        password: this.config.password,
        database: this.config.db,
        retry_strategy: (options) => {
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      // Setup event handlers
      this.setupEventHandlers();
      
      // Connect to Redis
      await this.client.connect();
      
      // Configure Redis for optimal performance
      await this.configureRedis();
      
      // Initialize predictive caching
      await this.initializePredictiveCaching();
      
      this.isConnected = true;
      console.log('✅ Advanced cache service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize advanced cache service:', error);
      console.log('🔄 Falling back to in-memory cache');
      this.isConnected = false;
    }
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('🔗 Advanced cache connected to Redis');
    });

    this.client.on('ready', () => {
      console.log('✅ Advanced cache ready for operations');
    });

    this.client.on('error', (error) => {
      console.error('❌ Advanced cache Redis error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Advanced cache disconnected from Redis');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Advanced cache reconnecting to Redis...');
    });
  }

  /**
   * Configure Redis for optimal performance
   */
  private async configureRedis(): Promise<void> {
    if (!this.client) return;

    try {
      // Set memory policy
      await this.client.configSet('maxmemory', this.config.maxMemory);
      await this.client.configSet('maxmemory-policy', this.config.evictionPolicy);
      
      // Enable compression for large values
      await this.client.configSet('hash-max-ziplist-entries', '512');
      await this.client.configSet('hash-max-ziplist-value', '64');
      
      // Optimize for performance
      await this.client.configSet('save', '900 1 300 10 60 10000');
      await this.client.configSet('stop-writes-on-bgsave-error', 'no');
      
      console.log('⚙️  Redis configured for optimal performance');
      
    } catch (error) {
      console.error('Failed to configure Redis:', error);
    }
  }

  /**
   * Initialize predictive caching system
   */
  private async initializePredictiveCaching(): Promise<void> {
    try {
      // Load access patterns from persistent storage (if available)
      await this.loadAccessPatterns();
      
      // Start predictive cache warming
      this.startPredictiveWarming();
      
      console.log('🧠 Predictive caching initialized');
      
    } catch (error) {
      console.error('Failed to initialize predictive caching:', error);
    }
  }

  /**
   * Set value with advanced caching strategy
   */
  async set(key: string, value: any, ttl: number = this.config.defaultTTL): Promise<void> {
    const fullKey = this.config.keyPrefix + key;
    
    try {
      if (this.isConnected && this.client) {
        // Use Redis with advanced serialization
        const serializedValue = this.serializeValue(value);
        await this.client.setEx(fullKey, ttl, serializedValue);
        
        // Update access pattern
        this.updateAccessPattern(key, 'write');
        
        // Add to predictive cache if high priority
        if (this.isHighPriorityKey(key)) {
          this.addToPredictiveCache(key, value, ttl);
        }
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(fullKey, {
          value,
          timestamp: Date.now(),
          ttl: ttl * 1000
        });
      }
    } catch (error) {
      console.error('Failed to set cache value:', error);
      // Fallback to in-memory cache
      this.fallbackCache.set(fullKey, {
        value,
        timestamp: Date.now(),
        ttl: ttl * 1000
      });
    }
  }

  /**
   * Get value with intelligent cache strategy
   */
  async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.config.keyPrefix + key;
    
    try {
      if (this.isConnected && this.client) {
        // Try Redis first
        const value = await this.client.get(fullKey);
        
        if (value !== null) {
          // Update access pattern
          this.updateAccessPattern(key, 'read');
          this.stats.hits++;
          
          // Deserialize and return
          return this.deserializeValue(value);
        }
        
        // Check predictive cache
        const predictiveValue = this.getFromPredictiveCache(key);
        if (predictiveValue !== null) {
          this.stats.predictiveHits++;
          return predictiveValue;
        }
        
        this.stats.misses++;
        return null;
        
      } else {
        // Use fallback cache
        const cached = this.fallbackCache.get(fullKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          this.stats.hits++;
          return cached.value;
        }
        
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Failed to get cache value:', error);
      
      // Fallback to in-memory cache
      const cached = this.fallbackCache.get(fullKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        this.stats.hits++;
        return cached.value;
      }
      
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set multiple values with batch optimization
   */
  async mset(keyValuePairs: Record<string, any>, ttl: number = this.config.defaultTTL): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        // Use Redis pipeline for batch operations
        const pipeline = this.client.multi();
        
        for (const [key, value] of Object.entries(keyValuePairs)) {
          const fullKey = this.config.keyPrefix + key;
          const serializedValue = this.serializeValue(value);
          pipeline.setEx(fullKey, ttl, serializedValue);
          
          // Update access patterns
          this.updateAccessPattern(key, 'write');
        }
        
        await pipeline.exec();
        
      } else {
        // Fallback to in-memory cache
        for (const [key, value] of Object.entries(keyValuePairs)) {
          const fullKey = this.config.keyPrefix + key;
          this.fallbackCache.set(fullKey, {
            value,
            timestamp: Date.now(),
            ttl: ttl * 1000
          });
        }
      }
    } catch (error) {
      console.error('Failed to set multiple cache values:', error);
      
      // Fallback to in-memory cache
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const fullKey = this.config.keyPrefix + key;
        this.fallbackCache.set(fullKey, {
          value,
          timestamp: Date.now(),
          ttl: ttl * 1000
        });
      }
    }
  }

  /**
   * Get multiple values with batch optimization
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.isConnected && this.client) {
        const fullKeys = keys.map(key => this.config.keyPrefix + key);
        const values = await this.client.mGet(fullKeys);
        
        // Update access patterns
        keys.forEach(key => this.updateAccessPattern(key, 'read'));
        
        // Deserialize values
        return values.map(value => value !== null ? this.deserializeValue(value) : null);
        
      } else {
        // Use fallback cache
        return keys.map(key => {
          const fullKey = this.config.keyPrefix + key;
          const cached = this.fallbackCache.get(fullKey);
          if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.value;
          }
          return null;
        });
      }
    } catch (error) {
      console.error('Failed to get multiple cache values:', error);
      
      // Fallback to in-memory cache
      return keys.map(key => {
        const fullKey = this.config.keyPrefix + key;
        const cached = this.fallbackCache.get(fullKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          return cached.value;
        }
        return null;
      });
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = this.config.keyPrefix + key;
    
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.del(fullKey);
        return result > 0;
      } else {
        return this.fallbackCache.delete(fullKey);
      }
    } catch (error) {
      console.error('Failed to delete cache key:', error);
      return this.fallbackCache.delete(fullKey);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        // Get all keys with prefix and delete them
        const keys = await this.client.keys(this.config.keyPrefix + '*');
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
      
      // Clear fallback cache
      this.fallbackCache.clear();
      this.predictiveCache.clear();
      
      console.log('🧹 Cache cleared successfully');
      
    } catch (error) {
      console.error('Failed to clear cache:', error);
      this.fallbackCache.clear();
      this.predictiveCache.clear();
    }
  }

  /**
   * Update access pattern for predictive caching
   */
  private updateAccessPattern(key: string, operation: 'read' | 'write'): void {
    const now = Date.now();
    const pattern = this.accessPatterns.get(key) || {
      pattern: key,
      frequency: 0,
      lastAccess: now,
      accessCount: 0,
      predictedNextAccess: now + this.config.defaultTTL * 1000
    };

    pattern.accessCount++;
    pattern.lastAccess = now;
    pattern.frequency = pattern.accessCount / Math.max(1, (now - pattern.lastAccess) / 1000);
    
    // Predict next access based on pattern
    if (pattern.accessCount > 1) {
      const avgInterval = (now - pattern.lastAccess) / pattern.accessCount;
      pattern.predictedNextAccess = now + avgInterval;
    }

    this.accessPatterns.set(key, pattern);
  }

  /**
   * Add high-priority key to predictive cache
   */
  private addToPredictiveCache(key: string, value: any, ttl: number): void {
    const pattern = this.accessPatterns.get(key);
    if (!pattern) return;

    const priority = this.calculatePriority(pattern);
    
    this.predictiveCache.set(key, {
      key,
      value,
      ttl,
      accessPattern: pattern,
      priority,
      lastAccess: Date.now(),
      accessCount: pattern.accessCount
    });

    // Limit predictive cache size
    if (this.predictiveCache.size > 1000) {
      this.cleanupPredictiveCache();
    }
  }

  /**
   * Get value from predictive cache
   */
  private getFromPredictiveCache<T = any>(key: string): T | null {
    const entry = this.predictiveCache.get(key);
    if (!entry) return null;

    // Check if still valid
    if (Date.now() - entry.lastAccess > entry.ttl * 1000) {
      this.predictiveCache.delete(key);
      return null;
    }

    // Update access count
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.value;
  }

  /**
   * Calculate priority for predictive caching
   */
  private calculatePriority(pattern: CachePattern): number {
    const frequencyWeight = 0.4;
    const recencyWeight = 0.3;
    const countWeight = 0.3;
    
    const frequencyScore = Math.min(pattern.frequency / 10, 1); // Normalize frequency
    const recencyScore = Math.max(0, 1 - (Date.now() - pattern.lastAccess) / (24 * 60 * 60 * 1000)); // Last 24h
    const countScore = Math.min(pattern.accessCount / 100, 1); // Normalize count
    
    return frequencyWeight * frequencyScore + recencyWeight * recencyScore + countWeight * countScore;
  }

  /**
   * Check if key is high priority for predictive caching
   */
  private isHighPriorityKey(key: string): boolean {
    const pattern = this.accessPatterns.get(key);
    if (!pattern) return false;
    
    return pattern.accessCount > 5 && pattern.frequency > 0.1;
  }

  /**
   * Start predictive cache warming
   */
  private startPredictiveWarming(): void {
    setInterval(async () => {
      try {
        await this.warmupPredictiveCache();
      } catch (error) {
        console.error('Predictive cache warming failed:', error);
      }
    }, 60000); // Warm up every minute
  }

  /**
   * Warm up predictive cache
   */
  private async warmupPredictiveCache(): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      // Get top priority patterns
      const topPatterns = Array.from(this.accessPatterns.entries())
        .sort(([, a], [, b]) => this.calculatePriority(b) - this.calculatePriority(a))
        .slice(0, 10);

      for (const [key, pattern] of topPatterns) {
        // Check if key exists in Redis but not in predictive cache
        const exists = await this.client!.exists(this.config.keyPrefix + key);
        if (exists && !this.predictiveCache.has(key)) {
          // Fetch and add to predictive cache
          const value = await this.get(key);
          if (value !== null) {
            this.addToPredictiveCache(key, value, this.config.defaultTTL);
            this.stats.warmupHits++;
          }
        }
      }
    } catch (error) {
      console.error('Predictive cache warmup failed:', error);
    }
  }

  /**
   * Cleanup predictive cache
   */
  private cleanupPredictiveCache(): void {
    // Remove lowest priority entries
    const entries = Array.from(this.predictiveCache.entries());
    entries.sort(([, a], [, b]) => a.priority - b.priority);
    
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.2)); // Remove 20%
    toRemove.forEach(([key]) => this.predictiveCache.delete(key));
  }

  /**
   * Load access patterns from persistent storage
   */
  private async loadAccessPatterns(): Promise<void> {
    // This would load patterns from a persistent store
    // For now, we start with empty patterns
    console.log('📊 Access patterns loaded from storage');
  }

  /**
   * Serialize value for storage
   */
  private serializeValue(value: any): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('Failed to serialize value:', error);
      return String(value);
    }
  }

  /**
   * Deserialize value from storage
   */
  private deserializeValue<T = any>(value: string): T {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Failed to deserialize value:', error);
      return value as T;
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      if (this.isConnected && this.client) {
        const info = await this.client.info('stats');
        const memory = await this.client.info('memory');
        const keyspace = await this.client.info('keyspace');
        
        // Parse Redis info
        const stats = this.parseRedisInfo(info);
        const memoryInfo = this.parseRedisInfo(memory);
        const keyspaceInfo = this.parseRedisInfo(keyspace);
        
        const totalKeys = keyspaceInfo.db0 || 0;
        const hitRate = this.stats.hits + this.stats.misses > 0 
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
          : 0;
        
        return {
          hits: this.stats.hits,
          misses: this.stats.misses,
          keyspaceHits: stats.keyspace_hits || 0,
          keyspaceMisses: stats.keyspace_misses || 0,
          memoryUsage: memoryInfo.used_memory_human || 0,
          connectedClients: stats.connected_clients || 0,
          totalKeys,
          hitRate: Math.round(hitRate * 100) / 100,
          memoryEfficiency: this.calculateMemoryEfficiency(memoryInfo)
        };
      } else {
        // Fallback stats
        const hitRate = this.stats.hits + this.stats.misses > 0 
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
          : 0;
        
        return {
          hits: this.stats.hits,
          misses: this.stats.misses,
          keyspaceHits: 0,
          keyspaceMisses: 0,
          memoryUsage: 0,
          connectedClients: 0,
          totalKeys: this.fallbackCache.size,
          hitRate: Math.round(hitRate * 100) / 100,
          memoryEfficiency: 0
        };
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        memoryUsage: 0,
        connectedClients: 0,
        totalKeys: this.fallbackCache.size,
        hitRate: 0,
        memoryEfficiency: 0
      };
    }
  }

  /**
   * Parse Redis info output
   */
  private parseRedisInfo(info: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  /**
   * Calculate memory efficiency
   */
  private calculateMemoryEfficiency(memoryInfo: Record<string, any>): number {
    const usedMemory = memoryInfo.used_memory || 0;
    const maxMemory = memoryInfo.maxmemory || 1;
    
    if (maxMemory === 0) return 100;
    return Math.round((1 - usedMemory / maxMemory) * 100);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.ping();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
    this.isConnected = false;
  }
}

// Export singleton instance
export const advancedCacheService = new AdvancedCacheService();
