import { getEnv } from './env';

// Note: We avoid importing heavy AI SDKs at module load time so that
// running with AI_PROVIDER=mock doesn't require those packages to be installed.

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'mock';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeout?: number;
  maxTokens?: number;
}

export interface AIAnalysisRequest {
  imageBase64: string;
  prompt: string;
  userId: string;
  metadata?: {
    chartType?: string;
    timeframe?: string;
    imageSize?: number;
    imageFormat?: string;
    enableAdvancedPatterns?: boolean;
  };
}

export interface AIAnalysisResponse {
  recommendation: 'buy' | 'sell' | 'hold';
  confidenceLevel: number;
  stopLoss?: number;
  takeProfit?: number;
  technicalIndicators: Record<string, any>;
  analysis: string;
  reasoning: string;
  riskAssessment: string;
  positionSizing?: string;
  marketContext?: string;
  patternAnalysis?: string;
}

export interface AIServiceError {
  code: string;
  message: string;
  details?: any;
}

export abstract class BaseAIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  abstract analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
  abstract healthCheck(): Promise<boolean>;
  abstract getCapabilities(): string[];

  protected validateConfig(): void {
    if (this.config.provider === 'openai' && !this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    if (this.config.provider === 'anthropic' && !this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
    if (this.config.provider === 'ollama' && !this.config.baseUrl) {
      throw new Error('Ollama base URL is required');
    }
  }

  protected async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

export class OpenAIService extends BaseAIService {
  // Lazily instantiated to avoid requiring the dependency unless used
  private openai?: any;

  constructor(config: AIServiceConfig) {
    super(config);
    this.validateConfig();
  }

  private async ensureClient(): Promise<void> {
    if (!this.openai) {
      try {
        const mod = await import('openai');
        const OpenAI = (mod as any).default ?? mod;
        this.openai = new OpenAI({
          apiKey: this.config.apiKey,
          timeout: this.config.timeout || 30000,
        });
      } catch (err) {
        throw new Error('Package "openai" nu este instalat. Rulează pnpm add openai în folderul server sau setează AI_PROVIDER=mock.');
      }
    }
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    await this.ensureClient();
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request.prompt, request.metadata);

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4-vision-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${request.imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: this.config.maxTokens || 1000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseOpenAIResponse(content);
    } catch (error) {
      throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    await this.ensureClient();
    try {
      await this.openai.models.list();
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): string[] {
    return ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'];
  }

  private buildSystemPrompt(): string {
    return `You are an expert trading analyst specializing in technical analysis of financial charts. 

Your task is to analyze trading screenshots and provide comprehensive trading recommendations.

IMPORTANT: Always respond in the following JSON format:
{
  "recommendation": "buy|sell|hold",
  "confidenceLevel": 0.0-1.0,
  "stopLoss": number or null,
  "takeProfit": number or null,
  "technicalIndicators": {
    "rsi": number,
    "macd": { "macd": number, "signal": number, "histogram": number },
    "bollingerBands": { "upper": number, "middle": number, "lower": number },
    "movingAverages": { "sma20": number, "sma50": number, "ema12": number }
  },
  "analysis": "Detailed analysis of the chart",
  "reasoning": "Explanation of the recommendation",
  "riskAssessment": "Risk evaluation and management",
  "positionSizing": "Position sizing recommendations",
  "marketContext": "Market context and conditions",
  "patternAnalysis": "Identified chart patterns"
}

Focus on:
- Technical indicators and their interpretation
- Chart patterns and trend analysis
- Support/resistance levels
- Risk-reward ratios
- Market timing and entry/exit points

Be precise, analytical, and provide actionable insights.`;
  }

  private buildUserPrompt(userPrompt: string, metadata?: any): string {
    let prompt = `Please analyze this trading chart according to the following criteria:\n\n${userPrompt}\n\n`;
    
    if (metadata) {
      if (metadata.chartType) prompt += `Chart Type: ${metadata.chartType}\n`;
      if (metadata.timeframe) prompt += `Timeframe: ${metadata.timeframe}\n`;
      if (metadata.enableAdvancedPatterns) prompt += `\nPlease include advanced pattern recognition and harmonic patterns if visible.\n`;
    }
    
    prompt += `\nProvide a comprehensive analysis including technical indicators, patterns, and trading recommendations.`;
    
    return prompt;
  }

  private parseOpenAIResponse(content: string): AIAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and return the response
      return {
        recommendation: parsed.recommendation || 'hold',
        confidenceLevel: Math.max(0, Math.min(1, parsed.confidenceLevel || 0.5)),
        stopLoss: parsed.stopLoss || undefined,
        takeProfit: parsed.takeProfit || undefined,
        technicalIndicators: parsed.technicalIndicators || {},
        analysis: parsed.analysis || content,
        reasoning: parsed.reasoning || 'AI analysis provided',
        riskAssessment: parsed.riskAssessment || 'Standard risk assessment',
        positionSizing: parsed.positionSizing || 'Standard position sizing',
        marketContext: parsed.marketContext || 'Market context not specified',
        patternAnalysis: parsed.patternAnalysis || 'Pattern analysis not provided'
      };
    } catch (error) {
      // Fallback parsing if JSON parsing fails
      return this.fallbackParsing(content);
    }
  }

  private fallbackParsing(content: string): AIAnalysisResponse {
    // Simple keyword-based parsing as fallback
    const lowerContent = content.toLowerCase();
    
    let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
    if (lowerContent.includes('buy') || lowerContent.includes('long') || lowerContent.includes('bullish')) {
      recommendation = 'buy';
    } else if (lowerContent.includes('sell') || lowerContent.includes('short') || lowerContent.includes('bearish')) {
      recommendation = 'sell';
    }

    const confidenceLevel = lowerContent.includes('high') ? 0.8 : 
                           lowerContent.includes('medium') ? 0.6 : 0.4;

    return {
      recommendation,
      confidenceLevel,
      technicalIndicators: {},
      analysis: content,
      reasoning: 'AI analysis provided (fallback parsing)',
      riskAssessment: 'Standard risk assessment',
      positionSizing: 'Standard position sizing'
    };
  }
}

export class AnthropicService extends BaseAIService {
  private anthropic?: any;

  constructor(config: AIServiceConfig) {
    super(config);
    this.validateConfig();
  }

  private async ensureClient(): Promise<void> {
    if (!this.anthropic) {
      try {
        const mod = await import('@anthropic-ai/sdk');
        const Anthropic = (mod as any).default ?? mod;
        this.anthropic = new Anthropic({
          apiKey: this.config.apiKey,
          timeout: this.config.timeout || 30000,
        });
      } catch (err) {
        throw new Error('Pachetul "@anthropic-ai/sdk" nu este instalat. Rulează pnpm add @anthropic-ai/sdk în folderul server sau setează AI_PROVIDER=mock.');
      }
    }
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    await this.ensureClient();
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request.prompt, request.metadata);

      const response = await this.anthropic.messages.create({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens || 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: request.imageBase64,
                },
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }

      return this.parseAnthropicResponse(content.text);
    } catch (error) {
      throw new Error(`Anthropic analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    await this.ensureClient();
    try {
      // Anthropic doesn't have a simple health check endpoint, so we'll test with a minimal request
      await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): string[] {
    return ['vision-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment', 'advanced-chart-analysis'];
  }

  private buildSystemPrompt(): string {
    return `You are an expert trading analyst specializing in technical analysis of financial charts. 

Your task is to analyze trading screenshots and provide comprehensive trading recommendations.

IMPORTANT: Always respond in the following JSON format:
{
  "recommendation": "buy|sell|hold",
  "confidenceLevel": 0.0-1.0,
  "stopLoss": number or null,
  "takeProfit": number or null,
  "technicalIndicators": {
    "rsi": number,
    "macd": { "macd": number, "signal": number, "histogram": number },
    "bollingerBands": { "upper": number, "middle": number, "lower": number },
    "movingAverages": { "sma20": number, "sma50": number, "ema12": number }
  },
  "analysis": "Detailed analysis of the chart",
  "reasoning": "Explanation of the recommendation",
  "riskAssessment": "Risk evaluation and management",
  "positionSizing": "Position sizing recommendations",
  "marketContext": "Market context and conditions",
  "patternAnalysis": "Identified chart patterns"
}

Focus on:
- Technical indicators and their interpretation
- Chart patterns and trend analysis
- Support/resistance levels
- Risk-reward ratios
- Market timing and entry/exit points

Be precise, analytical, and provide actionable insights.`;
  }

  private buildUserPrompt(userPrompt: string, metadata?: any): string {
    let prompt = `Please analyze this trading chart according to the following criteria:\n\n${userPrompt}\n\n`;
    
    if (metadata) {
      if (metadata.chartType) prompt += `Chart Type: ${metadata.chartType}\n`;
      if (metadata.timeframe) prompt += `Timeframe: ${metadata.timeframe}\n`;
      if (metadata.enableAdvancedPatterns) prompt += `\nPlease include advanced pattern recognition and harmonic patterns if visible.\n`;
    }
    
    prompt += `\nProvide a comprehensive analysis including technical indicators, patterns, and trading recommendations.`;
    
    return prompt;
  }

  private parseAnthropicResponse(content: string): AIAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and return the response
      return {
        recommendation: parsed.recommendation || 'hold',
        confidenceLevel: Math.max(0, Math.min(1, parsed.confidenceLevel || 0.5)),
        stopLoss: parsed.stopLoss || undefined,
        takeProfit: parsed.takeProfit || undefined,
        technicalIndicators: parsed.technicalIndicators || {},
        analysis: parsed.analysis || content,
        reasoning: parsed.reasoning || 'AI analysis provided',
        riskAssessment: parsed.riskAssessment || 'Standard risk assessment',
        positionSizing: parsed.positionSizing || 'Standard position sizing',
        marketContext: parsed.marketContext || 'Market context not specified',
        patternAnalysis: parsed.patternAnalysis || 'Pattern analysis not provided'
      };
    } catch (error) {
      // Fallback parsing if JSON parsing fails
      return this.fallbackParsing(content);
    }
  }

  private fallbackParsing(content: string): AIAnalysisResponse {
    // Simple keyword-based parsing as fallback
    const lowerContent = content.toLowerCase();
    
    let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
    if (lowerContent.includes('buy') || lowerContent.includes('long') || lowerContent.includes('bullish')) {
      recommendation = 'buy';
    } else if (lowerContent.includes('sell') || lowerContent.includes('short') || lowerContent.includes('bearish')) {
      recommendation = 'sell';
    }

    const confidenceLevel = lowerContent.includes('high') ? 0.8 : 
                           lowerContent.includes('medium') ? 0.6 : 0.4;

    return {
      recommendation,
      confidenceLevel,
      technicalIndicators: {},
      analysis: content,
      reasoning: 'AI analysis provided (fallback parsing)',
      riskAssessment: 'Standard risk assessment',
      positionSizing: 'Standard position sizing'
    };
  }
}

export class OllamaService extends BaseAIService {
  constructor(config: AIServiceConfig) {
    super(config);
    this.validateConfig();
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request.prompt, request.metadata);

      const response = await this.makeRequest(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'llama3.1:8b',
          prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: this.config.maxTokens || 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const result = await response.json() as any;
      return this.parseOllamaResponse(result.response);
    } catch (error) {
      throw new Error(`Ollama analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getCapabilities(): string[] {
    return ['text-analysis', 'technical-analysis', 'pattern-recognition', 'risk-assessment'];
  }

  private buildSystemPrompt(): string {
    return `You are an expert trading analyst. Analyze the trading chart and provide recommendations in JSON format:

{
  "recommendation": "buy|sell|hold",
  "confidenceLevel": 0.0-1.0,
  "analysis": "Detailed analysis",
  "reasoning": "Explanation",
  "riskAssessment": "Risk evaluation"
}`;
  }

  private buildUserPrompt(userPrompt: string, metadata?: any): string {
    let prompt = `Analyze this trading chart: ${userPrompt}`;
    if (metadata?.chartType) prompt += `\nChart Type: ${metadata.chartType}`;
    if (metadata?.timeframe) prompt += `\nTimeframe: ${metadata.timeframe}`;
    return prompt;
  }

  private parseOllamaResponse(content: string): AIAnalysisResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendation: parsed.recommendation || 'hold',
          confidenceLevel: Math.max(0, Math.min(1, parsed.confidenceLevel || 0.5)),
          technicalIndicators: parsed.technicalIndicators || {},
          analysis: parsed.analysis || content,
          reasoning: parsed.reasoning || 'AI analysis provided',
          riskAssessment: parsed.riskAssessment || 'Standard risk assessment',
          positionSizing: parsed.positionSizing || 'Standard position sizing'
        };
      }
    } catch (error) {
      // Fallback parsing
    }

    return this.fallbackParsing(content);
  }

  private fallbackParsing(content: string): AIAnalysisResponse {
    const lowerContent = content.toLowerCase();
    
    let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
    if (lowerContent.includes('buy') || lowerContent.includes('bullish')) {
      recommendation = 'buy';
    } else if (lowerContent.includes('sell') || lowerContent.includes('bearish')) {
      recommendation = 'sell';
    }

    return {
      recommendation,
      confidenceLevel: 0.5,
      technicalIndicators: {},
      analysis: content,
      reasoning: 'AI analysis provided',
      riskAssessment: 'Standard risk assessment',
      positionSizing: 'Standard position sizing'
    };
  }
}

export class MockAIService extends BaseAIService {
  constructor() {
    super({ provider: 'mock' });
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Generate mock analysis based on the prompt content
    const promptLower = request.prompt.toLowerCase();
    let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
    let confidenceLevel = 0.5;

    if (promptLower.includes('bullish') || promptLower.includes('uptrend') || promptLower.includes('support')) {
      recommendation = 'buy';
      confidenceLevel = 0.7 + Math.random() * 0.2;
    } else if (promptLower.includes('bearish') || promptLower.includes('downtrend') || promptLower.includes('resistance')) {
      recommendation = 'sell';
      confidenceLevel = 0.6 + Math.random() * 0.3;
    }

    const technicalIndicators = {
      rsi: 45 + Math.random() * 20,
      macd: {
        macd: -0.5 + Math.random() * 1,
        signal: -0.3 + Math.random() * 0.8,
        histogram: -0.2 + Math.random() * 0.6
      },
      bollingerBands: {
        upper: 1.05 + Math.random() * 0.1,
        middle: 1.0,
        lower: 0.95 - Math.random() * 0.1
      },
      movingAverages: {
        sma20: 0.98 + Math.random() * 0.04,
        sma50: 1.0 + Math.random() * 0.02,
        ema12: 0.99 + Math.random() * 0.03
      }
    };

    const currentPrice = 100;
    const stopLoss = recommendation === 'buy' ? currentPrice * 0.95 : currentPrice * 1.05;
    const takeProfit = recommendation === 'buy' ? currentPrice * 1.08 : currentPrice * 0.92;

    return {
      recommendation,
      confidenceLevel,
      stopLoss,
      takeProfit,
      technicalIndicators,
      analysis: `Mock analysis: ${recommendation.toUpperCase()} recommendation with ${Math.round(confidenceLevel * 100)}% confidence`,
      reasoning: `Mock reasoning for ${recommendation} recommendation`,
      riskAssessment: `Mock risk assessment for ${recommendation} position`,
      positionSizing: `Mock position sizing based on ${Math.round(confidenceLevel * 100)}% confidence`
    };
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock service is always healthy
  }

  getCapabilities(): string[] {
    return ['mock-analysis', 'development-testing'];
  }
}

export class AIServiceFactory {
  static createService(config: AIServiceConfig): BaseAIService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config);
      case 'anthropic':
        return new AnthropicService(config);
      case 'ollama':
        return new OllamaService(config);
      case 'mock':
        return new MockAIService();
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  static createFromEnvironment(): BaseAIService {
    const provider = getEnv('AI_PROVIDER', 'mock') as 'openai' | 'anthropic' | 'ollama' | 'mock';
    
    const config: AIServiceConfig = {
      provider,
      apiKey: getEnv('AI_API_KEY'),
      model: getEnv('AI_MODEL'),
      baseUrl: getEnv('AI_BASE_URL'),
      timeout: parseInt(getEnv('AI_TIMEOUT', '30000') ?? '30000', 10),
      maxTokens: parseInt(getEnv('AI_MAX_TOKENS', '1000') ?? '1000', 10),
    };

    return this.createService(config);
  }
}

export const aiService = AIServiceFactory.createFromEnvironment();
