export interface TradingAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  originalFilename: string;
  fileSize: number;
  imageWidth?: number;
  imageHeight?: number;
  userPrompt: string;
  aiResponse?: AIAnalysisResponse;
  recommendation?: 'buy' | 'sell' | 'hold' | 'wait';
  confidenceLevel?: number;
  stopLoss?: string;
  takeProfit?: string;
  technicalIndicators?: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    momentum: 'strong' | 'moderate' | 'weak';
    support: string[];
    resistance: string[];
    patterns: string[];
  };
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPrompt {
  id: string;
  userId: string;
  name: string;
  content: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis: {
    recommendation: 'buy' | 'sell' | 'hold' | 'wait';
    confidence: number;
    reasoning: string;
    riskAssessment: string;
    positionSizing: string;
    stopLoss?: string;
    takeProfit?: string;
  };
  technicalIndicators: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    momentum: 'strong' | 'moderate' | 'weak';
    support: string[];
    resistance: string[];
    patterns: string[];
  };
  marketContext: {
    volatility: 'low' | 'medium' | 'high';
    volume: 'low' | 'medium' | 'high';
    marketSentiment: 'positive' | 'negative' | 'neutral';
    newsImpact: 'positive' | 'negative' | 'neutral';
  };
  horizonSignals?: {
    intraday: 'buy' | 'sell' | 'hold' | 'wait';
    swing: 'buy' | 'sell' | 'hold' | 'wait';
    longTerm: 'buy' | 'sell' | 'hold' | 'wait';
  };
  processingTime: number;
  modelVersion: string;
  timestamp: number;
  requestId: string;
}

export interface AnalysisRequest {
  image: File;
  prompt: string;
}

export interface AnalysisResult {
  analysisId: string;
  result: AIAnalysisResponse;
}

export interface UploadProgress {
  stage: 'uploading' | 'processing' | 'analyzing' | 'completed';
  progress: number;
  message: string;
}

export interface PromptTemplate {
  name: string;
  content: string;
  description: string;
  tags: string[];
}

export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    name: 'Analiză Tehnică Completă',
    content: `Analizează acest screenshot de trading și oferă:
1. Indicatori tehnici prezenți (RSI, MACD, Bollinger Bands, etc.)
2. Niveluri de suport și rezistență
3. Analiza trend-ului (bullish, bearish, lateral)
4. Recomandarea de trading (Buy/Sell/Hold) cu nivelul de încredere
5. Nivelurile sugerate de stop-loss și take-profit
6. Evaluarea riscului și recomandări pentru sizing-ul poziției

Te rog să fii specific despre punctele de intrare și să oferi justificări pentru analiza ta.`,
    description: 'Analiză tehnică comprehensivă pentru screenshot-uri de trading',
    tags: ['tehnic', 'analiză', 'trading', 'default']
  },
  {
    name: 'Sentiment Rapid',
    content: `Uită-te la acest chart de trading și dă-mi:
- Sentimentul general al pieței (bullish/bearish)
- Nivelurile cheie de preț de urmărit
- Recomandarea rapidă Buy/Sell/Hold
- O explicație într-o propoziție de ce

Păstrează-o concisă și acționabilă.`,
    description: 'Analiză rapidă de sentiment pentru decizii rapide de trading',
    tags: ['sentiment', 'rapid', 'trading', 'default']
  },
  {
    name: 'Evaluarea Riscului',
    content: `Concentrează-te pe managementul riscului pentru această configurație de trading:
1. Identifică riscurile potențiale în acest chart
2. Calculează dimensiunea potrivită a poziției
3. Setează nivelurile de stop-loss bazate pe nivelurile tehnice
4. Evaluează raportul recompensă-risc
5. Oferă recomandări de management al riscului

Prioritizează păstrarea capitalului față de maximizarea profitului.`,
    description: 'Analiză axată pe risc pentru trading conservator',
    tags: ['risc', 'management', 'conservator', 'default']
  }
];

export interface TechnicalIndicator {
  name: string;
  value: number | string;
  status: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface RiskMetrics {
  riskLevel: 'low' | 'medium' | 'high';
  stopLossDistance: number;
  takeProfitDistance: number;
  riskRewardRatio: number;
  suggestedPositionSize: string;
}

export interface AnalysisHistoryResponse {
  analyses: TradingAnalysis[];
  count: number;
}

export interface UserPromptsResponse {
  prompts: UserPrompt[];
  count: number;
}

export interface ChartPatternDetection {
  hasChart: boolean;
  confidence: number;
  patterns: string[];
  chartType?: string;
  timeframe?: string;
}

// Multi-agent orchestration types
export interface MultiAgentConsensusResult {
  recommendation: 'buy' | 'sell' | 'hold' | 'wait';
  confidence: number; // 0..1
  rationale: string;
}

export type MultiAgentAgentId = 'advancedEngine' | 'enhancedAnalysis' | 'optimizedV2';

export interface NormalizedAgentResult {
  agent: MultiAgentAgentId;
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

export interface MultiAgentOutput {
  success: boolean;
  consensus: MultiAgentConsensusResult;
  mergedTechnicalIndicators: Record<string, any>;
  perAgent: NormalizedAgentResult[];
  requestId: string;
  timestamp: number;
}

// Advanced AI Engine Types
export interface AIAnalysisRequest {
  imagePath: string;
  prompt: string;
  userId: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  metadata?: {
    imageSize: number;
    imageFormat: string;
    chartType?: string;
    timeframe?: string;
  };
}

export interface AIEngineStats {
  processingCount: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageProcessingTime: number;
  queueLength: number;
}

export interface AIEngineConfig {
  modelName: string;
  modelVersion: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  timeout: number;
  retryAttempts: number;
}

export interface AIEngineHealth {
  isHealthy: boolean;
  stats: AIEngineStats;
  config: AIEngineConfig;
  timestamp: string;
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  mimeType: string;
}

// API Error types
export interface APIError {
  error: string;
  details?: string;
  code?: string;
}

// Component Props
export interface ScreenshotUploadProps {
  onImageSelected: (file: File) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (prompt: Omit<UserPrompt, 'id' | 'userId' | 'usageCount' | 'createdAt' | 'updatedAt'>) => void;
  onLoad: (promptId: string | '') => void;
  savedPrompts: UserPrompt[];
  isLoading?: boolean;
  activePromptId?: string | null;
}

export interface AnalysisResultsProps {
  analysis: AIAnalysisResponse;
  isLoading?: boolean;
}

export interface AnalysisHistoryProps {
  analyses: TradingAnalysis[];
  onSelectAnalysis: (analysis: TradingAnalysis) => void;
  isLoading?: boolean;
}

// Form validation types
export interface AnalysisFormData {
  image: File | null;
  prompt: string;
}

export interface PromptFormData {
  name: string;
  content: string;
  description: string;
  isDefault: boolean;
  isPublic: boolean;
  tags: string[];
}

// Utility types
export type RecommendationType = 'buy' | 'sell' | 'hold';
export type RiskLevel = 'low' | 'medium' | 'high';
export type TrendType = 'bullish' | 'bearish' | 'sideways';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
