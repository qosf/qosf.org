-- QOSF Mentorship Programme Database Schema
-- Supabase SQL (PostgreSQL dialect)
--
-- INSTRUCTIONS: Copy and paste this entire file into your Supabase
-- SQL Editor and run it. It is safe to re-run (all statements use
-- IF NOT EXISTS / DROP IF EXISTS guards).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- HELPER: updated_at trigger function
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- TRIGGER: auto-create profile on auth.users signup
-- =============================================================
-- Without this trigger, client-side INSERT INTO profiles would
-- fail RLS because the session isn't always established yet.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    'none'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- PROFILES
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mentee', 'mentor', 'admin')) DEFAULT 'mentee',
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  bio TEXT,
  educational_level TEXT,
  research_interests TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  timezone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add UNIQUE on user_id if not present (needed for upsert conflict targets)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
      AND conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD UNIQUE (user_id);
  END IF;
END;
$$;

-- Broaden the role CHECK to include 'none' (the default for new users).
-- Existing rows keep their current value.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('none', 'mentee', 'mentor', 'admin'));

-- Update the default value
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'none';

-- SECURITY DEFINER function to check admin role without triggering RLS
-- recursion (the subquery would otherwise loop because the policy on
-- profiles queries profiles again).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    public.is_admin()
  );

-- =============================================================
-- COHORTS
-- =============================================================
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  application_start TIMESTAMPTZ NOT NULL,
  application_end TIMESTAMPTZ NOT NULL,
  mentorship_start TIMESTAMPTZ NOT NULL,
  mentorship_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'active', 'completed')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS cohorts_updated_at ON cohorts;
CREATE TRIGGER cohorts_updated_at
  BEFORE UPDATE ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cohorts_select_all" ON cohorts;
CREATE POLICY "cohorts_select_all" ON cohorts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "cohorts_insert_admin" ON cohorts;
CREATE POLICY "cohorts_insert_admin" ON cohorts
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "cohorts_update_admin" ON cohorts;
CREATE POLICY "cohorts_update_admin" ON cohorts
  FOR UPDATE USING (
    public.is_admin()
  );

-- =============================================================
-- APPLICATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mentee', 'mentor')),
  form_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_cohort_id ON applications(cohort_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_own" ON applications;
CREATE POLICY "applications_select_own" ON applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_select_admin" ON applications;
CREATE POLICY "applications_select_admin" ON applications
  FOR SELECT USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_own" ON applications;
CREATE POLICY "applications_update_own" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_admin" ON applications;
CREATE POLICY "applications_update_admin" ON applications
  FOR UPDATE USING (
    public.is_admin()
  );

-- =============================================================
-- MATCHES
-- =============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS matches_updated_at ON matches;
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_matches_cohort_id ON matches(cohort_id);
CREATE INDEX IF NOT EXISTS idx_matches_mentor_id ON matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_matches_mentee_id ON matches(mentee_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_own" ON matches;
CREATE POLICY "matches_select_own" ON matches
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (mentor_id, mentee_id)
    )
  );

DROP POLICY IF EXISTS "matches_select_admin" ON matches;
CREATE POLICY "matches_select_admin" ON matches
  FOR SELECT USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "matches_insert_admin" ON matches;
CREATE POLICY "matches_insert_admin" ON matches
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "matches_update_admin" ON matches;
CREATE POLICY "matches_update_admin" ON matches
  FOR UPDATE USING (
    public.is_admin()
  );

-- =============================================================
-- TIMELINE EVENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'other' CHECK (event_type IN ('deadline', 'milestone', 'meeting', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_cohort_id ON timeline_events(cohort_id);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timeline_select_all" ON timeline_events;
CREATE POLICY "timeline_select_all" ON timeline_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "timeline_insert_admin" ON timeline_events;
CREATE POLICY "timeline_insert_admin" ON timeline_events
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

-- =============================================================
-- BOOTSTRAP INITIAL ADMIN
-- =============================================================
-- After creating your first user via the web signup form, run:
--
--   UPDATE public.profiles
--   SET role = 'admin', status = 'approved'
--   WHERE email = 'your@email.com';
-- =============================================================
