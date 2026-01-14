# Firestore Database Schema

## Naalu Aksharam Padikk - Student Mentorship Platform

---

## Collection 1: `users`

**Document ID:** User UID (from Firebase Auth)

```javascript
{
  name: string,              // "Arjun Kumar"
  email: string,             // "arjun@example.com"
  role: string,              // "junior" | "mentor"
  department: string,        // "Computer Science"
  year: number,              // 2 (year of study)
  bio: string,               // Optional bio
  interests: array,          // ["DSA", "Web Dev", "AI/ML"]
  totalStudyHours: number,   // Aggregate: sum of all study logs
  currentStreak: number,     // Current consecutive days
  longestStreak: number,     // Peak streak achieved
  profileImageUrl: string,   // Optional profile picture
  createdAt: timestamp,      // Account creation date
  updatedAt: timestamp       // Last profile update
}
```

**Indexes:**

- `role` (for filtering mentors)
- `createdAt` (for sorting newest users)

---

## Collection 2: `mentors`

**Document ID:** Mentor UID

```javascript
{
  name: string,              // "Dr. Priya"
  email: string,             // From users collection
  department: string,        // "Computer Science"
  year: number,              // 4 (final year / graduate)
  expertise: array,          // ["DSA", "System Design", "Competitive Coding"]
  rating: number,            // 4.8 (out of 5)
  ratingCount: number,       // 47 (total ratings)
  studentsHelped: number,    // 23
  totalSessions: number,     // 156 sessions
  responseTime: number,      // Minutes (avg)
  status: string,            // "online" | "busy" | "offline"
  isVerified: boolean,       // true
  bio: string,               // Mentor description
  hourlyRate: number,        // Optional: credits per hour
  availableHours: array,     // [{day: "Mon", start: "14:00", end: "18:00"}]
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**

- `department, expertise` (for searching mentors)
- `rating` (descending, for top mentors)
- `status` (for finding available mentors)

---

## Collection 3: `connections`

**Document ID:** Auto-generated

```javascript
{
  mentorId: string,          // Reference to mentors/{mentorId}
  studentId: string,         // Reference to users/{userId}
  mentorName: string,        // Denormalized for quick display
  studentName: string,       // Denormalized for quick display
  status: string,            // "pending" | "connected" | "archived"
  initiatedBy: string,       // "student" | "mentor"
  lastMessage: string,       // Preview of last message
  lastMessageAt: timestamp,  // When last message was sent
  unreadCount: number,       // Unread message count
  rating: number,            // Rating given by student (0-5, optional)
  feedback: string,          // Feedback text (optional)
  totalSessions: number,     // Count of completed sessions
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**

- `studentId, updatedAt` (to show student's connections)
- `mentorId, updatedAt` (to show mentor's students)
- `status` (to filter active connections)

---

## Collection 4: `studyLogs`

**Document ID:** Auto-generated

```javascript
{
  userId: string,            // Reference to users/{userId}
  subject: string,           // "Data Structures"
  topic: string,             // "Binary Search Trees"
  description: string,       // "Studied BST insertion and deletion"
  durationMinutes: number,   // 45
  dateLogged: date,          // The date this study happened
  createdAt: timestamp,      // When log was created
  likes: number,             // Community engagement
  likedBy: array,            // ["uid1", "uid2"] - for unique tracking
  isPublic: boolean,         // true/false - shown in community feed
  photoUrl: string,          // Optional: proof/screenshot
  difficulty: string,        // "easy" | "medium" | "hard"
  tags: array                // ["revision", "practice", "concepts"]
}
```

**Indexes:**

- `userId, createdAt` (to show user's study logs)
- `dateLogged` (to calculate daily/weekly stats)
- `subject` (for subject-based filtering)

---

## Collection 5: `streaks`

**Document ID:** User UID

```javascript
{
  userId: string,            // Reference to users/{userId}
  currentStreak: number,     // Days in current streak
  lastLogDate: date,         // Last day a study log was created
  longestStreak: number,     // Peak streak achieved
  streakStartDate: date,     // When current streak began
  totalLogsCount: number,    // Total study logs ever created
  totalHours: number,        // Sum of all durationMinutes
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Logic:**

- Check if today or yesterday has a study log
- If today: maintain streak
- If yesterday: increment streak and update lastLogDate
- If before yesterday: reset to 0

---

## Collection 6: `catchUpPlans`

**Document ID:** Auto-generated

```javascript
{
  userId: string,            // Reference to users/{userId}
  subject: string,           // "Operating Systems"
  difficulty: string,        // "easy" | "medium" | "hard"
  examDate: date,            // Target exam date
  mentorId: string,          // Optional: assigned mentor
  progressPercent: number,   // 0-100
  status: string,            // "active" | "completed" | "abandoned"
  description: string,       // Plan overview
  totalDays: number,         // Total days allocated
  completedDays: number,     // Days completed
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Collection 7: `roadmapTasks`

**Document ID:** Auto-generated

```javascript
{
  planId: string,            // Reference to catchUpPlans/{planId}
  dayNumber: number,         // 1, 2, 3... (sequence)
  title: string,             // "Chapter 1: Processes"
  description: string,       // Detailed task description
  estimatedHours: number,    // 2.5 hours
  isCompleted: boolean,      // true/false
  completedAt: timestamp,    // When task was completed
  notes: string,             // User's notes
  resources: array,          // [{title: "Resource", url: "..."}]
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Collection 8: `achievements`

**Document ID:** Auto-generated

```javascript
{
  userId: string,            // Reference to users/{userId}
  type: string,              // Achievement type (see examples below)
  earnedAt: timestamp,
  data: object               // Additional context (optional)
}
```

**Achievement Types:**

- `"first_study_log"` - Logged first study session
- `"7_day_streak"` - Achieved 7-day streak
- `"14_day_streak"` - Achieved 14-day streak
- `"100_hours"` - Reached 100 study hours
- `"first_connection"` - Connected with first mentor
- `"helpful_mentor"` - Received 10+ positive ratings
- `"catch_up_completed"` - Completed a catch-up plan
- `"community_contributor"` - Posted 5 public study logs

---

## Collection 9: `messages` (Bonus)

**Document ID:** Auto-generated

```javascript
{
  connectionId: string,      // Reference to connections/{connectionId}
  senderId: string,          // Reference to users/{senderId}
  senderName: string,        // Denormalized
  content: string,           // Message text
  attachments: array,        // [{type: "image", url: "..."}]
  isRead: boolean,           // true/false
  readAt: timestamp,         // When recipient read message
  createdAt: timestamp
}
```

---

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if true; // Allow reading other users' public profiles
    }

    // Mentors collection (public read)
    match /mentors/{mentorId} {
      allow read: if true;
      allow write: if request.auth.uid == mentorId;
    }

    // Connections (both parties can access)
    match /connections/{connectionId} {
      allow read: if request.auth.uid == resource.data.studentId
                     || request.auth.uid == resource.data.mentorId;
      allow write: if request.auth.uid == resource.data.studentId
                      || request.auth.uid == resource.data.mentorId;
    }

    // Study logs (user owns, but others can read public logs)
    match /studyLogs/{logId} {
      allow read: if resource.data.userId == request.auth.uid
                     || resource.data.isPublic == true;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // Streaks (user only)
    match /streaks/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Catch-up plans (user only)
    match /catchUpPlans/{planId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Roadmap tasks (via parent plan)
    match /roadmapTasks/{taskId} {
      allow read: if true; // Read via plan
      allow write: if true; // Write via plan
    }

    // Achievements (user only)
    match /achievements/{achievementId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == request.auth.uid; // Backend writes
    }

    // Messages (connection parties only)
    match /messages/{messageId} {
      allow read: if true; // Filtered by frontend
      allow write: if request.auth.uid == request.auth.uid;
    }
  }
}
```

---

## Data Population Guide

### 1. User Registration

- Create document in `users` collection with UID
- Create document in `streaks` collection with UID (initialized: streak=0, hours=0)

### 2. Study Log Creation

- Add to `studyLogs` collection
- Update `streaks/{userId}` (check streak logic)
- Update `users/{userId}.totalStudyHours`
- Check achievements and add if earned

### 3. Mentorship Connection

- Create in `connections` collection
- Add to mentor's `mentors/{mentorId}.studentsHelped` (increment)
- Add achievement if `first_connection`

### 4. Study Streak Logic

```
If today has a study log:
  - streak continues
If yesterday has a study log:
  - increment currentStreak
  - update lastLogDate = today
If before yesterday, no log:
  - reset currentStreak = 0
  - update lastLogDate
```

---

## Summary

| Collection   | Purpose              | Owner | Access        |
| ------------ | -------------------- | ----- | ------------- |
| users        | User profiles        | Self  | Self + Public |
| mentors      | Mentor profiles      | Self  | Public        |
| connections  | Mentor-student links | Both  | Both          |
| studyLogs    | Learning records     | Self  | Self + Public |
| streaks      | Streak tracking      | Self  | Self          |
| catchUpPlans | Study plans          | Self  | Self          |
| roadmapTasks | Daily tasks          | Self  | Self          |
| achievements | Badges earned        | Self  | Self          |
| messages     | Chat history         | Both  | Both          |
