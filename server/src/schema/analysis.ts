import { pgTable, text, timestamp, integer, boolean, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const tradingAnalyses = pgTable('trading_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  originalFilename: text('original_filename').notNull(),
  fileSize: integer('file_size').notNull(),
  imageWidth: integer('image_width'),
  imageHeight: integer('image_height'),
  userPrompt: text('user_prompt').notNull(),
  aiResponse: text('ai_response'),
  recommendation: text('recommendation'), // 'buy', 'sell', 'hold'
  confidenceLevel: decimal('confidence_level', { precision: 5, scale: 2 }), // 0.00 to 100.00
  stopLoss: decimal('stop_loss', { precision: 10, scale: 4 }),
  takeProfit: decimal('take_profit', { precision: 10, scale: 4 }),
  technicalIndicators: jsonb('technical_indicators'), // JSON object with various indicators
  analysisStatus: text('analysis_status').notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  processingTime: integer('processing_time'), // in milliseconds
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('trading_analyses_user_id_idx').on(table.userId),
  createdAtIdx: index('trading_analyses_created_at_idx').on(table.createdAt),
  // Composite index to speed up user history queries ordered by date
  userIdCreatedAtIdx: index('trading_analyses_user_id_created_at_idx').on(table.userId, table.createdAt),
  statusIdx: index('trading_analyses_status_idx').on(table.analysisStatus),
}));

export const userPrompts = pgTable('user_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  isPublic: boolean('is_public').notNull().default(false),
  usageCount: integer('usage_count').notNull().default(0),
  tags: jsonb('tags'), // Array of tags for categorization
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_prompts_user_id_idx').on(table.userId),
  nameIdx: index('user_prompts_name_idx').on(table.name),
  isDefaultIdx: index('user_prompts_is_default_idx').on(table.isDefault),
  isPublicIdx: index('user_prompts_is_public_idx').on(table.isPublic),
  // Composite index for frequent listing by user and updated time
  userIdUpdatedAtIdx: index('user_prompts_user_id_updated_at_idx').on(table.userId, table.updatedAt),
}));

export const userFeedback = pgTable('user_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').notNull().references(() => tradingAnalyses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  feedbackType: text('feedback_type').notNull(), // 'accuracy', 'usefulness', 'speed', 'general'
  rating: integer('rating').notNull(), // 1-5 scale
  comment: text('comment'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: jsonb('metadata'), // JSON object with additional feedback data
}, (table) => ({
  analysisIdIdx: index('user_feedback_analysis_id_idx').on(table.analysisId),
  userIdIdx: index('user_feedback_user_id_idx').on(table.userId),
  feedbackTypeIdx: index('user_feedback_type_idx').on(table.feedbackType),
  timestampIdx: index('user_feedback_timestamp_idx').on(table.timestamp),
}));

export const userInteractions = pgTable('user_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  action: text('action').notNull(), // 'page_view', 'chart_upload', 'analysis_request', etc.
  page: text('page'),
  component: text('component'),
  metadata: jsonb('metadata'), // JSON object with additional interaction data
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  duration: integer('duration'), // Time spent in milliseconds
}, (table) => ({
  userIdIdx: index('user_interactions_user_id_idx').on(table.userId),
  sessionIdIdx: index('user_interactions_session_id_idx').on(table.sessionId),
  actionIdx: index('user_interactions_action_idx').on(table.action),
  timestampIdx: index('user_interactions_timestamp_idx').on(table.timestamp),
}));

// Backtesting results (minimal viable schema for persistence and listing)
export const backtestResults = pgTable('backtest_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalSignals: integer('total_signals').notNull().default(0),
  winningSignals: integer('winning_signals').notNull().default(0),
  losingSignals: integer('losing_signals').notNull().default(0),
  winRate: decimal('win_rate', { precision: 8, scale: 4 }).notNull().default('0'),
  totalReturn: decimal('total_return', { precision: 18, scale: 6 }).notNull().default('0'),
  maxDrawdown: decimal('max_drawdown', { precision: 18, scale: 6 }).notNull().default('0'),
  sharpeRatio: decimal('sharpe_ratio', { precision: 18, scale: 6 }).notNull().default('0'),
  profitFactor: decimal('profit_factor', { precision: 18, scale: 6 }).notNull().default('0'),
  averageWin: decimal('average_win', { precision: 18, scale: 6 }).notNull().default('0'),
  averageLoss: decimal('average_loss', { precision: 18, scale: 6 }).notNull().default('0'),
  riskRewardRatio: decimal('risk_reward_ratio', { precision: 18, scale: 6 }).notNull().default('0'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('backtest_results_user_id_idx').on(table.userId),
  datesIdx: index('backtest_results_dates_idx').on(table.startDate, table.endDate),
  createdAtIdx: index('backtest_results_created_at_idx').on(table.createdAt),
}));

export type TradingAnalysis = typeof tradingAnalyses.$inferSelect;
export type NewTradingAnalysis = typeof tradingAnalyses.$inferInsert;
export type UserPrompt = typeof userPrompts.$inferSelect;
export type NewUserPrompt = typeof userPrompts.$inferInsert;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type NewUserFeedback = typeof userFeedback.$inferInsert;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type NewUserInteraction = typeof userInteractions.$inferInsert;
export type BacktestResultRow = typeof backtestResults.$inferSelect;
export type NewBacktestResultRow = typeof backtestResults.$inferInsert;
