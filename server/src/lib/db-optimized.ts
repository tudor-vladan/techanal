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
}

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  queryCount: number;
  averageQueryTime: number;
  cacheHitRate: number;
}

export class DatabaseServiceOptimized {
  private pool: Pool | null = null;
  private drizzle: any = null;
  private isConnected: boolean = false;
  private stats = {
    queryCount: 0,
    totalQueryTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: getEnv('DB_HOST', 'localhost')!,
      port: parseInt(getEnv('DB_PORT', '5432')!),
      database: getEnv('DB_NAME', 'techanal')!,
      username: getEnv('DB_USER', 'postgres')!,
      password: getEnv('DB_PASSWORD', '')!,
      ssl: getEnv('DB_SSL', 'false') === 'true',
      maxConnections: parseInt(getEnv('DB_MAX_CONNECTIONS', '20')!),
      idleTimeout: parseInt(getEnv('DB_IDLE_TIMEOUT', '30000')!),
      connectionTimeout: parseInt(getEnv('DB_CONNECTION_TIMEOUT', '10000')!)
    };
  }

  /**
   * Initialize database connection pool
   */
  async initialize(): Promise<void> {
    try {
      // Create connection pool
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        max: this.config.maxConnections,
        idleTimeoutMillis: this.config.idleTimeout,
        connectionTimeoutMillis: this.config.connectionTimeout,
        
        // Connection pool settings
        allowExitOnIdle: false,
        maxUses: 1000, // Close connections after 1000 queries
        
        // Performance settings
        statement_timeout: 30000, // 30 seconds
        query_timeout: 30000, // 30 seconds
        
        // SSL settings
        ssl: this.config.ssl ? {
          rejectUnauthorized: false
        } : false
      });

      // Setup pool event handlers
      this.setupPoolEventHandlers();

      // Test connection
      await this.testConnection();
      
      // Initialize Drizzle ORM
      await this.initializeDrizzle();
      
      this.isConnected = true;
      console.log('✅ Database connection pool initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize database connection pool:', error);
      throw error;
    }
  }

  /**
   * Setup pool event handlers
   */
  private setupPoolEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('connect', (client) => {
      console.log('🔗 New database client connected');
    });

    this.pool.on('acquire', (client) => {
      console.log('📥 Database client acquired from pool');
    });

    this.pool.on('release', (client) => {
      console.log('📤 Database client released to pool');
    });

    this.pool.on('error', (err, client) => {
      console.error('❌ Database pool error:', err);
    });

    this.pool.on('remove', (client) => {
      console.log('🗑️ Database client removed from pool');
    });
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) throw new Error('Database pool not initialized');

    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      console.log('✅ Database connection test successful');
      console.log(`  Current time: ${result.rows[0].current_time}`);
      console.log(`  Database version: ${result.rows[0].db_version.split(' ')[0]}`);
    } finally {
      client.release();
    }
  }

  /**
   * Initialize Drizzle ORM with connection pool
   */
  private async initializeDrizzle(): Promise<void> {
    try {
      // Create postgres client with connection pool
      const sql = postgres({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        username: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        
        // Connection pool settings
        max: this.config.maxConnections,
        idle_timeout: this.config.idleTimeout / 1000,
        connect_timeout: this.config.connectionTimeout / 1000,
        
        // Performance settings
        statement_timeout: 30000,
        query_timeout: 30000,
        
        // Connection management
        onnotice: () => {}, // Suppress notices
        onparameter: () => {}, // Suppress parameter changes
      });

      // Initialize Drizzle
      this.drizzle = drizzle(sql);
      console.log('✅ Drizzle ORM initialized with connection pool');
      
    } catch (error) {
      console.error('❌ Failed to initialize Drizzle ORM:', error);
      throw error;
    }
  }

  /**
   * Execute query with performance monitoring
   */
  async query<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) throw new Error('Database pool not initialized');

    const startTime = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(queryText, params);
      
      // Update stats
      const queryTime = Date.now() - startTime;
      this.stats.queryCount++;
      this.stats.totalQueryTime += queryTime;
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Execute transaction with performance monitoring
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
   * Get database statistics
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
        cacheHitRate: this.stats.queryCount > 0 ? (this.stats.cacheHits / this.stats.queryCount) * 100 : 0
      };
    }

    try {
      const poolStats = this.pool.totalCount;
      const idleStats = this.pool.idleCount;
      const waitingStats = this.pool.waitingCount;
      const activeStats = poolStats - idleStats;

      return {
        totalConnections: poolStats,
        activeConnections: activeStats,
        idleConnections: idleStats,
        waitingConnections: waitingStats,
        queryCount: this.stats.queryCount,
        averageQueryTime: this.stats.queryCount > 0 ? this.stats.totalQueryTime / this.stats.queryCount : 0,
        cacheHitRate: this.stats.queryCount > 0 ? (this.stats.cacheHits / this.stats.queryCount) * 100 : 0
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
        cacheHitRate: this.stats.queryCount > 0 ? (this.stats.cacheHits / this.stats.queryCount) * 100 : 0
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database health check failed:', error);
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
   * Close database connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('🔌 Database connections closed');
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
      cacheMisses: 0
    };
  }

  /**
   * Optimize database performance
   */
  async optimizePerformance(): Promise<void> {
    if (!this.pool) return;

    try {
      console.log('🔧 Optimizing database performance...');
      
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
      
      console.log('✅ Database performance optimization completed');
      
    } catch (error) {
      console.error('❌ Database performance optimization failed:', error);
    }
  }

  /**
   * Get connection pool status
   */
  getPoolStatus(): { isConnected: boolean; poolSize: number } {
    return {
      isConnected: this.isConnected,
      poolSize: this.pool ? this.pool.totalCount : 0
    };
  }
}

// Export singleton instance
export const databaseServiceOptimized = new DatabaseServiceOptimized();
