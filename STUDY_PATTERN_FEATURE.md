# Study Pattern Feature Documentation

## Overview

The Study Pattern feature allows students to create and manage their personalized study preferences, helping mentors understand their learning habits and provide better guidance.

## Location

**Student Dashboard** → **My Study Patterns** tab

## Features

### 1. Preferred Time of Day

Students can select when they study best:

- 🌅 Morning (6 AM - 12 PM)
- ☕ Afternoon (12 PM - 5 PM)
- 🌇 Evening (5 PM - 9 PM)
- 🌙 Night (9 PM - 1 AM)
- 🕐 Flexible / Varies

### 2. Session Duration

- Custom duration input (in minutes)
- Quick-select buttons: 30, 45, 60, 90, 120 minutes
- Slider control for fine-tuning

### 3. Study Days

Weekly schedule selector with toggle buttons for each day:

- Monday through Sunday
- Multiple selections allowed
- Visual indication of selected days

### 4. Focus Subjects

- Add subjects as tags
- Remove subjects by clicking the × button
- Stores as an array for easy filtering

### 5. Break Preferences

Four break strategies:

- **Pomodoro** - 25 min study + 5 min break
- **Long Breaks** - Long sessions with extended breaks
- **Short Frequent** - Short, frequent breaks
- **No Breaks** - Continuous study sessions

### 6. Environment Preference

Choose your ideal study environment:

- 🤫 Complete Silence
- 🎧 Music / White Noise
- 📚 Library Environment
- 👥 Group Study

### 7. Study Goals

Free-text area for students to articulate their academic goals:

- Improve CGPA
- Master specific subjects
- Prepare for placements
- Complete assignments on time
- etc.

## Technical Details

### Database Schema

Table: `study_patterns`

```sql
CREATE TABLE study_patterns (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  preferred_time_of_day TEXT CHECK (IN 'morning', 'afternoon', 'evening', 'night', 'flexible'),
  preferred_session_duration INTEGER,
  focus_subjects TEXT[],
  study_days TEXT[],
  breaks_preference TEXT,
  environment_preference TEXT,
  goals TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Component

**File:** `/frontend/src/components/student/MyStudyPattern.tsx`

**Key Functions:**

- `fetchPattern()` - Loads existing pattern from database
- `handleSavePattern()` - Upserts pattern (creates or updates)
- `toggleDay()` - Manages study day selections
- `addSubject()` / `removeSubject()` - Subject tag management

### Integration

The component is integrated into the `StudentInsightsPanel` component, accessible via the "My Study Patterns" tab.

## User Experience

### First Time Use

1. Student navigates to Dashboard → My Study Patterns
2. Form is pre-filled with default values:
   - Morning preference
   - 60-minute sessions
   - Pomodoro breaks
   - Quiet environment
3. Student customizes all fields
4. Clicks **"Save Pattern"** button
5. Success message appears: "✓ Study pattern saved successfully!"

### Updating Pattern

1. Existing pattern loads automatically
2. Student modifies any fields
3. Button text changes to **"Update Pattern"**
4. Saves changes with success confirmation
5. Pattern persists across sessions

## Design System

### Colors & Styling

- **Background:** Dark theme (neutral-900/800)
- **Accents:** Purple/Indigo gradients
- **Selected Items:** Purple-500 border with 10% opacity background
- **Unselected Items:** Neutral-700 border with hover effects

### Icons (Lucide React)

- Clock, Sun, Moon, Sunset, Coffee (time preferences)
- Headphones, Users2 (environment preferences)
- CheckCircle, AlertCircle (feedback states)

## Data Flow

1. **Load:** `useEffect` → `fetchPattern()` → Supabase query → `setPattern()`
2. **Edit:** User interaction → `setPattern()` state update
3. **Save:** Button click → `handleSavePattern()` → Supabase upsert → Success message

## Error Handling

- Handles PGRST116 error (no rows found) gracefully
- Console logs errors without breaking UI
- Shows user-friendly error states
- Continues with default values if fetch fails

## Future Enhancements

Potential additions:

1. **Mentor Visibility** - Mentors can view student patterns for better guidance
2. **Pattern Analytics** - Track how patterns correlate with academic performance
3. **AI Recommendations** - Suggest optimal study patterns based on historical data
4. **Pattern Sharing** - Students can share successful patterns with peers
5. **Notifications** - Remind students to study during their preferred times

## Testing Checklist

- [ ] Pattern saves successfully on first use
- [ ] Pattern loads correctly on return visit
- [ ] All time preferences work
- [ ] Duration slider and quick-select buttons function
- [ ] Day toggles add/remove correctly
- [ ] Subject tags add/remove without errors
- [ ] All break preferences selectable
- [ ] All environment options selectable
- [ ] Goals textarea saves properly
- [ ] Success message displays and disappears after 3 seconds
- [ ] No TypeScript compilation errors
- [ ] Component renders without console errors

## Support

For issues or questions about the Study Pattern feature:

1. Check database connection (Supabase)
2. Verify `study_patterns` table exists
3. Check browser console for errors
4. Ensure user is authenticated
5. Verify RLS policies allow read/write access
