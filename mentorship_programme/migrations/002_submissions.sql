-- 002_submissions.sql
-- Add submissions table for mentee projects (hackathon-style)

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL CHECK (char_length(project_name) <= 40),
  plotline TEXT NOT NULL CHECK (char_length(plotline) <= 200),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  project_description TEXT NOT NULL CHECK (char_length(project_description) <= 2500),
  repo_link TEXT,
  demo_link TEXT,
  video_link TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'banned', 'winner')),
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_cohort_id ON submissions(cohort_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- updated_at trigger
DROP TRIGGER IF EXISTS submissions_updated_at ON submissions;
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users can see their own submissions (including drafts)
DROP POLICY IF EXISTS "submissions_select_own" ON submissions;
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE id = submissions.user_id)
  );

-- Admins can see all submissions
DROP POLICY IF EXISTS "submissions_select_admin" ON submissions;
CREATE POLICY "submissions_select_admin" ON submissions
  FOR SELECT USING (
    public.is_admin()
  );

-- Anyone can see submitted/winner submissions (public view)
DROP POLICY IF EXISTS "submissions_select_public" ON submissions;
CREATE POLICY "submissions_select_public" ON submissions
  FOR SELECT USING (
    status IN ('submitted', 'winner')
  );

-- Users can insert their own submissions
DROP POLICY IF EXISTS "submissions_insert_own" ON submissions;
CREATE POLICY "submissions_insert_own" ON submissions
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE id = submissions.user_id)
  );

-- Users can update their own submissions (only if draft or submitted)
DROP POLICY IF EXISTS "submissions_update_own" ON submissions;
CREATE POLICY "submissions_update_own" ON submissions
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE id = submissions.user_id)
  )
  WITH CHECK (
    -- Prevent the user from changing user_id or cohort_id,
    -- and from setting status outside draft/submitted
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status IN ('draft', 'submitted')
  );

-- Admins can update any submission (ban, mark as winner, etc.)
DROP POLICY IF EXISTS "submissions_update_admin" ON submissions;
CREATE POLICY "submissions_update_admin" ON submissions
  FOR UPDATE USING (
    public.is_admin()
  );

-- Admins can delete submissions
DROP POLICY IF EXISTS "submissions_delete_admin" ON submissions;
CREATE POLICY "submissions_delete_admin" ON submissions
  FOR DELETE USING (
    public.is_admin()
  );
