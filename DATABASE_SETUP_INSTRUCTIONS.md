# Database Setup Instructions

## Error: "Could not find the 'subject' column of 'study_logs' in the schema cache"

This error means your Supabase database tables haven't been created yet.

## Fix: Run the SQL Schema

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema Script**
   - Open the file: `frontend/src/supabase-setup.sql`
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run" or press Ctrl/Cmd + Enter

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - user_profiles
     - study_logs
     - study_patterns
     - user_streaks
     - mentorship_connections
     - alumni_connections
     - mentor_student_notes
     - catchup_plan_history

5. **Refresh Your App**
   - Reload your browser
   - Try adding a study log again

## What This Does

The SQL script creates all the database tables your app needs:

- **study_logs**: Stores student study sessions (subject, duration, date, notes)
- **user_profiles**: Stores user account info (role, name, bio)
- **mentorship_connections**: Links mentors with students
- And more...

## Still Having Issues?

If you still get errors after running the SQL:

1. Check the SQL Editor for any error messages
2. Verify your Supabase project is active
3. Confirm you have admin access to the project
4. Try refreshing the schema cache in Supabase settings
