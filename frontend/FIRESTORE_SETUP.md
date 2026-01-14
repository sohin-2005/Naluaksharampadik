# Firebase Firestore Setup Checklist

## Naalu Aksharam Padikk Implementation Checklist

---

## Phase 1: Firestore Collections Setup ✅

### Create Collections in Firebase Console

#### [ ] 1. `users` Collection

- Document ID: Use custom → `{USER_UID}`
- Fields:
  ```
  name: string
  email: string
  role: string ("junior" | "mentor")
  department: string
  year: number
  bio: string
  interests: array
  totalStudyHours: number
  currentStreak: number
  longestStreak: number
  profileImageUrl: string
  createdAt: timestamp
  updatedAt: timestamp
  ```

#### [ ] 2. `mentors` Collection

- Document ID: Autogenerate
- Fields:
  ```
  name: string
  email: string
  department: string
  year: number
  expertise: array
  rating: number
  ratingCount: number
  studentsHelped: number
  totalSessions: number
  responseTime: number
  status: string ("online" | "busy" | "offline")
  isVerified: boolean
  bio: string
  hourlyRate: number
  availableHours: array
  createdAt: timestamp
  updatedAt: timestamp
  ```

#### [ ] 3. `connections` Collection

- Document ID: Autogenerate
- Fields:
  ```
  mentorId: string (reference)
  studentId: string (reference)
  mentorName: string
  studentName: string
  status: string ("pending" | "connected" | "archived")
  initiatedBy: string ("student" | "mentor")
  lastMessage: string
  lastMessageAt: timestamp
  unreadCount: number
  rating: number
  feedback: string
  totalSessions: number
  createdAt: timestamp
  updatedAt: timestamp
  ```

#### [ ] 4. `studyLogs` Collection

- Document ID: Autogenerate
- Fields:
  ```
  userId: string (reference)
  subject: string
  topic: string
  description: string
  durationMinutes: number
  dateLogged: date
  createdAt: timestamp
  likes: number
  likedBy: array
  isPublic: boolean
  photoUrl: string
  difficulty: string ("easy" | "medium" | "hard")
  tags: array
  ```

#### [ ] 5. `streaks` Collection

- Document ID: Use custom → `{USER_UID}`
- Fields:
  ```
  userId: string
  currentStreak: number
  lastLogDate: date
  longestStreak: number
  streakStartDate: date
  totalLogsCount: number
  totalHours: number
  createdAt: timestamp
  updatedAt: timestamp
  ```

#### [ ] 6. `catchUpPlans` Collection

- Document ID: Autogenerate
- Fields:
  ```
  userId: string (reference)
  subject: string
  difficulty: string ("easy" | "medium" | "hard")
  examDate: date
  mentorId: string (optional)
  progressPercent: number
  status: string ("active" | "completed" | "abandoned")
  description: string
  totalDays: number
  completedDays: number
  createdAt: timestamp
  updatedAt: timestamp
  ```

#### [ ] 7. `roadmapTasks` Collection

- Document ID: Autogenerate
- Fields:
  ```
  planId: string (reference)
  dayNumber: number
  title: string
  description: string
  estimatedHours: number
  isCompleted: boolean
  completedAt: timestamp
  notes: string
  resources: array
  createdAt: timestamp
  updatedAt: timestamp
  ```

#### [ ] 8. `achievements` Collection

- Document ID: Autogenerate
- Fields:
  ```
  userId: string (reference)
  type: string
  earnedAt: timestamp
  data: object
  ```

---

## Phase 2: Create Indexes ✅

### Composite Indexes Required

#### [ ] Index 1: `users` Collection

- Field 1: `role` (Ascending)
- Field 2: `createdAt` (Descending)

#### [ ] Index 2: `mentors` Collection

- Field 1: `department` (Ascending)
- Field 2: `rating` (Descending)

#### [ ] Index 3: `connections` Collection

- Field 1: `studentId` (Ascending)
- Field 2: `updatedAt` (Descending)

#### [ ] Index 4: `connections` Collection

- Field 1: `mentorId` (Ascending)
- Field 2: `updatedAt` (Descending)

#### [ ] Index 5: `studyLogs` Collection

- Field 1: `userId` (Ascending)
- Field 2: `createdAt` (Descending)

#### [ ] Index 6: `studyLogs` Collection

- Field 1: `subject` (Ascending)
- Field 2: `createdAt` (Descending)

---

## Phase 3: Security Rules ✅

### [ ] Deploy Security Rules

Copy to Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if true; // Public profiles
      allow write: if request.auth.uid == userId;
    }

    // Mentors collection
    match /mentors/{mentorId} {
      allow read: if true; // Public mentors list
      allow write: if request.auth.uid == mentorId;
    }

    // Connections
    match /connections/{connectionId} {
      allow read: if request.auth.uid == resource.data.studentId
                     || request.auth.uid == resource.data.mentorId;
      allow write: if request.auth.uid == resource.data.studentId
                      || request.auth.uid == resource.data.mentorId;
    }

    // Study logs
    match /studyLogs/{logId} {
      allow read: if resource.data.userId == request.auth.uid
                     || resource.data.isPublic == true;
      allow create: if request.auth.uid == request.auth.uid;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Streaks
    match /streaks/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Catch-up plans
    match /catchUpPlans/{planId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Roadmap tasks
    match /roadmapTasks/{taskId} {
      allow read: if true;
      allow write: if true;
    }

    // Achievements
    match /achievements/{achievementId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == request.auth.uid;
    }

    // Messages (bonus)
    match /messages/{messageId} {
      allow read: if true;
      allow write: if request.auth.uid == request.auth.uid;
    }
  }
}
```

---

## Phase 4: Sample Data Population ✅

### [ ] Create Test User

**Using Firebase Console:**

1. Go to Authentication > Users
2. Create test user:
   - Email: `test@example.com`
   - Password: `Test@123456`
3. Note the User UID

**Create User Document:**

In Firestore Console > `users` > Add Document:

```
Document ID: {USER_UID}

name: "Test User"
email: "test@example.com"
role: "junior"
department: "Computer Science"
year: 2
bio: "Learning web development"
interests: ["Web Dev", "React", "Node.js"]
totalStudyHours: 0
currentStreak: 0
longestStreak: 0
profileImageUrl: ""
createdAt: 2026-01-14 (timestamp)
updatedAt: 2026-01-14 (timestamp)
```

### [ ] Create Streak Document

In Firestore Console > `streaks` > Add Document:

```
Document ID: {USER_UID}

userId: {USER_UID}
currentStreak: 0
lastLogDate: null
longestStreak: 0
streakStartDate: null
totalLogsCount: 0
totalHours: 0
createdAt: 2026-01-14
updatedAt: 2026-01-14
```

### [ ] Create Sample Study Logs (Optional)

In Firestore Console > `studyLogs` > Add Document:

**Log 1:**

```
userId: {USER_UID}
subject: "Data Structures"
topic: "Arrays and Linked Lists"
description: "Completed practice problems on arrays"
durationMinutes: 60
dateLogged: 2026-01-14
createdAt: 2026-01-14
likes: 0
likedBy: []
isPublic: true
difficulty: "medium"
tags: ["practice", "arrays"]
```

**Log 2:**

```
userId: {USER_UID}
subject: "Web Development"
topic: "React Hooks"
description: "Learned useState and useEffect"
durationMinutes: 45
dateLogged: 2026-01-14
createdAt: 2026-01-14
likes: 0
likedBy: []
isPublic: true
difficulty: "easy"
tags: ["learning", "react"]
```

### [ ] Create Sample Catch-up Plan

In Firestore Console > `catchUpPlans` > Add Document:

```
userId: {USER_UID}
subject: "Operating Systems"
difficulty: "medium"
examDate: 2026-03-15 (date)
progressPercent: 0
status: "active"
description: "Complete OS fundamentals course"
totalDays: 30
completedDays: 0
createdAt: 2026-01-14
updatedAt: 2026-01-14
```

Note: Get the Plan ID from the created document

### [ ] Create Sample Roadmap Tasks

In Firestore Console > `roadmapTasks` > Add Documents:

**Task 1:**

```
planId: {PLAN_ID}
dayNumber: 1
title: "Introduction to OS Concepts"
description: "Learn about processes, threads, and scheduling"
estimatedHours: 2
isCompleted: false
completedAt: null
notes: ""
resources: []
createdAt: 2026-01-14
updatedAt: 2026-01-14
```

**Task 2:**

```
planId: {PLAN_ID}
dayNumber: 2
title: "Memory Management"
description: "Study paging, segmentation, and virtual memory"
estimatedHours: 3
isCompleted: false
completedAt: null
notes: ""
resources: []
createdAt: 2026-01-14
updatedAt: 2026-01-14
```

---

## Phase 5: Testing ✅

### [ ] Test Dashboard Display

1. Open `http://localhost:8090/dashboard.html`
2. Sign in with test user credentials
3. Verify:
   - [ ] User name displays in navbar
   - [ ] Streak shows "0" (or actual count)
   - [ ] Study logs count shows "2"
   - [ ] Active plans count shows "1"
   - [ ] Catch-up plan card displays
   - [ ] Progress bar shows 0%
   - [ ] Roadmap tasks display

### [ ] Test Streak Logic

1. Create a new study log today
2. Verify streak updates to "1"
3. Wait for next day, create another log
4. Verify streak increments to "2"

### [ ] Test Empty States

1. Delete all catch-up plans
2. Verify empty state message displays
3. Delete all roadmap tasks
4. Verify empty state in roadmap section

### [ ] Test Task Completion

1. Click roadmap task checkbox
2. Verify visual state changes (✓ mark)
3. Check Firestore - `isCompleted` should be `true`

---

## Phase 6: Deployment ✅

### [ ] Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

### [ ] Environment Variables

- [ ] Verify `firebase-config.js` has correct project credentials
- [ ] All APIs enabled in Google Cloud Console

### [ ] Monitoring

- [ ] Set up Firebase Analytics
- [ ] Enable Firestore logs
- [ ] Create alerts for quota limits

---

## Quick Reference: Function Usage

### In Browser Console:

```javascript
// Get dashboard stats
const stats = await getDashboardStats(auth.currentUser.uid);
console.log(stats);

// Create study log
await createStudyLog(auth.currentUser.uid, {
  subject: "React",
  topic: "Hooks",
  description: "Learned useState",
  durationMinutes: 30,
  isPublic: true,
});

// Get user streak
const streak = await getStreakData(auth.currentUser.uid);
console.log(streak);

// Get catch-up plans
const plans = await getCatchUpPlans(auth.currentUser.uid);
console.log(plans);
```

---

## Troubleshooting

### Dashboard Shows "--" for all values

- [ ] Check if user document exists in `users` collection
- [ ] Verify User UID matches `auth.currentUser.uid`
- [ ] Check browser console for errors

### Streak Not Updating

- [ ] Verify study log has `createdAt` timestamp
- [ ] Check `streaks` document exists for user
- [ ] Verify `updateStudyStreak()` was called

### Empty State Shows Incorrectly

- [ ] Check Firestore query in console
- [ ] Verify `status: "active"` filter on catch-up plans
- [ ] Look for error messages in browser console

---

## Support Documents

- **firestore-schema.md** - Detailed collection structure
- **firestore-utils.js** - All utility functions with JSDoc
- **IMPLEMENTATION_GUIDE.md** - Complete implementation guide
- **dashboard.js** - Frontend integration code

---

## Timeline

- **Setup**: 30 minutes
- **Data Population**: 15 minutes
- **Testing**: 20 minutes
- **Deployment**: 15 minutes

**Total: ~1.5 hours**

---

**Last Updated:** January 14, 2026
**Status:** ✅ Complete - All systems ready for data integration
