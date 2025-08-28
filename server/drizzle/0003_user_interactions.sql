-- Migration for User Interactions Feature
-- Creates table for tracking user interactions and behavior

CREATE TABLE IF NOT EXISTS "user_interactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "session_id" text NOT NULL,
        "action" text NOT NULL,
        "page" text,
        "component" text,
        "metadata" jsonb,
        "timestamp" timestamp DEFAULT now() NOT NULL,
        "duration" integer
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "user_interactions_user_id_idx" ON "user_interactions" ("user_id");
CREATE INDEX IF NOT EXISTS "user_interactions_session_id_idx" ON "user_interactions" ("session_id");
CREATE INDEX IF NOT EXISTS "user_interactions_action_idx" ON "user_interactions" ("action");
CREATE INDEX IF NOT EXISTS "user_interactions_timestamp_idx" ON "user_interactions" ("timestamp");
