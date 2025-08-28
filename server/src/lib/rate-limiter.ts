// Rate Limiter pentru TechAnal API
import { Context } from 'hono';

export interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (ctx: Context) => string;
  handler?: (ctx: Context, retryAfter: number) => Response;
  onLimitReached?: (ctx: Context, retryAfter: number) => void;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
}

export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (ctx: Context) => this.defaultKeyGenerator(ctx),
      handler: (ctx: Context, retryAfter: number) => this.defaultHandler(ctx, retryAfter),
      onLimitReached: () => {},
      ...config
    };
  }

  private defaultKeyGenerator(ctx: Context): string {
    // Use IP address as default key
    const ip = ctx.req.header('x-forwarded-for') || 
               ctx.req.header('x-real-ip') || 
               'unknown';
    
    // Add user ID if authenticated
    const userId = ctx.get('user')?.id;
    if (userId) {
      return `${ip}:${userId}`;
    }
    
    return ip;
  }

  private defaultHandler(ctx: Context, retryAfter: number): Response {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(retryAfter / 1000)
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(retryAfter / 1000).toString(),
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + retryAfter / 1000).toString()
      }
    });
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getRateLimitInfo(key: string): RateLimitInfo {
    const now = Date.now();
    const entry = this.store.get(key);
    
    if (!entry || now > entry.resetTime) {
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
        retryAfter: 0
      };
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const reset = entry.resetTime;
    const retryAfter = Math.max(0, reset - now);

    return {
      limit: this.config.maxRequests,
      remaining,
      reset,
      retryAfter
    };
  }

  middleware() {
    return async (ctx: Context, next: () => Promise<void>) => {
      // Cleanup expired entries
      this.cleanup();

      // Generate key for this request
      const key = this.config.keyGenerator!(ctx);
      
      // Get current rate limit info
      const info = this.getRateLimitInfo(key);
      
      // Check if limit exceeded
      if (info.remaining === 0) {
        // Call custom handler or use default
        const response = this.config.handler!(ctx, info.retryAfter);
        
        // Call onLimitReached callback
        this.config.onLimitReached!(ctx, info.retryAfter);
        
        return response;
      }

      // Add rate limit headers
      ctx.header('X-RateLimit-Limit', info.limit.toString());
      ctx.header('X-RateLimit-Remaining', (info.remaining - 1).toString());
      ctx.header('X-RateLimit-Reset', Math.ceil(info.reset / 1000).toString());

      // Update store
      const entry = this.store.get(key);
      if (entry && Date.now() <= entry.resetTime) {
        entry.count++;
      } else {
        this.store.set(key, {
          count: 1,
          resetTime: Date.now() + this.config.windowMs
        });
      }

      // Continue to next middleware
      await next();

      // Handle successful/failed requests
      const status = ctx.res.status;
      if (this.config.skipSuccessfulRequests && status < 400) {
        // Don't count successful requests
        const entry = this.store.get(key);
        if (entry) {
          entry.count = Math.max(0, entry.count - 1);
        }
      }

      if (this.config.skipFailedRequests && status >= 400) {
        // Don't count failed requests
        const entry = this.store.get(key);
        if (entry) {
          entry.count = Math.max(0, entry.count - 1);
        }
      }
    };
  }

  // Utility methods
  getStoreSize(): number {
    return this.store.size;
  }

  getStoreKeys(): string[] {
    return Array.from(this.store.keys());
  }

  clearStore(): void {
    this.store.clear();
  }

  getKeyInfo(key: string): RateLimitInfo | null {
    if (!this.store.has(key)) return null;
    return this.getRateLimitInfo(key);
  }

  // Static factory methods for common configurations
  static strict() {
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    });
  }

  static moderate() {
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000
    });
  }

  static lenient() {
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10000
    });
  }

  static perMinute(maxRequests: number) {
    return new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests
    });
  }

  static perHour(maxRequests: number) {
    return new RateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests
    });
  }

  static perDay(maxRequests: number) {
    return new RateLimiter({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests
    });
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // Global API limits
  global: RateLimiter.moderate(),
  
  // Authentication endpoints - stricter limits
  auth: RateLimiter.perMinute(5),
  
  // AI endpoints - moderate limits due to cost
  ai: RateLimiter.perMinute(20),
  
  // System monitoring - higher limits
  system: RateLimiter.perMinute(100),
  
  // File uploads - strict limits
  upload: RateLimiter.perMinute(10),
  
  // Database operations - moderate limits
  database: RateLimiter.perMinute(50)
};

// Export default rate limiter
export default RateLimiter;
