CREATE TABLE IF NOT EXISTS linkedin_hook_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  email TEXT NOT NULL,
  hook TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  failed_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewrite_1 TEXT NOT NULL,
  rewrite_2 TEXT NOT NULL,
  rewrite_3 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_hook_sessions_created_at
  ON linkedin_hook_sessions (created_at DESC);
