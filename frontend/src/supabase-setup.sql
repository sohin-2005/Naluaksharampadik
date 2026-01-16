-- Naalu Aksharam Padikk - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migration: Drop college column if it exists
ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS college;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'alumni')),
  department TEXT NOT NULL,
  year INTEGER,
  profile_image TEXT,
  bio TEXT,
  areas_of_expertise TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship connections table
CREATE TABLE IF NOT EXISTS mentorship_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(mentor_id, mentee_id)
);

-- Study logs table
CREATE TABLE IF NOT EXISTS study_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  topic TEXT,
  duration_minutes INTEGER NOT NULL,
  hours_studied DECIMAL(4,2) NOT NULL,
  subjects TEXT[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Study patterns/preferences table
CREATE TABLE IF NOT EXISTS study_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_time_of_day TEXT CHECK (preferred_time_of_day IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
  preferred_session_duration INTEGER, -- in minutes
  focus_subjects TEXT[],
  study_days TEXT[], -- e.g. ['monday', 'wednesday', 'friday']
  breaks_preference TEXT, -- e.g., 'pomodoro', 'long_breaks', 'no_breaks'
  environment_preference TEXT, -- e.g., 'quiet', 'music', 'group'
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catch-up plans table
CREATE TABLE IF NOT EXISTS catch_up_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  subjects TEXT[] NOT NULL,
  roadmap JSONB,
  approved_by_mentor UUID REFERENCES users(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  description TEXT,
  resources TEXT,
  duration_minutes INTEGER DEFAULT 0,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student projects table
CREATE TABLE IF NOT EXISTS student_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL,
  project_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_log_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor early start plans table
CREATE TABLE IF NOT EXISTS early_start_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_year INTEGER,
  subjects TEXT[] NOT NULL,
  weekly_hours DECIMAL(4,2),
  roadmap JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alumni resources table
CREATE TABLE IF NOT EXISTS alumni_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('course', 'book', 'tool', 'skill', 'tip', 'other')),
  resource_url TEXT,
  category TEXT,
  skills_covered TEXT[],
  is_placement_focused BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor/Alumni verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('mentor', 'alumni')),
  linkedin_url TEXT,
  github_url TEXT,
  resume_url TEXT,
  proof_document_url TEXT,
  current_position TEXT,
  company TEXT,
  years_of_experience INTEGER,
  reason_to_mentor TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Mentor Playbooks table
CREATE TABLE IF NOT EXISTS mentor_playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor-Student Notes table
CREATE TABLE IF NOT EXISTS mentor_student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  note_type TEXT CHECK (note_type IN ('observation', 'strength', 'concern', 'action_item')),
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor Pulse Check-ins table
CREATE TABLE IF NOT EXISTS mentor_pulse_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('on_track', 'concern', 'critical')),
  notes TEXT,
  week_starting DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id, week_starting)
);

-- Alumni Roadmaps table
CREATE TABLE IF NOT EXISTS alumni_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_year INTEGER NOT NULL,
  academic_focus TEXT[],
  skills_focus TEXT[],
  tech_skills TEXT[],
  lessons_learned TEXT,
  mistakes_to_avoid TEXT,
  interview_prep TEXT,
  resources JSONB,
  interview_tips JSONB,
  timeline_months INTEGER,
  key_milestones TEXT[],
  companies_cracked TEXT[],
  timeline JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentor Availability table
CREATE TABLE IF NOT EXISTS mentor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_bookings_per_slot INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, day_of_week, start_time)
);

-- Alumni Connections table (for students to connect with alumni)
CREATE TABLE IF NOT EXISTS alumni_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(alumni_id, student_id)
);

-- Skill Recommendations table
CREATE TABLE IF NOT EXISTS skill_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  resource_url TEXT,
  action_item TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catch-up Plan History table
CREATE TABLE IF NOT EXISTS catchup_plan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES catch_up_plans(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  syllabus_completion_percentage DECIMAL(5,2),
  days_remaining INTEGER,
  daily_study_hours DECIMAL(4,2),
  best_case_timeline TEXT,
  realistic_timeline TEXT,
  worst_case_timeline TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON mentorship_connections(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentee ON mentorship_connections(mentee_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_user ON study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_date ON study_logs(date);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_early_start_plans_mentor ON early_start_plans(mentor_id);
CREATE INDEX IF NOT EXISTS idx_alumni_resources_alumni ON alumni_resources(alumni_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentor_playbooks_mentor ON mentor_playbooks(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_notes_mentor ON mentor_student_notes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_notes_mentee ON mentor_student_notes(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_pulse_mentor ON mentor_pulse_checkins(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_pulse_mentee ON mentor_pulse_checkins(mentee_id);
CREATE INDEX IF NOT EXISTS idx_alumni_roadmaps_alumni ON alumni_roadmaps(alumni_id);
CREATE INDEX IF NOT EXISTS idx_alumni_roadmaps_public ON alumni_roadmaps(is_public);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor ON mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day ON mentor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_alumni ON alumni_connections(alumni_id);
CREATE INDEX IF NOT EXISTS idx_alumni_connections_student ON alumni_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_alumni ON skill_recommendations(alumni_id);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_mentee ON skill_recommendations(mentee_id);
CREATE INDEX IF NOT EXISTS idx_catchup_plan_history_plan ON catchup_plan_history(plan_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_up_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_start_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_pulse_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE catchup_plan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Note: Using Firebase Auth, not Supabase Auth)
-- Drop policies if they already exist to keep script idempotent
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view connections" ON mentorship_connections;
DROP POLICY IF EXISTS "Users can create connections" ON mentorship_connections;
DROP POLICY IF EXISTS "Users can update connections" ON mentorship_connections;
DROP POLICY IF EXISTS "Users can view all study logs" ON study_logs;
DROP POLICY IF EXISTS "Users can manage own study logs" ON study_logs;
DROP POLICY IF EXISTS "Anyone can view posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
DROP POLICY IF EXISTS "Anyone can view early start plans" ON early_start_plans;
DROP POLICY IF EXISTS "Mentors can manage own plans" ON early_start_plans;
DROP POLICY IF EXISTS "Anyone can view alumni resources" ON alumni_resources;
DROP POLICY IF EXISTS "Alumni can manage own resources" ON alumni_resources;
DROP POLICY IF EXISTS "Users can view own verification request" ON verification_requests;
DROP POLICY IF EXISTS "Users can create verification request" ON verification_requests;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view public playbooks" ON mentor_playbooks;
DROP POLICY IF EXISTS "Mentors can manage own playbooks" ON mentor_playbooks;
DROP POLICY IF EXISTS "Mentors can view own notes" ON mentor_student_notes;
DROP POLICY IF EXISTS "Mentors can manage own notes" ON mentor_student_notes;
DROP POLICY IF EXISTS "Mentors can manage pulse checkins" ON mentor_pulse_checkins;
DROP POLICY IF EXISTS "Anyone can view public roadmaps" ON alumni_roadmaps;
DROP POLICY IF EXISTS "Alumni can manage own roadmaps" ON alumni_roadmaps;
DROP POLICY IF EXISTS "Anyone can view mentor availability" ON mentor_availability;
DROP POLICY IF EXISTS "Mentors can manage own availability" ON mentor_availability;
DROP POLICY IF EXISTS "Students can view alumni connections" ON alumni_connections;
DROP POLICY IF EXISTS "Students can create alumni connections" ON alumni_connections;
DROP POLICY IF EXISTS "Alumni can manage connections" ON alumni_connections;
DROP POLICY IF EXISTS "Alumni can view and manage recommendations" ON skill_recommendations;
DROP POLICY IF EXISTS "Mentors can manage catchup history" ON catchup_plan_history;
DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can manage post likes" ON post_likes;
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can manage comments" ON post_comments;
DROP POLICY IF EXISTS "Users can view streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can manage own streak" ON user_streaks;

-- Allow public read access to user profiles (for mentor/alumni discovery)
CREATE POLICY "Anyone can view user profiles" ON users
  FOR SELECT USING (true);

-- Allow users to insert their own profile (Firebase handles auth)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile (Firebase handles auth)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

-- Mentorship connections policies (using client-side Firebase auth)
CREATE POLICY "Users can view connections" ON mentorship_connections
  FOR SELECT USING (true);

CREATE POLICY "Users can create connections" ON mentorship_connections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update connections" ON mentorship_connections
  FOR UPDATE USING (true);

-- Study logs policies
CREATE POLICY "Users can view all study logs" ON study_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own study logs" ON study_logs
  FOR ALL USING (true);

-- Community posts policies
CREATE POLICY "Anyone can view posts" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON community_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE USING (true);

-- Post likes policies
CREATE POLICY "Anyone can view post likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage post likes" ON post_likes
  FOR ALL USING (true);

-- Post comments policies
CREATE POLICY "Anyone can view comments" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage comments" ON post_comments
  FOR ALL USING (true);

-- User streaks policies
CREATE POLICY "Users can view streaks" ON user_streaks
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own streak" ON user_streaks
  FOR ALL USING (true);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their messages" ON messages
  FOR UPDATE USING (true);

-- Early start plans policies
CREATE POLICY "Anyone can view early start plans" ON early_start_plans
  FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own plans" ON early_start_plans
  FOR ALL USING (true);

-- Alumni resources policies
CREATE POLICY "Anyone can view alumni resources" ON alumni_resources
  FOR SELECT USING (true);

CREATE POLICY "Alumni can manage own resources" ON alumni_resources
  FOR ALL USING (true);

-- Verification requests policies
CREATE POLICY "Users can view own verification request" ON verification_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can create verification request" ON verification_requests
  FOR INSERT WITH CHECK (true);

-- Mentor Playbooks policies
CREATE POLICY "Anyone can view public playbooks" ON mentor_playbooks
  FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own playbooks" ON mentor_playbooks
  FOR ALL USING (true);

-- Mentor Notes policies
CREATE POLICY "Mentors can view own notes" ON mentor_student_notes
  FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own notes" ON mentor_student_notes
  FOR ALL USING (true);

-- Mentor Pulse policies
CREATE POLICY "Mentors can manage pulse checkins" ON mentor_pulse_checkins
  FOR ALL USING (true);

-- Alumni Roadmaps policies
CREATE POLICY "Anyone can view public roadmaps" ON alumni_roadmaps
  FOR SELECT USING (true);

CREATE POLICY "Alumni can manage own roadmaps" ON alumni_roadmaps
  FOR ALL USING (true);

-- Mentor Availability policies
CREATE POLICY "Anyone can view mentor availability" ON mentor_availability
  FOR SELECT USING (true);

CREATE POLICY "Mentors can manage own availability" ON mentor_availability
  FOR ALL USING (true);

-- Alumni Connections policies
CREATE POLICY "Students can view alumni connections" ON alumni_connections
  FOR SELECT USING (true);

CREATE POLICY "Students can create alumni connections" ON alumni_connections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Alumni can manage connections" ON alumni_connections
  FOR UPDATE USING (true);

-- Skill Recommendations policies
CREATE POLICY "Alumni can view and manage recommendations" ON skill_recommendations
  FOR ALL USING (true);

-- Catchup Plan History policies
CREATE POLICY "Mentors can manage catchup history" ON catchup_plan_history
  FOR ALL USING (true);

-- Utility function to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_catch_up_plans_updated_at ON catch_up_plans;
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks;
DROP TRIGGER IF EXISTS update_early_start_plans_updated_at ON early_start_plans;
DROP TRIGGER IF EXISTS update_alumni_resources_updated_at ON alumni_resources;
DROP TRIGGER IF EXISTS update_mentor_playbooks_updated_at ON mentor_playbooks;
DROP TRIGGER IF EXISTS update_mentor_student_notes_updated_at ON mentor_student_notes;
DROP TRIGGER IF EXISTS update_alumni_roadmaps_updated_at ON alumni_roadmaps;
DROP TRIGGER IF EXISTS update_student_projects_updated_at ON student_projects;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catch_up_plans_updated_at BEFORE UPDATE ON catch_up_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_early_start_plans_updated_at BEFORE UPDATE ON early_start_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alumni_resources_updated_at BEFORE UPDATE ON alumni_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_playbooks_updated_at BEFORE UPDATE ON mentor_playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_student_notes_updated_at BEFORE UPDATE ON mentor_student_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alumni_roadmaps_updated_at BEFORE UPDATE ON alumni_roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_projects_updated_at BEFORE UPDATE ON student_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC functions for community posts

-- Increment post likes count
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement post likes count
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
