# Quick Setup Guide - Alumni Roadmap & Mentor Features

## 🚀 Setup Instructions

### Step 1: Update Database Schema

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `frontend/src/supabase-setup.sql`
4. Click "Run" to execute the SQL script
5. Verify tables are created:
   - `alumni_roadmaps` (updated with new fields)
   - `mentor_availability` (new)
   - `alumni_connections` (new)

### Step 2: Test the Features

#### As Alumni User:

1. Login with alumni account
2. Navigate to Dashboard → Alumni Dashboard tab
3. Click "New Roadmap" button
4. Fill in all sections:
   - Basic info (title, description, year)
   - Skills (academic, tech, soft)
   - Add resources (at least 2-3)
   - Add interview tips (at least 1)
   - Companies cracked
   - Milestones & lessons
5. Click "Create Roadmap"
6. Verify roadmap appears in list
7. Click "View Full Roadmap" to edit

#### As Student User:

1. Login with student account
2. Navigate to Dashboard

**Test Mentors Tab:** 3. Click "Mentors" tab 4. View list of verified mentors 5. Switch to "Alumni" tab 6. Click "Connect" on any mentor/alumni 7. Send connection request

**Test Roadmaps Tab:** 8. Click "Roadmaps" tab 9. Browse alumni roadmaps 10. Use department filter dropdown 11. Click any roadmap card 12. Explore full details in modal: - Scroll through all sections - Click resource links (opens in new tab) - Review interview tips - Read milestones

### Step 3: Verify Database Records

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check alumni roadmaps
SELECT * FROM alumni_roadmaps
ORDER BY created_at DESC;

-- Check mentor availability (if any)
SELECT * FROM mentor_availability;

-- Check alumni connections
SELECT * FROM alumni_connections
ORDER BY created_at DESC;

-- Check mentorship connections
SELECT * FROM mentorship_connections
WHERE status = 'pending';
```

## 📋 Checklist

- [ ] SQL script executed successfully
- [ ] Alumni can create roadmaps
- [ ] Alumni can edit existing roadmaps
- [ ] Roadmaps appear in alumni dashboard
- [ ] Students can view mentors list
- [ ] Students can view alumni list
- [ ] Students can send connection requests
- [ ] Students can browse roadmaps
- [ ] Students can filter roadmaps by department
- [ ] Students can view full roadmap details
- [ ] Resource links work correctly
- [ ] No console errors

## 🐛 Troubleshooting

### Roadmap creation fails

**Issue:** "Failed to save roadmap"
**Solutions:**

1. Check if alumni_id exists in users table
2. Verify RLS policies are enabled
3. Check browser console for detailed error
4. Ensure user is logged in as alumni

### Mentors/Alumni not showing

**Issue:** Empty list on Mentors tab
**Solutions:**

1. Verify users table has records with role='mentor' or 'alumni'
2. Check that is_verified=true for those users
3. Update user records: `UPDATE users SET is_verified=true WHERE role IN ('mentor', 'alumni');`

### Connection request fails

**Issue:** Duplicate error or request not sent
**Solutions:**

1. Check if connection already exists
2. Verify mentorship_connections or alumni_connections table structure
3. Check RLS policies allow INSERT

### Roadmaps not visible to students

**Issue:** Students see empty roadmaps list
**Solutions:**

1. Ensure roadmaps have is_public=true
2. Check RLS policy: "Anyone can view public roadmaps"
3. Verify alumni_id references valid user

## 🔧 Common SQL Fixes

```sql
-- Make all mentors/alumni verified
UPDATE users
SET is_verified = true
WHERE role IN ('mentor', 'alumni');

-- Make all roadmaps public
UPDATE alumni_roadmaps
SET is_public = true;

-- Delete test connections
DELETE FROM mentorship_connections WHERE status = 'pending';
DELETE FROM alumni_connections WHERE status = 'pending';

-- Reset a roadmap for testing
DELETE FROM alumni_roadmaps WHERE title LIKE '%test%';
```

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Review Supabase logs for database errors
3. Verify your user role is correct
4. Ensure all tables and policies exist
5. Check that Firebase authentication is working

## 🎯 Sample Data

For testing, you can insert sample data:

```sql
-- Sample mentor availability
INSERT INTO mentor_availability (mentor_id, day_of_week, start_time, end_time)
SELECT
  id,
  'monday',
  '14:00:00',
  '16:00:00'
FROM users
WHERE role = 'mentor'
LIMIT 1;

-- Sample alumni roadmap
INSERT INTO alumni_roadmaps (
  alumni_id,
  title,
  description,
  target_year,
  academic_focus,
  tech_skills,
  companies_cracked,
  is_public
)
SELECT
  id,
  'My Journey to Tech Giant',
  'Complete roadmap from college to FAANG',
  2024,
  ARRAY['DSA', 'System Design', 'DBMS'],
  ARRAY['Python', 'React', 'AWS'],
  ARRAY['Google', 'Microsoft'],
  true
FROM users
WHERE role = 'alumni'
LIMIT 1;
```

---

**Feature Status:** ✅ Complete and Ready for Testing
