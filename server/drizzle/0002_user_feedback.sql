-- Migration for User Feedback Feature
-- Creates table for user feedback on trading analyses

CREATE TABLE IF NOT EXISTS "user_feedback" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "analysis_id" uuid NOT NULL,
        "user_id" text NOT NULL,
        "feedback_type" text NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "timestamp" timestamp DEFAULT now() NOT NULL,
        "metadata" jsonb
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_analysis_id_trading_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "trading_analyses"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "user_feedback_analysis_id_idx" ON "user_feedback" ("analysis_id");
CREATE INDEX IF NOT EXISTS "user_feedback_user_id_idx" ON "user_feedback" ("user_id");
CREATE INDEX IF NOT EXISTS "user_feedback_type_idx" ON "user_feedback" ("feedback_type");
CREATE INDEX IF NOT EXISTS "user_feedback_timestamp_idx" ON "user_feedback" ("timestamp");
