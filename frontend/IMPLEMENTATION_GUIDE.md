# Firebase Firestore Implementation Guide

## Naalu Aksharam Padikk - Full Data-Driven Dashboard

---

## Overview

The dashboard has been completely refactored to be **100% data-driven** using Firebase Firestore. All hardcoded values have been removed, and the UI now dynamically populates based on real user data.

---

## Key Changes Made

### 1. **HTML Changes**

- ✅ Removed all hardcoded numbers (247, 1834, 563, etc.)
- ✅ Removed mock study plan cards
- ✅ Removed hardcoded roadmap tasks
- ✅ Added dynamic containers with IDs for JS population
- ✅ Added empty-state messages for no-data scenarios

**Affected Elements:**

```html
<!-- Before: <div class="card-number">247</div> -->
<!-- After: <div class="card-number" id="activeMentorsCount">--</div> -->

<!-- Before: Multiple hardcoded plan cards -->
<!-- After: <div id="plansContainer"> with JS population -->

<!-- Before: Hardcoded roadmap tasks -->
<!-- After: <div id="roadmapContainer"> with dynamic tasks -->
```

### 2. **JavaScript Implementation**

#### New Files Created:

- **`firestore-utils.js`** - Utility functions for all Firestore operations
- **`firestore-schema.md`** - Database schema documentation

#### Updated Files:

- **`dashboard.js`** - Now imports and uses Firestore utilities

#### Key Functions Added:

```javascript
// User Functions
- getUserProfile(userId)
- updateUserProfile(userId, userData)

// Study Logs
- getUserStudyLogs(userId, limit)
- createStudyLog(userId, logData)
- getTotalStudyHours(userId)

// Streaks
- getStreakData(userId)
- updateStudyStreak(userId)

// Mentors
- getAvailableMentors(limit)
- searchMentors(department, expertise)

// Connections
- getUserConnections(userId)
- createConnection(studentId, mentorId)

// Catch-up Plans
- getCatchUpPlans(userId)
- getRoadmapTasks(planId)
- completeRoadmapTask(taskId)

// Achievements
- getUserAchievements(userId)
- awardAchievement(userId, type, data)
- checkAchievements(userId)

// Dashboard Stats
- getDashboardStats(userId) - Main function that fetches all data
- getWeeklyStats(userId)
```

### 3. **UI Functions**

New functions populate the dashboard dynamically:

```javascript
- updateSummaryCards(stats) - Updates the three metric cards
- populateCatchUpPlans(userId) - Renders catch-up plan cards
- populateRoadmap(userId) - Renders roadmap task items
- toggleTask(taskId, element) - Marks tasks as complete
- calculateDaysLeft(examDate) - Calculates countdown
- formatDate(date) - Formats timestamps for display
- escapeHtml(text) - Prevents XSS attacks
```

---

## Data Flow

### Dashboard Load Sequence:

```
1. User Authentication ✓
   ↓
2. Fetch Dashboard Stats
   - User Profile
   - Streak Data
   - Study Logs (count & hours)
   - Connections (count)
   - Catch-up Plans (count)
   - Achievements (count)
   ↓
3. Update Summary Cards
   - Active Mentors = connections count
   - Study Logs = logs count
   - Active Plans = plans count
   ↓
4. Populate Catch-up Plans
   - Fetch user's active plans from Firestore
   - Calculate days left to exam
   - Render progress bars
   ↓
5. Populate Roadmap
   - Fetch tasks from first active plan
   - Show completion status
   - Enable click-to-complete
   ↓
6. Enable Interactions
   - Tab navigation
   - Button handlers
   - Notifications
```

---

## Empty States

The dashboard now shows appropriate messages when no data exists:

### No Catch-up Plans

```html
<p class="empty-state">
  No active catch-up plans yet. Create one to get started!
</p>
```

### No Roadmap Tasks

```html
<p class="empty-state">
  No active roadmap. Start a catch-up plan to see daily tasks!
</p>
```

### No Streaks

```
Streak Display: 0 days
```

---

## Security Considerations

### Firestore Security Rules

```javascript
- Users can only access their own documents
- Public study logs are visible to all authenticated users
- Connections require both parties for read/write
- Mentors collection is public-readable
```

### Frontend Security

- HTML escaping to prevent XSS
- User UID from auth (not from URL)
- No sensitive data in localStorage
- All API calls scoped to authenticated user

---

## Streak Calculation Logic

```javascript
Today has log → Maintain streak
Yesterday has log → Increment streak
Before yesterday → Reset to 1 day

Example:
Day 1: Log created → streak = 1
Day 2: Log created → streak = 2
Day 3: No log → streak = 0
Day 4: Log created → streak = 1
```

---

## Statistics Calculation

### Total Study Hours

```javascript
Sum of all durationMinutes / 60
Example: 180 minutes + 120 minutes = 300 minutes = 5 hours
```

### Weekly Stats

```javascript
Group study logs by day of week
Calculate total hours per day for past 7 days
```

---

## Achievement System

### Auto-Awarded Achievements:

- **first_study_log** - When user creates first log
- **7_day_streak** - When streak reaches 7
- **14_day_streak** - When streak reaches 14
- **100_hours** - When total study hours ≥ 100
- **first_connection** - When user connects with mentor
- **helpful_mentor** - When mentor gets 10+ positive ratings
- **catch_up_completed** - When catch-up plan is completed
- **community_contributor** - When user posts 5 public logs

---

## Usage Example: Creating Sample Data

### Using Firebase Console or Admin SDK:

```javascript
// Create a user document
db.collection("users").doc("user123").set({
  name: "Arjun Kumar",
  email: "arjun@example.com",
  role: "junior",
  department: "Computer Science",
  year: 2,
  totalStudyHours: 0,
  currentStreak: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create streak document
db.collection("streaks").doc("user123").set({
  userId: "user123",
  currentStreak: 0,
  longestStreak: 0,
  totalHours: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create a study log
db.collection("studyLogs").add({
  userId: "user123",
  subject: "Data Structures",
  topic: "Binary Search Trees",
  description: "Studied insertion and deletion",
  durationMinutes: 45,
  createdAt: new Date(),
  likes: 0,
  isPublic: true,
});

// Create a catch-up plan
db.collection("catchUpPlans").add({
  userId: "user123",
  subject: "Operating Systems",
  difficulty: "medium",
  examDate: new Date("2026-03-15"),
  progressPercent: 0,
  status: "active",
  createdAt: new Date(),
});

// Create roadmap tasks
db.collection("roadmapTasks").add({
  planId: "plan123",
  dayNumber: 1,
  title: "Review Basic Concepts",
  description: "Understand processes and threads",
  estimatedHours: 2,
  isCompleted: false,
  createdAt: new Date(),
});
```

---

## Testing the Dashboard

### 1. **Test Empty State**

- Delete all catch-up plans
- Verify "No active plans" message appears

### 2. **Test Streak Counter**

- Add study logs on consecutive days
- Verify streak increments
- Verify display updates in navbar

### 3. **Test Plan Population**

- Create multiple catch-up plans
- Verify all plans render
- Verify progress bars show correct percentages

### 4. **Test Roadmap**

- Create roadmap tasks under a plan
- Click checkboxes to complete
- Verify visual state changes

### 5. **Test Stats**

- Add multiple study logs
- Calculate total hours manually
- Verify displayed total matches

---

## Browser Console Debugging

```javascript
// Check current user
console.log(auth.currentUser);

// Check if firestore is loaded
console.log(db);

// Manual stat fetch (in console)
getDashboardStats("user-uid").then((stats) => console.log(stats));

// Manual streak fetch
getStreakData("user-uid").then((streak) => console.log(streak));

// Manual study logs fetch
getUserStudyLogs("user-uid", 10).then((logs) => console.log(logs));
```

---

## Common Issues & Solutions

### Issue: Dashboard shows 0 for all values

**Solution:**

- Check if user document exists in Firestore
- Verify user UID matches auth.currentUser.uid
- Check browser console for errors

### Issue: Streak not updating

**Solution:**

- Verify study log was created with `createdAt` timestamp
- Check streak document exists for user
- Call `updateStudyStreak()` after adding log

### Issue: Empty state shows but data exists

**Solution:**

- Verify Firestore query filters match data
- Check where clauses in queries
- Verify array fields are properly indexed

### Issue: XSS warnings

**Solution:**

- All data is escaped using `escapeHtml()` function
- Never use `innerHTML` with user data
- Use text content for names and descriptions

---

## Next Steps

### To Fully Deploy:

1. ✅ Set up Firestore collections
2. ✅ Create security rules
3. ✅ Populate sample data
4. ✅ Test dashboard display
5. ⏳ Add study log creation form
6. ⏳ Add catch-up plan creation modal
7. ⏳ Add mentor search interface
8. ⏳ Add chat functionality
9. ⏳ Add rating/review system
10. ⏳ Add achievement badges UI

---

## Files Modified

| File                           | Changes                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `dashboard.html`               | Removed hardcoded values, added dynamic containers        |
| `dashboard.js`                 | Added Firestore integration, data fetching, UI population |
| `dashboard.css`                | Added empty-state styling                                 |
| `firebase-config.js`           | (Unchanged)                                               |
| **New:** `firestore-utils.js`  | All utility functions for Firestore                       |
| **New:** `firestore-schema.md` | Complete database schema                                  |

---

## Version History

- **v1.0** (Jan 14, 2026) - Initial Firestore integration
  - Removed all hardcoded values
  - Created utility functions
  - Dynamic UI population
  - Empty states handling
  - Real-time data fetching

---

## Support & Questions

Refer to:

- `firestore-schema.md` - Database structure
- `firestore-utils.js` - Function documentation
- Firebase official docs: https://firebase.google.com/docs/firestore
