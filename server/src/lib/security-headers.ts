import { Context, Next } from 'hono';

export interface SecurityHeadersConfig {
  enableHSTS?: boolean;
  enableCSP?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  enableXSSProtection?: boolean;
  enableDNSPrefetchControl?: boolean;
  enableExpectCT?: boolean;
  enableCrossOriginEmbedderPolicy?: boolean;
  enableCrossOriginOpenerPolicy?: boolean;
  enableCrossOriginResourcePolicy?: boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  enableHSTS: true,
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  enableXSSProtection: true,
  enableDNSPrefetchControl: true,
  enableExpectCT: true,
  enableCrossOriginEmbedderPolicy: true,
  enableCrossOriginOpenerPolicy: true,
  enableCrossOriginResourcePolicy: true
};

export function securityHeaders(config: SecurityHeadersConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (c: Context, next: Next) => {
    // Apply security headers before processing the request
    if (finalConfig.enableHSTS) {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    if (finalConfig.enableCSP) {
      c.header('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' ws: wss:",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests"
      ].join('; '));
    }

    if (finalConfig.enableXFrameOptions) {
      c.header('X-Frame-Options', 'SAMEORIGIN');
    }

    if (finalConfig.enableXContentTypeOptions) {
      c.header('X-Content-Type-Options', 'nosniff');
    }

    if (finalConfig.enableReferrerPolicy) {
      c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    if (finalConfig.enablePermissionsPolicy) {
      c.header('Permissions-Policy', [
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'battery=()',
        'camera=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=()',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=()',
        'geolocation=()',
        'gyroscope=()',
        'keyboard-map=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'navigation-override=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=()',
        'xr-spatial-tracking=()'
      ].join(', '));
    }

    if (finalConfig.enableXSSProtection) {
      c.header('X-XSS-Protection', '1; mode=block');
    }

    if (finalConfig.enableDNSPrefetchControl) {
      c.header('X-DNS-Prefetch-Control', 'off');
    }

    if (finalConfig.enableExpectCT) {
      c.header('Expect-CT', 'max-age=86400, enforce, report-uri="https://example.com/report"');
    }

    if (finalConfig.enableCrossOriginEmbedderPolicy) {
      c.header('Cross-Origin-Embedder-Policy', 'require-corp');
    }

    if (finalConfig.enableCrossOriginOpenerPolicy) {
      c.header('Cross-Origin-Opener-Policy', 'same-origin');
    }

    if (finalConfig.enableCrossOriginResourcePolicy) {
      c.header('Cross-Origin-Resource-Policy', 'same-origin');
    }

    // Additional security headers
    c.header('X-Permitted-Cross-Domain-Policies', 'none');
    c.header('X-Download-Options', 'noopen');
    c.header('X-Powered-By', ''); // Remove server signature

    // Continue to next middleware
    await next();
  };
}

// Specialized security headers for different contexts
export function apiSecurityHeaders() {
  return async (c: Context, next: Next) => {
    // API-specific security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'no-referrer');
    
    // CORS headers (if needed)
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    await next();
  };
}

export function staticAssetsSecurityHeaders() {
  return async (c: Context, next: Next) => {
    // Security headers for static assets
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    
    await next();
  };
}

export function adminSecurityHeaders() {
  return async (c: Context, next: Next) => {
    // Enhanced security for admin routes
    c.header('X-Frame-Options', 'DENY');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    await next();
  };
}

// Security header validation
export function validateSecurityHeaders(headers: Record<string, string>): {
  valid: boolean;
  missing: string[];
  recommendations: string[];
} {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];

  const recommendedHeaders = [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'Referrer-Policy',
    'Permissions-Policy'
  ];

  const missing = requiredHeaders.filter(header => !headers[header]);
  const missingRecommended = recommendedHeaders.filter(header => !headers[header]);

  return {
    valid: missing.length === 0,
    missing,
    recommendations: missingRecommended
  };
}

// Security header testing utility
export function testSecurityHeaders(url: string): Promise<{
  url: string;
  headers: Record<string, string>;
  validation: ReturnType<typeof validateSecurityHeaders>;
  score: number;
}> {
  return fetch(url)
    .then(response => {
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const validation = validateSecurityHeaders(headers);
      
      // Calculate security score (0-100)
      let score = 100;
      if (validation.missing.length > 0) score -= 30;
      if (validation.recommendations.length > 0) score -= validation.recommendations.length * 10;
      if (score < 0) score = 0;

      return {
        url,
        headers,
        validation,
        score
      };
    });
}

export default securityHeaders;
