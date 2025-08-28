import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Pool } from 'pg';
import { getEnv } from './env';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  acquireTimeout: number;
  preWarmConnections: number;
}

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  queryCount: number;
  averageQueryTime: number;
  cacheHitRate: number;
  connectionAcquisitionTime: number;
  poolUtilization: number;
}

export class DatabaseServiceOptimizedV2 {
  private pool: Pool | null = null;
  private drizzle: any = null;
  private isConnected: boolean = false;
  private connectionCache = new Map<string, any>(); // Connection reuse cache
  private stats = {
    queryCount: 0,
    totalQueryTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    connectionAcquisitionTime: 0,
    connectionReuseCount: 0
  };
  private config: DatabaseConfig;
  private preWarmedConnections: any[] = [];

  constructor() {
    this.config = {
      host: getEnv('DB_HOST', 'localhost')!,
      port: parseInt(getEnv('DB_PORT', '5432')!),
      database: getEnv('DB_NAME', 'techanal')!,
      username: getEnv('DB_USER', 'postgres')!,
      password: getEnv('DB_PASSWORD', '')!,
      ssl: getEnv('DB_SSL', 'false') === 'true',
      maxConnections: parseInt(getEnv('DB_MAX_CONNECTIONS', '25')!), // Increased from 20
      idleTimeout: parseInt(getEnv('DB_IDLE_TIMEOUT', '60000')!), // Increased to 1 minute
      connectionTimeout: parseInt(getEnv('DB_CONNECTION_TIMEOUT', '5000')!), // Reduced from 10s
      acquireTimeout: parseInt(getEnv('DB_ACQUIRE_TIMEOUT', '2000')!), // New: 2s acquisition timeout
      preWarmConnections: parseInt(getEnv('DB_PREWARM_CONNECTIONS', '5')!) // New: pre-warm 5 connections
    };
  }

  /**
   * Initialize database connection pool with optimizations
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing optimized database connection pool...');
      
      // Create optimized connection pool
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        
        // Optimized pool settings
        max: this.config.maxConnections,
        idleTimeoutMillis: this.config.idleTimeout,
        connectionTimeoutMillis: this.config.connectionTimeout,
        
        // Performance optimizations
        allowExitOnIdle: false,
        maxUses: 2000, // Increased from 1000 - connections last longer
        
        // Connection acquisition optimization
        acquireTimeoutMillis: this.config.acquireTimeout,
        
        // Statement and query timeouts
        statement_timeout: 30000,
        query_timeout: 30000,
        
        // SSL settings
        ssl: this.config.ssl ? {
          rejectUnauthorized: false
        } : false
      });

      // Setup optimized pool event handlers
      this.setupOptimizedPoolEventHandlers();

      // Pre-warm connections for faster acquisition
      await this.preWarmConnections();
      
      // Test connection
      await this.testConnection();
      
      // Initialize Drizzle ORM with optimized settings
      await this.initializeOptimizedDrizzle();
      
      this.isConnected = true;
      console.log('✅ Optimized database connection pool initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize optimized database connection pool:', error);
      throw error;
    }
  }

  /**
   * Setup optimized pool event handlers
   */
  private setupOptimizedPoolEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('connect', (client) => {
      console.log('🔗 New database client connected (optimized)');
      
      // Set client-specific optimizations
      client.query('SET statement_timeout = 30000');
      client.query('SET query_timeout = 30000');
      client.query('SET idle_in_transaction_session_timeout = 30000');
    });

    this.pool.on('acquire', (client) => {
      console.log('📥 Database client acquired from pool (optimized)');
    });

    this.pool.on('release', (client) => {
      console.log('📤 Database client released to pool (optimized)');
    });

    this.pool.on('error', (err, client) => {
      console.error('❌ Database pool error (optimized):', err);
    });

    this.pool.on('remove', (client) => {
      console.log('🗑️ Database client removed from pool (optimized)');
    });
  }

  /**
   * Pre-warm connections for faster acquisition
   */
  private async preWarmConnections(): Promise<void> {
    if (!this.pool) return;

    try {
      console.log(`🔥 Pre-warming ${this.config.preWarmConnections} database connections...`);
      
      const preWarmPromises = [];
      for (let i = 0; i < this.config.preWarmConnections; i++) {
        preWarmPromises.push(this.pool.connect());
      }
      
      const connections = await Promise.all(preWarmPromises);
      
      // Store pre-warmed connections
      this.preWarmedConnections = connections;
      
      // Release them back to the pool
      connections.forEach(client => client.release());
      
      console.log(`✅ Pre-warmed ${this.config.preWarmConnections} connections successfully`);
      
    } catch (error) {
      console.error('❌ Failed to pre-warm connections:', error);
    }
  }

  /**
   * Test database connection with optimized settings
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) throw new Error('Database pool not initialized');

    const startTime = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      const connectionTime = Date.now() - startTime;
      
      console.log('✅ Optimized database connection test successful');
      console.log(`  Current time: ${result.rows[0].current_time}`);
      console.log(`  Database version: ${result.rows[0].db_version.split(' ')[0]}`);
      console.log(`  Connection time: ${connectionTime}ms`);
      
      // Update stats
      this.stats.connectionAcquisitionTime = connectionTime;
      
    } finally {
      client.release();
    }
  }

  /**
   * Initialize Drizzle ORM with optimized connection settings
   */
  private async initializeOptimizedDrizzle(): Promise<void> {
    try {
      // Create postgres client with optimized connection pool
      const sql = postgres({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        username: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        
        // Optimized connection pool settings
        max: this.config.maxConnections,
        idle_timeout: this.config.idleTimeout / 1000,
        connect_timeout: this.config.connectionTimeout / 1000,
        acquire_timeout: this.config.acquireTimeout / 1000,
        
        // Performance settings
        statement_timeout: 30000,
        query_timeout: 30000,
        
        // Connection management optimizations
        onnotice: () => {}, // Suppress notices
        onparameter: () => {}, // Suppress parameter changes
        
        // Connection reuse optimization
        max_lifetime: 3600, // 1 hour max connection lifetime
        connection: {
          application_name: 'techanal-optimized'
        }
      });

      // Initialize Drizzle with optimized client
      this.drizzle = drizzle(sql);
      console.log('✅ Optimized Drizzle ORM initialized with connection pool');
      
    } catch (error) {
      console.error('❌ Failed to initialize optimized Drizzle ORM:', error);
      throw error;
    }
  }

  /**
   * Execute query with connection reuse and performance monitoring
   */
  async query<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) throw new Error('Database pool not initialized');

    const startTime = Date.now();
    const connectionStartTime = Date.now();
    
    // Try to reuse existing connection from cache
    const cacheKey = this.generateConnectionCacheKey(queryText, params);
    let client = this.connectionCache.get(cacheKey);
    
    if (!client) {
      // Acquire new connection from pool
      client = await this.pool.connect();
      this.connectionCache.set(cacheKey, client);
    } else {
      this.stats.connectionReuseCount++;
    }
    
    const connectionTime = Date.now() - connectionStartTime;
    
    try {
      const result = await client.query(queryText, params);
      
      // Update stats
      const queryTime = Date.now() - startTime;
      this.stats.queryCount++;
      this.stats.totalQueryTime += queryTime;
      this.stats.connectionAcquisitionTime = Math.min(this.stats.connectionAcquisitionTime, connectionTime);
      
      return result.rows;
    } finally {
      // Don't release client immediately - keep it in cache for reuse
      // Only release if cache gets too large
      if (this.connectionCache.size > this.config.maxConnections) {
        this.cleanupConnectionCache();
      }
    }
  }

  /**
   * Execute transaction with optimized connection handling
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('Database pool not initialized');

    const startTime = Date.now();
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      // Update stats
      const queryTime = Date.now() - startTime;
      this.stats.queryCount++;
      this.stats.totalQueryTime += queryTime;
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate cache key for connection reuse
   */
  private generateConnectionCacheKey(queryText: string, params: any[]): string {
    const queryHash = this.hashString(queryText);
    const paramsHash = this.hashString(JSON.stringify(params));
    return `${queryHash}-${paramsHash}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Cleanup connection cache to prevent memory leaks
   */
  private cleanupConnectionCache(): void {
    const maxCacheSize = Math.floor(this.config.maxConnections * 0.8);
    
    if (this.connectionCache.size > maxCacheSize) {
      const entries = Array.from(this.connectionCache.entries());
      const toRemove = entries.slice(0, this.connectionCache.size - maxCacheSize);
      
      toRemove.forEach(([key, client]) => {
        client.release();
        this.connectionCache.delete(key);
      });
      
      console.log(`🧹 Cleaned up ${toRemove.length} connections from cache`);
    }
  }

  /**
   * Execute batch queries for better performance
   */
  async batchQuery<T = any>(queries: Array<{ text: string; params: any[] }>): Promise<T[][]> {
    if (!this.pool) throw new Error('Database pool not initialized');

    const startTime = Date.now();
    const client = await this.pool.connect();
    
    try {
      const results = [];
      
      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result.rows);
      }
      
      // Update stats
      const queryTime = Date.now() - startTime;
      this.stats.queryCount += queries.length;
      this.stats.totalQueryTime += queryTime;
      
      return results;
    } finally {
      client.release();
    }
  }

  /**
   * Get comprehensive database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    if (!this.pool) {
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingConnections: 0,
        queryCount: this.stats.queryCount,
        averageQueryTime: this.stats.queryCount > 0 ? this.stats.totalQueryTime / this.stats.queryCount : 0,
        cacheHitRate: this.stats.queryCount > 0 ? (this.stats.cacheHits / this.stats.queryCount) * 100 : 0,
        connectionAcquisitionTime: this.stats.connectionAcquisitionTime,
        poolUtilization: 0
      };
    }

    try {
      const poolStats = this.pool.totalCount;
      const idleStats = this.pool.idleCount;
      const waitingStats = this.pool.waitingCount;
      const activeStats = poolStats - idleStats;
      const poolUtilization = (activeStats / poolStats) * 100;

      return {
        totalConnections: poolStats,
        activeConnections: activeStats,
        idleConnections: idleStats,
        waitingConnections: waitingStats,
        queryCount: this.stats.queryCount,
        averageQueryTime: this.stats.queryCount > 0 ? this.stats.totalQueryTime / this.stats.queryCount : 0,
        cacheHitRate: this.stats.queryCount > 0 ? (this.stats.cacheHits / this.stats.queryCount) * 100 : 0,
        connectionAcquisitionTime: this.stats.connectionAcquisitionTime,
        poolUtilization: Math.round(poolUtilization * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingConnections: 0,
        queryCount: this.stats.queryCount,
        averageQueryTime: this.stats.queryCount > 0 ? this.stats.totalQueryTime / this.stats.queryCount : 0,
        cacheHitRate: this.stats.queryCount > 0 ? (this.stats.cacheHits / this.stats.queryCount) * 100 : 0,
        connectionAcquisitionTime: this.stats.connectionAcquisitionTime,
        poolUtilization: 0
      };
    }
  }

  /**
   * Health check with performance metrics
   */
  async healthCheck(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const startTime = Date.now();
      const client = await this.pool.connect();
      
      try {
        await client.query('SELECT 1');
        const healthCheckTime = Date.now() - startTime;
        
        console.log(`✅ Database health check passed in ${healthCheckTime}ms`);
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get Drizzle instance
   */
  getDrizzle(): any {
    if (!this.drizzle) {
      throw new Error('Drizzle ORM not initialized');
    }
    return this.drizzle;
  }

  /**
   * Close database connections and cleanup
   */
  async close(): Promise<void> {
    if (this.pool) {
      // Release all cached connections
      for (const client of this.connectionCache.values()) {
        client.release();
      }
      this.connectionCache.clear();
      
      // Close the pool
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('🔌 Optimized database connections closed and cleaned up');
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      queryCount: 0,
      totalQueryTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      connectionAcquisitionTime: 0,
      connectionReuseCount: 0
    };
  }

  /**
   * Optimize database performance with advanced techniques
   */
  async optimizePerformance(): Promise<void> {
    if (!this.pool) return;

    try {
      console.log('🔧 Running advanced database performance optimization...');
      
      // Analyze tables for better query planning
      await this.query('ANALYZE');
      
      // Update table statistics
      await this.query('VACUUM ANALYZE');
      
      // Check for long-running queries
      const longQueries = await this.query(`
        SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
        FROM pg_stat_activity 
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
      `);
      
      if (longQueries.length > 0) {
        console.log(`⚠️  Found ${longQueries.length} long-running queries`);
        longQueries.forEach(query => {
          console.log(`  PID ${query.pid}: ${query.duration} - ${query.query.substring(0, 100)}...`);
        });
      }
      
      // Optimize connection pool settings
      await this.optimizeConnectionPool();
      
      console.log('✅ Advanced database performance optimization completed');
      
    } catch (error) {
      console.error('❌ Advanced database performance optimization failed:', error);
    }
  }

  /**
   * Optimize connection pool settings dynamically
   */
  private async optimizeConnectionPool(): Promise<void> {
    if (!this.pool) return;

    try {
      const stats = await this.getStats();
      
      // Adjust pool size based on utilization
      if (stats.poolUtilization > 80) {
        console.log('📈 High pool utilization detected, considering pool size increase');
      } else if (stats.poolUtilization < 20) {
        console.log('📉 Low pool utilization detected, considering pool size decrease');
      }
      
      // Optimize based on connection acquisition time
      if (this.stats.connectionAcquisitionTime > 10) {
        console.log('⏱️  High connection acquisition time detected, optimizing pool settings');
      }
      
    } catch (error) {
      console.error('Failed to optimize connection pool:', error);
    }
  }

  /**
   * Get connection pool status with detailed metrics
   */
  getPoolStatus(): { isConnected: boolean; poolSize: number; cacheSize: number; reuseRate: number } {
    const reuseRate = this.stats.queryCount > 0 
      ? (this.stats.connectionReuseCount / this.stats.queryCount) * 100 
      : 0;

    return {
      isConnected: this.isConnected,
      poolSize: this.pool ? this.pool.totalCount : 0,
      cacheSize: this.connectionCache.size,
      reuseRate: Math.round(reuseRate * 100) / 100
    };
  }
}

// Export singleton instance
export const databaseServiceOptimizedV2 = new DatabaseServiceOptimizedV2();
