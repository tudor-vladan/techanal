import { advancedAIEngine } from './advanced-ai-engine';
import { enhancedAIAnalysis } from './enhanced-ai-analysis';
import { aiAnalysisServiceOptimizedV2 } from './ai-analysis-optimized-v2';

type AgentId = 'advancedEngine' | 'enhancedAnalysis' | 'optimizedV2';

export interface MultiAgentInput {
  imageBase64: string;
  imagePath: string; // relative path like /uploads/xyz.png
  prompt: string;
  userId: string;
  priority?: 'high' | 'normal' | 'low';
  metadata?: {
    chartType?: string;
    timeframe?: string;
    imageSize?: number;
    imageFormat?: string;
  };
}

export interface NormalizedAgentResult {
  agent: AgentId;
  ok: boolean;
  error?: string;
  recommendation?: 'buy' | 'sell' | 'hold' | 'wait';
  confidence?: number; // 0..1
  technicalIndicators?: Record<string, any>;
  analysisText?: string;
  riskAssessment?: string;
  positionSizing?: string;
  extra?: Record<string, any>;
}

export interface MultiAgentConsensusResult {
  recommendation: 'buy' | 'sell' | 'hold' | 'wait';
  confidence: number; // 0..1
  rationale: string;
}

export interface MultiAgentOutput {
  success: boolean;
  consensus: MultiAgentConsensusResult;
  mergedTechnicalIndicators: Record<string, any>;
  perAgent: NormalizedAgentResult[];
  requestId: string;
  timestamp: number;
}

class MultiAgentOrchestrator {
  async analyze(input: MultiAgentInput): Promise<MultiAgentOutput> {
    const timestamp = Date.now();
    const requestId = `multi_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    const tasks: Array<Promise<NormalizedAgentResult>> = [
      this.runAdvancedEngine(input).catch((err) => this.err('advancedEngine', err)),
      this.runEnhanced(input).catch((err) => this.err('enhancedAnalysis', err)),
      this.runOptimizedV2(input).catch((err) => this.err('optimizedV2', err)),
    ];

    const perAgent = await Promise.all(tasks);

    const consensus = this.buildConsensus(perAgent);
    const mergedTechnicalIndicators = this.mergeIndicators(perAgent);

    return {
      success: true,
      consensus,
      mergedTechnicalIndicators,
      perAgent,
      requestId,
      timestamp,
    };
  }

  private async runAdvancedEngine(input: MultiAgentInput): Promise<NormalizedAgentResult> {
    const res = await advancedAIEngine.analyzeScreenshot({
      imagePath: input.imagePath,
      prompt: input.prompt,
      userId: input.userId,
      priority: input.priority || 'normal',
      timestamp: Date.now(),
      metadata: {
        imageSize: input.metadata?.imageSize || input.imageBase64.length,
        imageFormat: input.metadata?.imageFormat || 'jpeg',
        chartType: input.metadata?.chartType,
        timeframe: input.metadata?.timeframe,
      },
    } as any);

    return {
      agent: 'advancedEngine',
      ok: true,
      recommendation: res.analysis.recommendation,
      confidence: Math.max(0, Math.min(1, (res.analysis.confidence || 0) / 100)),
      technicalIndicators: res.technicalIndicators as any,
      analysisText: res.analysis.reasoning,
      riskAssessment: res.analysis.riskAssessment,
      positionSizing: res.analysis.positionSizing,
      extra: {
        horizonSignals: res.horizonSignals,
        modelVersion: res.modelVersion,
      },
    };
  }

  private async runEnhanced(input: MultiAgentInput): Promise<NormalizedAgentResult> {
    const res = await enhancedAIAnalysis.analyzeChart({
      imageBase64: input.imageBase64,
      prompt: input.prompt,
      userId: input.userId,
      enableAdvancedPatterns: true,
      enableTechnicalIndicators: true,
      metadata: {
        chartType: input.metadata?.chartType || 'candlestick',
        timeframe: input.metadata?.timeframe || '1h',
        imageSize: input.metadata?.imageSize || input.imageBase64.length,
        imageFormat: input.metadata?.imageFormat || 'jpeg',
      },
    } as any);

    return {
      agent: 'enhancedAnalysis',
      ok: true,
      recommendation: res.recommendation,
      confidence: res.confidenceLevel,
      technicalIndicators: res.technicalIndicators,
      analysisText: res.analysis,
      riskAssessment: res.riskAssessment,
      positionSizing: res.positionSizing,
      extra: {
        patternAnalysis: res.patternAnalysis,
        advancedPatterns: (res as any).advancedPatterns,
        technicalAnalysis: (res as any).technicalAnalysis,
      },
    };
  }

  private async runOptimizedV2(input: MultiAgentInput): Promise<NormalizedAgentResult> {
    const res = await aiAnalysisServiceOptimizedV2.analyzeScreenshot({
      imagePath: input.imagePath,
      userPrompt: input.prompt,
      userId: input.userId,
      priority: input.priority || 'normal',
    } as any);

    return {
      agent: 'optimizedV2',
      ok: true,
      recommendation: res.recommendation,
      confidence: res.confidenceLevel,
      technicalIndicators: res.technicalIndicators,
      analysisText: res.analysis,
      riskAssessment: res.riskAssessment,
      positionSizing: res.positionSizing,
      extra: {
        processingTime: res.processingTime,
        cached: res.cached,
        priority: res.priority,
      },
    };
  }

  private err(agent: AgentId, error: unknown): NormalizedAgentResult {
    return {
      agent,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  private buildConsensus(results: NormalizedAgentResult[]): MultiAgentConsensusResult {
    const valid = results.filter(r => r.ok && r.recommendation && typeof r.confidence === 'number') as Array<Required<Pick<NormalizedAgentResult, 'recommendation' | 'confidence'>> & NormalizedAgentResult>;
    if (valid.length === 0) {
      return {
        recommendation: 'wait',
        confidence: 0,
        rationale: 'No valid agent responses available',
      };
    }

    const counts: Record<string, { count: number; weighted: number }> = {};
    for (const r of valid) {
      const key = r.recommendation!;
      if (!counts[key]) counts[key] = { count: 0, weighted: 0 };
      counts[key].count += 1;
      counts[key].weighted += r.confidence!;
    }

    const sorted = Object.entries(counts).sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return b[1].weighted - a[1].weighted;
    });

    const top = sorted[0];
    const recommendation = (top[0] as any) as 'buy' | 'sell' | 'hold' | 'wait';
    const confidence = Math.max(0, Math.min(1, top[1].weighted / top[1].count));

    const rationale = `Consensus by ${top[1].count}/${valid.length} agents with average confidence ${(confidence * 100).toFixed(0)}%`;

    return { recommendation, confidence, rationale };
  }

  private mergeIndicators(results: NormalizedAgentResult[]): Record<string, any> {
    const merged: Record<string, any> = {};
    for (const r of results) {
      if (!r.ok || !r.technicalIndicators) continue;
      for (const [key, value] of Object.entries(r.technicalIndicators)) {
        if (!(key in merged)) merged[key] = [];
        merged[key].push({ agent: r.agent, value });
      }
    }
    return merged;
  }
}

export const multiAgentOrchestrator = new MultiAgentOrchestrator();


