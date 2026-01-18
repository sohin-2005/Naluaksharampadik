-- ============================================================
-- DATABASE SCHEMA & SETUP
-- ============================================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'mentor', 'alumni')) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Study Patterns Table
CREATE TABLE IF NOT EXISTS study_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_time_of_day TEXT[] DEFAULT ARRAY['morning', 'afternoon'],
  session_duration INTEGER DEFAULT 60,
  focus_subjects TEXT[] DEFAULT ARRAY[],
  study_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  breaks_preference TEXT DEFAULT '5-10 minutes every 25 minutes',
  environment_preference TEXT DEFAULT 'quiet',
  goals TEXT[] DEFAULT ARRAY[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Study Logs Table
CREATE TABLE IF NOT EXISTS study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  date DATE NOT NULL,
  time_of_day TEXT,
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 5),
  environment TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- STORAGE BUCKET SETUP
-- ============================================================

-- Create storage bucket for study log attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-attachments', 
  'study-attachments', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies (drop if exists, then create)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'study-attachments');

DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'study-attachments');

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'study-attachments');

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Mentorship Connections Table
CREATE TABLE IF NOT EXISTS mentorship_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id)
);

-- Alumni Connections Table
CREATE TABLE IF NOT EXISTS alumni_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumni_id, student_id)
);

-- Mentor Student Notes Table
CREATE TABLE IF NOT EXISTS mentor_student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  note_type TEXT CHECK (note_type IN ('observation', 'strength', 'concern', 'action_item', 'intervention')) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catch-up Plan History Table
CREATE TABLE IF NOT EXISTS catchup_plan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  syllabus_completion_percentage NUMERIC NOT NULL,
  days_remaining INTEGER NOT NULL,
  daily_study_hours NUMERIC NOT NULL,
  best_case_timeline INTEGER NOT NULL,
  realistic_timeline INTEGER NOT NULL,
  worst_case_timeline INTEGER NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_study_logs_user_id ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_date ON study_logs(date);
CREATE INDEX IF NOT EXISTS idx_study_logs_created_at ON study_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_mentor ON mentorship_connections(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_mentee ON mentorship_connections(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_connections_status ON mentorship_connections(status);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_alumni ON alumni_connections(alumni_id);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_student ON alumni_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_status ON alumni_connections(status);
CREATE INDEX IF NOT EXISTS idx_mentor_student_notes_mentor ON mentor_student_notes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_notes_mentee ON mentor_student_notes(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_notes_created_at ON mentor_student_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_catchup_plan_mentor ON catchup_plan_history(mentor_id);
CREATE INDEX IF NOT EXISTS idx_catchup_plan_mentee ON catchup_plan_history(mentee_id);
CREATE INDEX IF NOT EXISTS idx_catchup_plan_created_at ON catchup_plan_history(created_at);

-- ============================================================
-- ROW LEVEL SECURITY CONFIGURATION
-- ============================================================

ALTER TABLE mentorship_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_student_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE catchup_plan_history DISABLE ROW LEVEL SECURITY;
