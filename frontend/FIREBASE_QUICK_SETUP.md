# Firebase Firestore Quick Setup Guide

## Step 1: Go to Firebase Console

1. Open https://console.firebase.google.com
2. Select your project "Naalu Aksharam Padikk"
3. Go to **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select your region and click **Create**

---

## Step 2: Create Collections

Once Firestore is created, you need to create 8 collections. Follow these steps for EACH collection:

### **Collection 1: users**

1. Click **+ Start collection**
2. Enter collection ID: `users`
3. Click **Next**
4. Click **Auto ID** button
5. Add the following fields:

| Field           | Type      | Value            |
| --------------- | --------- | ---------------- |
| name            | String    | Test User        |
| email           | String    | test@example.com |
| year            | String    | 2nd Year         |
| department      | String    | Computer Science |
| totalStudyHours | Number    | 5220             |
| currentStreak   | Number    | 5                |
| role            | String    | student          |
| createdAt       | Timestamp | (current date)   |

6. Click **Save**

**Note:** Use your actual Firebase user UID as the document ID instead of "Auto ID"

---

### **Collection 2: mentors**

1. Click **+ Add collection**
2. Enter collection ID: `mentors`
3. Click **Next**
4. Click **Auto ID**
5. Add fields:

| Field          | Type      | Value                                                |
| -------------- | --------- | ---------------------------------------------------- |
| name           | String    | Arjun Krishnan                                       |
| year           | String    | Final Year                                           |
| department     | String    | Computer Science                                     |
| expertise      | Array     | ["Data Structures", "Algorithms", "Web Development"] |
| rating         | Number    | 4.8                                                  |
| status         | String    | online                                               |
| verified       | Boolean   | true                                                 |
| studentsHelped | Number    | 23                                                   |
| bio            | String    | Passionate about helping students                    |
| availableHours | Number    | 20                                                   |
| createdAt      | Timestamp | (current date)                                       |

6. Click **Save**

**Add 2-3 more mentors with different names and expertise**

---

### **Collection 3: connections**

1. Click **+ Add collection**
2. Enter collection ID: `connections`
3. Click **Next**
4. Click **Auto ID**
5. Add fields:

| Field       | Type      | Value                                 |
| ----------- | --------- | ------------------------------------- |
| mentorId    | String    | (mentor UID from mentors collection)  |
| studentId   | String    | (your user UID)                       |
| status      | String    | active                                |
| lastMessage | String    | Sure, I can help with that algorithm! |
| unreadCount | Number    | 2                                     |
| createdAt   | Timestamp | (current date)                        |

6. Click **Save**

---

### **Collection 4: studyLogs**

1. Click **+ Add collection**
2. Enter collection ID: `studyLogs`
3. Click **Next**
4. Click **Auto ID**
5. Add fields:

| Field       | Type      | Value                                                        |
| ----------- | --------- | ------------------------------------------------------------ |
| userId      | String    | (your user UID)                                              |
| subject     | String    | Data Structures                                              |
| topic       | String    | Binary Trees Implementation                                  |
| duration    | Number    | 90                                                           |
| description | String    | Completed binary tree implementation and practiced traversal |
| isPublic    | Boolean   | true                                                         |
| likes       | Number    | 12                                                           |
| createdAt   | Timestamp | 2026-01-14                                                   |

6. Click **Save**

**Add 2-3 more study logs with different subjects and dates**

---

### **Collection 5: streaks**

1. Click **+ Add collection**
2. Enter collection ID: `streaks`
3. Click **Next**
4. Use your user UID as document ID (click **Set document ID**)
5. Add fields:

| Field          | Type      | Value          |
| -------------- | --------- | -------------- |
| currentStreak  | Number    | 5              |
| longestStreak  | Number    | 12             |
| totalHours     | Number    | 5220           |
| lastLogDate    | Timestamp | 2026-01-14     |
| totalLogsCount | Number    | 45             |
| updatedAt      | Timestamp | (current date) |

6. Click **Save**

---

### **Collection 6: catchUpPlans**

1. Click **+ Add collection**
2. Enter collection ID: `catchUpPlans`
3. Click **Next**
4. Click **Auto ID**
5. Add fields:

| Field       | Type      | Value                                  |
| ----------- | --------- | -------------------------------------- |
| userId      | String    | (your user UID)                        |
| subject     | String    | Data Structures                        |
| examDate    | Timestamp | 2026-02-28                             |
| progress    | Number    | 85                                     |
| difficulty  | String    | medium                                 |
| status      | String    | active                                 |
| description | String    | Master all data structures before exam |
| createdAt   | Timestamp | (current date)                         |

6. Click **Save**

**Add 1-2 more plans with different subjects**

---

### **Collection 7: roadmapTasks**

1. Click **+ Add collection**
2. Enter collection ID: `roadmapTasks`
3. Click **Next**
4. Click **Auto ID**
5. Add fields:

| Field          | Type      | Value                                      |
| -------------- | --------- | ------------------------------------------ |
| planId         | String    | (catchUpPlan ID from above)                |
| dayNumber      | Number    | 1                                          |
| title          | String    | Arrays Fundamentals                        |
| description    | String    | Learn array operations and time complexity |
| estimatedHours | Number    | 4                                          |
| isCompleted    | Boolean   | false                                      |
| createdAt      | Timestamp | (current date)                             |

6. Click **Save**

**Add 5-10 more tasks with different dayNumbers (2-10)**

---

### **Collection 8: achievements**

1. Click **+ Add collection**
2. Enter collection ID: `achievements`
3. Click **Next**
4. Click **Auto ID**
5. Add fields:

| Field    | Type      | Value                  |
| -------- | --------- | ---------------------- |
| userId   | String    | (your user UID)        |
| type     | String    | 7-day-streak           |
| earnedAt | Timestamp | 2026-01-10             |
| data     | Map       | { progressValue: 100 } |

6. Click **Save**

**Add more achievements:**

- Type: `first-log`, earnedAt: (earlier date)
- Type: `100-hours`, earnedAt: (recent date)

---

## Step 3: Update Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Mentors are public readable
    match /mentors/{mentorId} {
      allow read: if true;
      allow write: if request.auth.uid == mentorId;
    }

    // Connections - read own, write for participants
    match /connections/{connectionId} {
      allow read: if request.auth.uid == resource.data.studentId || request.auth.uid == resource.data.mentorId;
      allow write: if request.auth.uid == resource.data.studentId;
    }

    // Study Logs - read if public or own, write own
    match /studyLogs/{logId} {
      allow read: if resource.data.isPublic == true || request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // Streaks - own only
    match /streaks/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Catch-up Plans - own only
    match /catchUpPlans/{planId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Roadmap Tasks - read if own plan, write if own plan
    match /roadmapTasks/{taskId} {
      allow read, write: if request.auth.uid == get(/databases/$(database)/documents/catchUpPlans/$(resource.data.planId)).data.userId;
    }

    // Achievements - own only
    match /achievements/{achievementId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **Publish**

---

## Step 4: Important - Use Your User UID

When creating documents, replace:

- `(your user UID)` with your actual Firebase Authentication UID

To find your UID:

1. Go to **Authentication** in Firebase Console
2. Click on your test user
3. Copy the **User UID** value
4. Use this in the `userId` and document ID fields

---

## Step 5: Test the Dashboard

1. Open your dashboard: http://localhost:8090/dashboard.html
2. Login with your test user
3. Check browser console (F12) for any errors
4. Navigate to different tabs:
   - **Mentorship** → Should show mentors list
   - **Study Log** → Should show your study logs and community feed
   - **Catch-Up** → Should show your plans and roadmap tasks
   - **Profile** → Should show your stats and achievements

---

## Troubleshooting

### Data Not Showing?

1. Check browser console (F12) for errors
2. Verify your user UID is used correctly in documents
3. Check Security Rules are published
4. Make sure documents have all required fields

### Collection Names Not Matching?

- Double-check spelling: `users`, `mentors`, `connections`, `studyLogs`, `streaks`, `catchUpPlans`, `roadmapTasks`, `achievements`
- Collection names are case-sensitive!

### Still Not Working?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload dashboard page
3. Check console logs for specific error messages
4. Verify Firestore is running (green checkmark in Firebase Console)

---

## Quick Reference: Required Fields by Collection

**users**: name, email, year, department, totalStudyHours, currentStreak
**mentors**: name, year, department, expertise (array), rating, status, verified
**connections**: mentorId, studentId, status, lastMessage, unreadCount
**studyLogs**: userId, subject, topic, duration, isPublic, likes, createdAt
**streaks**: currentStreak, longestStreak, totalHours, lastLogDate, totalLogsCount
**catchUpPlans**: userId, subject, examDate, progress, status
**roadmapTasks**: planId, dayNumber, title, estimatedHours, isCompleted
**achievements**: userId, type, earnedAt

---

## Next Steps

Once data is showing:

1. Add more sample data for realistic testing
2. Create additional test users
3. Test different scenarios (no data, lots of data, etc.)
4. Deploy to Firebase Hosting when ready
