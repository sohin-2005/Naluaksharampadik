# Firebase Auto-Setup Guide

## Quick Start (5 Minutes)

### Step 1: Login to Your App

1. Open your dashboard: `http://localhost:8090/dashboard.html`
2. **Sign up or login** with your email
3. Your user ID will be saved automatically

### Step 2: Run Firebase Setup

1. Open: `http://localhost:8090/setup-firebase.html`
2. Click **"Initialize Firebase Now"** button
3. Wait 10-15 seconds for completion
4. See ✅ **Success message**

### Step 3: Verify in Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project → **Firestore Database**
3. You should see these collections:
   - ✅ users
   - ✅ mentors
   - ✅ connections
   - ✅ studyLogs
   - ✅ streaks
   - ✅ catchUpPlans
   - ✅ roadmapTasks
   - ✅ achievements

### Step 4: View Your Dashboard

1. Go back to dashboard: `http://localhost:8090/dashboard.html`
2. Click **Refresh** (Ctrl+R or Cmd+R)
3. Check each tab:
   - ✅ **Mentorship** → Shows 4 mentors
   - ✅ **Study Log** → Shows your 5 study logs
   - ✅ **Catch-Up** → Shows your 3 plans
   - ✅ **Profile** → Shows your stats

---

## What Gets Created

### Collections

| Collection   | Documents | Purpose               |
| ------------ | --------- | --------------------- |
| users        | 1         | Your profile info     |
| mentors      | 4         | Mentor profiles       |
| studyLogs    | 5         | Your study records    |
| streaks      | 1         | Your streak tracking  |
| catchUpPlans | 3         | Your exam plans       |
| roadmapTasks | 10        | Daily tasks for plans |
| connections  | 2         | Your mentor links     |
| achievements | 3         | Your earned badges    |

### Sample Data Included

- **Mentors**: Arjun (CS), Priya (Electronics), Rahul (Mechanical), Sneha (Web)
- **Study Logs**: Data Structures, Electronics, Web Dev, Algorithms, Databases
- **Plans**: Data Structures (85% done), Web Dev (62% done), Database Systems (45% done)
- **Streaks**: 5 day current streak, 12 day longest streak
- **Achievements**: 7-day streak, first log, helpful mentor

---

## Troubleshooting

### ❌ Button Click Does Nothing

**Solution:**

1. Open Browser Console: F12 → Console tab
2. Check for error messages
3. Make sure you're logged in first

### ❌ Firebase Collections Not Appearing

**Solution:**

1. Clear browser cache: Ctrl+Shift+Delete
2. Refresh Firebase Console (F5)
3. Check Firestore Rules are in "Test Mode"
4. Wait 30 seconds for data to sync

### ❌ Dashboard Still Shows Empty

**Solution:**

1. Refresh dashboard page: Ctrl+R
2. Clear browser console (Ctrl+K)
3. Check if you're logged in (top right)
4. Wait for data to load (max 5 seconds)

### ❌ Error: "User not found"

**Solution:**

1. Make sure you're logged in first
2. Login page should redirect you to login
3. Create an account if you don't have one

---

## Manual Setup (Alternative)

If auto-setup fails, follow [FIREBASE_QUICK_SETUP.md](FIREBASE_QUICK_SETUP.md) to manually create collections in Firebase Console.

---

## Important Notes

✅ **Safe to Run Multiple Times**: The script uses `addDoc()` which creates new documents, so running it multiple times just adds more data (no overwrite)

✅ **Sample Data is Real**: All data uses real Firestore timestamps and formats

✅ **Security**: Uses your authenticated user ID automatically

✅ **No Credit Card Needed**: Firestore free tier covers this sample data

---

## Next Steps

After successful initialization:

1. **Customize Your Profile**

   - Edit your name and department
   - Add profile picture
   - Update interests

2. **Add More Study Logs**

   - Click "Add Log" on Study Log tab
   - Log today's study session

3. **Create More Plans**

   - Click "Create Plan" on Catch-Up tab
   - Set your exam dates

4. **Connect with Mentors**
   - Search mentors on Mentorship tab
   - Send connection requests

---

## Console Output

When you click "Initialize Firebase", check Console (F12) for:

```
✅ Created 4 mentors
✅ Created user profile for: [your-user-id]
✅ Created 5 study logs
✅ Created streak data
✅ Created 3 catch-up plans
✅ Created 10 roadmap tasks
✅ Created 2 connections
✅ Created 3 achievements
✅ Firebase data initialization complete!
```

If you see this, everything worked! 🎉

---

## Need Help?

1. **Check Console**: F12 → Console tab for error messages
2. **Verify Login**: Top right should show your name
3. **Check Firebase Status**: Console.firebase.google.com → Health check
4. **Try Again**: Refresh page and click button again

---

**Estimated Time**: 5 minutes total
**Status**: ✅ Ready to use
**Last Updated**: January 14, 2026
