# Dashboard Implementation Guide

## Quick Start

### File Overview

| File                 | Purpose        | Key Content                           |
| -------------------- | -------------- | ------------------------------------- |
| `dashboard.html`     | Page structure | Navbar, cards, tabs, plans, roadmap   |
| `dashboard.css`      | All styling    | CSS variables, responsive breakpoints |
| `dashboard.js`       | Logic & auth   | Firebase integration, event handlers  |
| `firebase-config.js` | Config         | Firebase initialization               |

### Key Components

#### 1. Top Navigation Bar

```html
<nav class="navbar">
  <div class="navbar-left">Logo + Tagline</div>
  <div class="navbar-right">User Name + Logout Button</div>
</nav>
```

**Features:**

- Fixed position (always visible)
- Glassmorphic effect with backdrop blur
- Responsive stacking on mobile
- User name pulled from Firebase Auth (`displayName` or email prefix)

#### 2. Summary Cards (3-column grid)

- **Active Mentors** - Primary blue accent
- **Study Logs Today** - Green accent with upward trend arrow
- **Catch-Up Plans** - Warning/amber accent

**Responsive:** Stacks to 1 column on mobile

#### 3. Tab Navigation

4 pill-style tabs (Mentorship, Study Log, **Catch-Up** active, Profile)

- Click handlers in `dashboard.js`
- Active tab has background highlight + bottom indicator

#### 4. Study Plan Cards

Two example plans shown (Operating Systems, Data Structures)

- Subject name + difficulty badge
- Exam date + days countdown
- Mentor assignment
- Progress bar with percentage
- Action buttons (primary + secondary style)

#### 5. Roadmap Checklist

5 daily milestones with two states:

- **Completed** items: Green circle ✓ + strikethrough text
- **Pending** items: Gray circle + normal text

---

## Authentication Flow

```
User visits dashboard.html
        ↓
JavaScript loads Firebase SDK
        ↓
onAuthStateChanged() checks login status
        ↓
┌─────────────────────────────────────┐
│ If user is logged in:               │
│ - Display user name in navbar       │
│ - Load dashboard content            │
│ - Initialize event handlers         │
└─────────────────────────────────────┘
        OR
┌─────────────────────────────────────┐
│ If user is NOT logged in:           │
│ - Redirect to login.html            │
└─────────────────────────────────────┘
```

### Logout Flow

```
User clicks logout button
        ↓
handleLogout() called
        ↓
Firebase signOut(auth)
        ↓
Redirect to login.html
```

---

## CSS Architecture

### Variable System

All colors, shadows, and spacing use CSS variables for easy theming:

```css
:root {
  --color-primary: #6366f1; /* Indigo */
  --color-secondary: #ec4899; /* Pink */
  --color-success: #10b981; /* Green */
  --color-warning: #f59e0b; /* Amber */

  --shadow-sm: 0 1px 2px...;
  --shadow-md: 0 4px 6px...;
  --shadow-lg: 0 10px 15px...;

  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
}
```

### Grid & Flexbox

- **Summary cards:** 3-column CSS Grid (auto-fit, minmax)
- **Navbar:** Flex with space-between
- **Roadmap items:** Flex column with gap

### Responsive Breakpoints

```css
/* Tablet & below (768px) */
@media (max-width: 768px) {
  /* Adjust layouts */
}

/* Mobile (480px) */
@media (max-width: 480px) {
  /* Further adjustments */
}
```

---

## JavaScript Event Handlers

### Authentication

```javascript
// Auto-check login status
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Initialize dashboard for user
  } else {
    // Redirect to login
  }
});
```

### Logout Button

```javascript
document.getElementById("logoutBtn").addEventListener("click", handleLogout);

async function handleLogout() {
  await signOut(auth);
  window.location.href = "login.html";
}
```

### Tab Navigation

```javascript
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active from all
    // Add active to clicked
  });
});
```

### Action Buttons

```javascript
document.querySelectorAll(".action-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    // Determine if primary or secondary
    // Get plan subject
    // Handle accordingly
  });
});
```

---

## Customization Guide

### Change Color Scheme

Edit `:root` variables in `dashboard.css`:

```css
:root {
  --color-primary: #YOUR_COLOR;
  --color-success: #YOUR_COLOR;
  /* etc */
}
```

### Add New Metric Card

1. Copy a `.card` element in HTML
2. Add unique class (e.g., `.card-engagement`)
3. Set border-left color in CSS
4. Update color variable if needed

### Modify Spacing

All spacing uses `--spacing-*` variables. Change one value to update everywhere:

```css
--spacing-lg: 20px; /* Changed from 16px */
```

### Update Difficulty Badge Colors

```css
.difficulty-badge.easy {
  background: #YOUR_COLOR;
}
.difficulty-badge.medium {
  background: #YOUR_COLOR;
}
.difficulty-badge.hard {
  background: #YOUR_COLOR;
}
```

---

## Future: Dynamic Content

### Load Plans from Firestore

```javascript
async function loadCatchUpPlans(userId) {
  const plansRef = collection(db, "users", userId, "plans");
  const snapshot = await getDocs(plansRef);

  snapshot.forEach((doc) => {
    const plan = doc.data();
    // Create card element with plan data
    // Append to catch-up-section
  });
}
```

### Load Roadmap from Firestore

```javascript
async function loadRoadmapItems(userId) {
  const roadmapRef = collection(db, "users", userId, "roadmap");
  const snapshot = await getDocs(roadmapRef);

  snapshot.forEach((doc) => {
    const item = doc.data();
    // Create roadmap-item element
    // Set completed/pending class
    // Append to roadmap-list
  });
}
```

### Real-time Updates

```javascript
// Listen to plan changes in real-time
onSnapshot(collection(db, "users", userId, "plans"), (snapshot) => {
  // Update UI when plans change
});
```

---

## Performance Tips

1. **Use CSS Variables** - Reduces CSS file size
2. **Lazy Load Images** - Use `loading="lazy"` for images
3. **Intersection Observer** - Efficient scroll animations (already implemented)
4. **Throttle Scroll Events** - Don't run handlers on every scroll pixel
5. **Minimize Reflows** - Batch DOM updates

---

## Testing Checklist

- [ ] Login redirects to dashboard
- [ ] User name displays in navbar
- [ ] Logout button redirects to login
- [ ] Cards display with correct colors
- [ ] Tabs can be clicked (active state changes)
- [ ] Action buttons are clickable
- [ ] Responsive design works (test at 768px and 480px)
- [ ] Animations play smoothly
- [ ] No console errors
- [ ] Mobile navigation is accessible

---

## Accessibility Features

- **Semantic HTML** - `<nav>`, `<main>`, `<section>`, `<footer>`
- **Button Elements** - Used instead of `<div>` for clickables
- **Keyboard Navigation** - Tab through buttons
- **Color Contrast** - WCAG AA compliant
- **Font Sizes** - Readable at all breakpoints
- **Labels & Context** - Clear naming for all UI elements

---

## Common Issues & Solutions

### Issue: User name shows "Loading..."

**Cause:** Auth state not initialized yet
**Solution:** Wait for `onAuthStateChanged` to fire

### Issue: Styles not applying

**Cause:** CSS variables not defined
**Solution:** Check `:root` in `dashboard.css`

### Issue: Logout doesn't work

**Cause:** Firebase error
**Solution:** Check browser console for error message

### Issue: Responsive layout broken

**Cause:** CSS Grid/Flex not wrapping
**Solution:** Check media queries at 768px and 480px

---

## File Size Optimization

- **dashboard.css:** ~8KB (with formatting)
- **dashboard.js:** ~6KB (with comments)
- **dashboard.html:** ~4KB
- **Total:** ~18KB (before Firebase SDK)

---

## Browser DevTools Tips

### Check Responsive Design

1. Press `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows)
2. Set to Mobile (375px) and Tablet (768px)
3. Verify layout adjustments

### Debug Authentication

In browser console:

```javascript
// Check current user
firebase.auth().currentUser;
// Get user claims
await firebase.auth().currentUser.getIdTokenResult();
```

### Verify Firestore Operations

In Firebase Console:

- Go to Firestore Database
- Check `/users/{userId}` collection
- Verify lastLogin timestamp updates

---

## Version History

| Version | Date     | Changes                                      |
| ------- | -------- | -------------------------------------------- |
| 2.0.0   | Jan 2026 | Modern redesign with new component structure |
| 1.0.0   | Dec 2025 | Initial dashboard release                    |

---

**For detailed documentation, see DASHBOARD_README.md**
