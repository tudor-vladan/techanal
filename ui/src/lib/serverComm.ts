import { 
  TradingAnalysis, 
  UserPrompt, 
  AIAnalysisResponse, 
  AnalysisRequest, 
  AnalysisResult,
  AnalysisHistoryResponse,
  UserPromptsResponse,
  AIEngineHealth
} from '../types/analysis';
import debugLogger from './debugLogger';

interface APIErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// Resolve API base URL robustly across local dev (Docker and bare node) and prod builds
function computeDefaultApiUrls() {
  // Prefer explicit env if provided
  // Prefer a single canonical env var, but also support legacy VITE_API_BASE_URL
  const envUrl = ((import.meta as any)?.env?.VITE_API_URL || (import.meta as any)?.env?.VITE_API_BASE_URL) as string | undefined;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return { primary: envUrl.trim(), fallback: 'http://localhost:5500' };
  }

  // Derive sensible defaults when running locally
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) {
      const currentPort = parseInt(port || '0', 10);
      // Common mappings:
      // - Docker dev: UI 5501 -> API 5500
      // - Vite local: UI 5173 -> API injected, fallback to 5500 then 8787
      const candidates = [5500, currentPort > 0 ? currentPort - 1 : undefined, 8787]
        .filter((p): p is number => typeof p === 'number' && p > 0);
      const primary = `${protocol}//${hostname}:${candidates[0]}`;
      const fallback = `${protocol}//${hostname}:${candidates[1] ?? 8787}`;
      return { primary, fallback };
    }
    // Same-origin for non-localhost (behind reverse proxy)
    const origin = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    return { primary: origin, fallback: origin };
  }

  // Node contexts without window (SSR/tests): prefer Docker mapping
  return { primary: 'http://localhost:5500', fallback: 'http://localhost:8787' };
}

const DEFAULTS = computeDefaultApiUrls();
const API_BASE_URL = DEFAULTS.primary;
const DEV_FALLBACK_API_URL = (import.meta as any).env?.DEV ? DEFAULTS.fallback : undefined;

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Local authentication check
async function getLocalAuthToken(): Promise<string | null> {
  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }
  try {
    const userData = JSON.parse(user);
    // In development mode, use email as token
    return userData.email;
  } catch {
    return null;
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getLocalAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const doFetch = async (baseUrl: string) =>
    fetch(`${baseUrl}${endpoint}`, { ...options, headers });

  // Basic retry/backoff on transient errors (network/5xx)
  const maxAttempts = 3;
  const baseDelayMs = 200;
  const attemptFetch = async (baseUrl: string): Promise<Response> => {
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const start = performance.now?.() ?? Date.now();
        const res = await doFetch(baseUrl);
        const durationMs = (performance.now?.() ?? Date.now()) - start;
        // Avoid logging our own ingest calls to prevent loops
        if (!endpoint.includes('/logs/ingest')) {
          debugLogger.info('API response', {
            endpoint,
            url: `${baseUrl}${endpoint}`,
            status: res.status,
            ok: res.ok,
            durationMs,
            method: (options.method || 'GET').toString().toUpperCase(),
          }, 'api');
        }
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          return res; // do not retry client errors
        }
        lastError = new APIError(res.status, res.statusText);
      } catch (err) {
        if (!endpoint.includes('/logs/ingest')) {
          debugLogger.error('API network error', {
            endpoint,
            url: `${baseUrl}${endpoint}`,
            error: (err as any)?.message || String(err),
            method: (options.method || 'GET').toString().toUpperCase(),
          }, 'api');
        }
        lastError = err;
      }
      // exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
    throw lastError ?? new Error('API request failed');
  };

  let response: Response | null = null;
  let firstError: any = null;
  try {
    response = await attemptFetch(API_BASE_URL);
  } catch (err) {
    firstError = err;
  }

  // Fallback in dev: if unauthorized or network error and fallback base differs
  const shouldTryFallback = (res: Response | null) =>
    (import.meta as any).env?.DEV &&
    DEV_FALLBACK_API_URL &&
    DEV_FALLBACK_API_URL !== API_BASE_URL &&
    (!res || res.status >= 400);

  if (!response || !response.ok) {
    if (shouldTryFallback(response)) {
      try {
        const fallbackResponse = await attemptFetch(DEV_FALLBACK_API_URL!);
        if (fallbackResponse.ok) return fallbackResponse;
        // If fallback also fails, propagate the first failing response below
        response = fallbackResponse;
      } catch (e) {
        // keep original error if exists
        if (!firstError) firstError = e;
      }
    }
  }

  if (!response || !response.ok) {
    if (response) {
      throw new APIError(response.status, `API request failed: ${response.statusText}`);
    }
    throw firstError ?? new Error('API request failed');
  }

  return response;
}

// Export fetchWithAuth for use in other modules
export { fetchWithAuth };
export { API_BASE_URL, getLocalAuthToken };

// API endpoints
export async function getCurrentUser() {
  const user = localStorage.getItem('user');
  if (!user) {
    throw new Error('User not authenticated');
  }
  try {
    const userData = JSON.parse(user);
    return { email: userData.email, authenticated: true };
  } catch {
    throw new Error('User not authenticated');
  }
}

// Example of how to add more API endpoints:
// export async function createChat(data: CreateChatData) {
//   const response = await fetchWithAuth('/api/v1/protected/chats', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });
//   return response.json();
// }

export const api = {
  getCurrentUser,
  // Add other API endpoints here
  
  // System monitoring endpoints
  async get(endpoint: string): Promise<Response> {
    return fetchWithAuth(endpoint);
  },
  
  async post(endpoint: string, data?: any): Promise<Response> {
    return fetchWithAuth(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  async put(endpoint: string, data?: any): Promise<Response> {
    return fetchWithAuth(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  async delete(endpoint: string): Promise<Response> {
    return fetchWithAuth(endpoint, {
      method: 'DELETE',
    });
  }
}; 

// Trading Analysis API functions
export async function analyzeScreenshot(request: AnalysisRequest): Promise<AnalysisResult> {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Build multipart/form-data request
    const form = new FormData();
    form.append('image', request.image);
    form.append('prompt', request.prompt);

    const response = await fetchWithAuth('/api/v1/protected/analyze-screenshot', {
      method: 'POST',
      body: form,
    });

    const data = await response.json();
    if (!data || !data.success) {
      const message = (data && (data.details || data.error)) || 'Analysis failed';
      throw new Error(message);
    }

    const srv = data.analysis;
    const aiResult: AIAnalysisResponse = {
      success: true,
      analysis: srv.analysis ?? {
        recommendation: srv.recommendation ?? 'hold',
        confidence: srv.confidenceLevel ?? 0,
        reasoning: srv.analysis?.reasoning ?? '',
        riskAssessment: srv.riskAssessment ?? srv.analysis?.riskAssessment ?? '',
        positionSizing: srv.positionSizing ?? srv.analysis?.positionSizing ?? '',
        stopLoss: srv.stopLoss?.toString?.(),
        takeProfit: srv.takeProfit?.toString?.(),
      },
      technicalIndicators: srv.technicalIndicators ?? {
        trend: 'neutral',
        strength: 0,
        momentum: 'moderate',
        support: [],
        resistance: [],
        patterns: [],
      },
      marketContext: srv.marketContext ?? {
        volatility: 'medium',
        volume: 'medium',
        marketSentiment: 'neutral',
        newsImpact: 'neutral',
      },
      processingTime: srv.processingTime ?? 0,
      modelVersion: srv.modelVersion ?? 'unknown',
      timestamp: Date.now(),
      requestId: srv.requestId ?? '',
    };

    return {
      analysisId: srv.id ?? `${Date.now()}`,
      result: aiResult,
    };

  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

export async function saveUserPrompt(prompt: Omit<UserPrompt, 'id' | 'userId' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<UserPrompt> {
  try {
    const response = await fetchWithAuth('/api/v1/protected/save-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });

    const data = await response.json();
    return data.prompt;
  } catch (error) {
    console.error('Save prompt error:', error);
    throw error;
  }
}

export async function getUserPrompts(): Promise<UserPromptsResponse> {
  try {
    const response = await fetchWithAuth('/api/v1/protected/user-prompts');
    const data = await response.json();
    if (!data || data.error) {
      throw new Error(data?.details || data?.error || 'Failed to get user prompts');
    }
    return {
      prompts: (data.prompts as UserPrompt[]) ?? [],
      count: data.count ?? ((data.prompts as UserPrompt[])?.length ?? 0),
    };

  } catch (error) {
    console.error('Failed to get user prompts:', error);
    throw error;
  }
}

export async function getAnalysisHistory(): Promise<AnalysisHistoryResponse> {
  try {
    const response = await fetchWithAuth('/api/v1/protected/analysis-history');
    const data = await response.json();
    if (!data || data.error) {
      throw new Error(data?.details || data?.error || 'Failed to get analysis history');
    }

    const analyses = (data.analyses as TradingAnalysis[]).map((item: any) => {
      let aiResponse = item.aiResponse;
      if (typeof aiResponse === 'string') {
        try {
          aiResponse = JSON.parse(aiResponse);
        } catch {
          aiResponse = undefined;
        }
      }
      const normalizedImageUrl = typeof item.imageUrl === 'string' && item.imageUrl.startsWith('/uploads')
        ? `${API_BASE_URL}/api/v1${item.imageUrl}`
        : item.imageUrl;
      return {
        ...item,
        imageUrl: normalizedImageUrl,
        aiResponse,
      } as TradingAnalysis;
    });

    return {
      analyses,
      count: data.count ?? analyses.length,
    };

  } catch (error) {
    console.error('Failed to get analysis history:', error);
    throw error;
  }
}

export async function getAnalysisById(analysisId: string): Promise<TradingAnalysis> {
  try {
    const response = await fetchWithAuth(`/api/v1/protected/analysis/${analysisId}`);
    const data = await response.json();
    if (!data || data.error) {
      const errorData: APIErrorResponse = data;
      throw new Error(errorData.details || errorData.error || 'Failed to get analysis');
    }
    const item = data.analysis as TradingAnalysis;
    let aiResponse = (item as any).aiResponse;
    if (typeof aiResponse === 'string') {
      try { aiResponse = JSON.parse(aiResponse); } catch { aiResponse = undefined; }
    }
    const normalizedImageUrl = typeof item.imageUrl === 'string' && item.imageUrl.startsWith('/uploads')
      ? `${API_BASE_URL}/api/v1${item.imageUrl}`
      : item.imageUrl;
    return { ...item, imageUrl: normalizedImageUrl, aiResponse };
  } catch (error) {
    console.error('Get analysis error:', error);
    throw error;
  }
}

export async function deleteAnalysis(analysisId: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`/api/v1/protected/analysis/${analysisId}`, { method: 'DELETE' });
    const data = await response.json();
    if (!data || data.error) {
      const errorData: APIErrorResponse = data;
      throw new Error(errorData.details || errorData.error || 'Failed to delete analysis');
    }
  } catch (error) {
    console.error('Delete analysis error:', error);
    throw error;
  }
}

// Advanced AI Engine API functions
export async function getAIEngineStats(): Promise<AIEngineHealth> {
  try {
    const response = await fetchWithAuth('/api/v1/protected/ai-engine-stats');
    const data = await response.json();
    
    if (data.success) {
      return {
        isHealthy: data.health,
        stats: data.stats,
        config: data.config,
        timestamp: data.timestamp
      };
    } else {
      throw new Error('Failed to get AI Engine stats');
    }
  } catch (error) {
    console.error('Get AI Engine stats error:', error);
    // Return mock data for now
    return {
      isHealthy: true,
      stats: {
        processingCount: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 100,
        averageProcessingTime: 0,
        queueLength: 0
      },
      config: {
        modelName: 'llama-3.1-8b',
        modelVersion: '1.0.0',
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        timeout: 30000,
        retryAttempts: 3
      },
      timestamp: new Date().toISOString()
    };
  }
}
