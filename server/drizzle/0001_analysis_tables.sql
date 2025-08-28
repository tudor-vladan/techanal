-- Migration for Trading Analysis Feature
-- Creates tables for trading analyses and user prompts

CREATE TABLE IF NOT EXISTS "trading_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text NOT NULL,
	"original_filename" text NOT NULL,
	"file_size" integer NOT NULL,
	"image_width" integer,
	"image_height" integer,
	"user_prompt" text NOT NULL,
	"ai_response" text,
	"recommendation" text,
	"confidence_level" numeric(5,2),
	"stop_loss" numeric(10,4),
	"take_profit" numeric(10,4),
	"technical_indicators" jsonb,
	"analysis_status" text DEFAULT 'pending' NOT NULL,
	"processing_time" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "trading_analyses" ADD CONSTRAINT "trading_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_prompts" ADD CONSTRAINT "user_prompts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "trading_analyses_user_id_idx" ON "trading_analyses" ("user_id");
CREATE INDEX IF NOT EXISTS "trading_analyses_created_at_idx" ON "trading_analyses" ("created_at");
CREATE INDEX IF NOT EXISTS "trading_analyses_status_idx" ON "trading_analyses" ("analysis_status");
CREATE INDEX IF NOT EXISTS "user_prompts_user_id_idx" ON "user_prompts" ("user_id");
CREATE INDEX IF NOT EXISTS "user_prompts_name_idx" ON "user_prompts" ("name");
CREATE INDEX IF NOT EXISTS "user_prompts_is_default_idx" ON "user_prompts" ("is_default");
CREATE INDEX IF NOT EXISTS "user_prompts_is_public_idx" ON "user_prompts" ("is_public");

-- Insert default prompts for trading analysis
INSERT INTO "user_prompts" ("id", "user_id", "name", "content", "description", "is_default", "is_public", "tags") VALUES 
(gen_random_uuid(), 'system', 'Technical Analysis', 
'Analyze this trading screenshot and provide:
1. Technical indicators present (RSI, MACD, Bollinger Bands, etc.)
2. Support and resistance levels
3. Trend analysis (bullish, bearish, sideways)
4. Trading recommendation (Buy/Sell/Hold) with confidence level
5. Suggested stop-loss and take-profit levels
6. Risk assessment and position sizing recommendations

Please be specific about entry points and provide reasoning for your analysis.',
'Comprehensive technical analysis for trading screenshots', 
true, true, '["technical", "analysis", "trading", "default"]'),

(gen_random_uuid(), 'system', 'Quick Sentiment', 
'Look at this trading chart and give me:
- Overall market sentiment (bullish/bearish)
- Key price levels to watch
- Quick Buy/Sell/Hold recommendation
- One sentence explanation of why

Keep it concise and actionable.',
'Quick sentiment analysis for fast trading decisions', 
true, true, '["sentiment", "quick", "trading", "default"]'),

(gen_random_uuid(), 'system', 'Risk Assessment', 
'Focus on risk management for this trading setup:
1. Identify potential risks in this chart
2. Calculate appropriate position size
3. Set stop-loss levels based on technical levels
4. Assess reward-to-risk ratio
5. Provide risk management recommendations

Prioritize capital preservation over profit maximization.',
'Risk-focused analysis for conservative trading', 
true, true, '["risk", "management", "conservative", "default"]');
