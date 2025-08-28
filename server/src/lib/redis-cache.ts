import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  prefix?: string; // Key prefix for namespacing
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  cacheSize: number;
}

export class RedisCacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly keyPrefix: string;

  constructor(prefix: string = 'techanal') {
    this.keyPrefix = prefix;
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('🔗 Redis connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis ready');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Redis disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options: Partial<CacheOptions> = {}): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      const fullKey = this.generateKey(key);
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);
      
      await this.client.setEx(fullKey, Math.ceil(ttl / 1000), serializedValue);
      
      // Update stats
      this.stats.totalRequests++;
    } catch (error) {
      console.error('Failed to set cache value:', error);
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      console.warn('Redis not connected, returning null');
      return null;
    }

    try {
      const fullKey = this.generateKey(key);
      const value = await this.client.get(fullKey);
      
      // Update stats
      this.stats.totalRequests++;
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value) as T;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Failed to get cache value:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const fullKey = this.generateKey(key);
      await this.client.del(fullKey);
    } catch (error) {
      console.error('Failed to delete cache value:', error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const fullKey = this.generateKey(key);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Failed to check cache existence:', error);
      return false;
    }
  }

  /**
   * Set multiple values in cache
   */
  async mset(values: Record<string, any>, options: Partial<CacheOptions> = {}): Promise<void> {
    if (!this.isConnected) return;

    try {
      const ttl = options.ttl || this.defaultTTL;
      const pipeline = this.client.multi();
      
      for (const [key, value] of Object.entries(values)) {
        const fullKey = this.generateKey(key);
        const serializedValue = JSON.stringify(value);
        pipeline.setEx(fullKey, Math.ceil(ttl / 1000), serializedValue);
      }
      
      await pipeline.exec();
      
      // Update stats
      this.stats.totalRequests += Object.keys(values).length;
    } catch (error) {
      console.error('Failed to set multiple cache values:', error);
      throw error;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isConnected) {
      return keys.map(() => null);
    }

    try {
      const fullKeys = keys.map(key => this.generateKey(key));
      const values = await this.client.mGet(fullKeys);
      
      // Update stats
      this.stats.totalRequests += keys.length;
      
      return values.map(value => {
        if (value) {
          this.stats.hits++;
          try {
            return JSON.parse(value) as T;
          } catch {
            this.stats.misses++;
            return null;
          }
        } else {
          this.stats.misses++;
          return null;
        }
      });
    } catch (error) {
      console.error('Failed to get multiple cache values:', error);
      this.stats.misses += keys.length;
      return keys.map(() => null);
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, value: number = 1): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const fullKey = this.generateKey(key);
      return await this.client.incrBy(fullKey, value);
    } catch (error) {
      console.error('Failed to increment cache value:', error);
      return 0;
    }
  }

  /**
   * Set cache with hash
   */
  async hset(key: string, field: string, value: any, options: Partial<CacheOptions> = {}): Promise<void> {
    if (!this.isConnected) return;

    try {
      const fullKey = this.generateKey(key);
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);
      
      await this.client.hSet(fullKey, field, serializedValue);
      await this.client.expire(fullKey, Math.ceil(ttl / 1000));
      
      this.stats.totalRequests++;
    } catch (error) {
      console.error('Failed to set hash cache value:', error);
      throw error;
    }
  }

  /**
   * Get cache with hash
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const fullKey = this.generateKey(key);
      const value = await this.client.hGet(fullKey, field);
      
      this.stats.totalRequests++;
      
      if (value) {
        this.stats.hits++;
        return JSON.parse(value) as T;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Failed to get hash cache value:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    if (!this.isConnected) return null;

    try {
      const fullKey = this.generateKey(key);
      const values = await this.client.hGetAll(fullKey);
      
      this.stats.totalRequests++;
      
      if (Object.keys(values).length > 0) {
        this.stats.hits++;
        const result: Record<string, T> = {};
        
        for (const [field, value] of Object.entries(values)) {
          try {
            result[field] = JSON.parse(value) as T;
          } catch {
            // Skip invalid JSON values
          }
        }
        
        return result;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Failed to get all hash cache values:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Clear all cache keys with prefix
   */
  async clear(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const pattern = `${this.keyPrefix}:*`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`Cleared ${keys.length} cache keys`);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.stats.totalRequests,
      cacheSize: 0 // Would need Redis INFO command for actual size
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<any> {
    if (!this.isConnected) return null;

    try {
      return await this.client.info();
    } catch (error) {
      console.error('Failed to get Redis info:', error);
      return null;
    }
  }
}

// Fallback cache service when Redis is not available
export class FallbackCacheService {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };

  async set(key: string, value: any, options: Partial<CacheOptions> = {}): Promise<void> {
    const ttl = options.ttl || 5 * 60 * 1000;
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
    
    this.stats.totalRequests++;
  }

  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++;
    
    const cached = this.cache.get(key);
    if (!cached) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return cached.value as T;
  }

  getStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.stats.totalRequests,
      cacheSize: this.cache.size
    };
  }
}

// Export singleton instances
export const redisCacheService = new RedisCacheService();
export const fallbackCacheService = new FallbackCacheService();
