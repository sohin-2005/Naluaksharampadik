-- ============================================================
-- QUICK FIX: Run this to verify and create tables
-- ============================================================

-- First, let's check if the table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'study_logs') THEN
        RAISE NOTICE 'study_logs table does not exist. Creating it now...';
    ELSE
        RAISE NOTICE 'study_logs table already exists.';
    END IF;
END $$;

-- Drop and recreate study_logs table to ensure it has all columns
DROP TABLE IF EXISTS study_logs CASCADE;

CREATE TABLE study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

-- Create indexes
CREATE INDEX idx_study_logs_user_id ON study_logs(user_id);
CREATE INDEX idx_study_logs_date ON study_logs(date);
CREATE INDEX idx_study_logs_created_at ON study_logs(created_at);

-- Disable RLS for now (since we're using Firebase auth)
ALTER TABLE study_logs DISABLE ROW LEVEL SECURITY;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-attachments', 
  'study-attachments', 
  true,
  52428800,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'study-attachments');

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'study-attachments');

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
