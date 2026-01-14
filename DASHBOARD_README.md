# Student Dashboard - Naalu Aksharam Padikk

A modern, production-grade student dashboard for the Naalu Aksharam Padikk mentorship platform. Built with vanilla HTML, CSS, and JavaScript with Firebase authentication integration.

## Features

### 🔐 Authentication & User Management

- **Firebase Authentication** - Secure email/password sign-in
- **Auth State Management** - Automatically redirects unauthenticated users to login
- **User Identity Display** - Shows logged-in user's name in the navbar
- **Logout Functionality** - Secure logout with redirect to login page

### 📊 Dashboard Metrics

Three responsive metric cards displaying:

- **Active Mentors** - Number of available mentors (247)
- **Study Logs Today** - Daily study engagement with upward trend indicator (1,834)
- **Catch-Up Plans** - Active personalized study roadmaps (563)

### 🧭 Navigation

- **Fixed Navbar** - Always-visible header with logo, tagline, and user controls
- **Pill-Style Tabs** - Four navigation tabs: Mentorship, Study Log, Catch-Up (active), Profile
- **Smooth Interactions** - Hover effects, transitions, and visual feedback

### 📚 Catch-Up Plans Section

- **Study Plan Cards** - Display for multiple subjects with:
  - Subject name
  - Difficulty badge (Easy/Medium/Hard)
  - Exam date and days remaining counter
  - Assigned mentor name
  - Visual progress bar with percentage
  - Action buttons (Continue Learning, View Details)

### 🗺️ Roadmap to Success

- **Checklist Items** - Daily milestones with two states:
  - ✅ **Completed** - Green checkmark with strikethrough text
  - ⭕ **Pending** - Empty circle with normal text
- **Progress Tracking** - Visual indication of completion status
- **Timeline Display** - Completion dates and upcoming milestones

## Technical Stack

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, Grid, Flexbox
- **JavaScript ES6+** - Event handling, DOM manipulation, async operations

### Backend

- **Firebase Authentication** - User sign-in/sign-out
- **Firestore** - User data persistence and real-time updates
- **Firebase Analytics** - Usage tracking

### Architecture

- **Modular Design** - Separate files for HTML, CSS, and JavaScript
- **ES6 Modules** - Clean dependency management with Firebase imports
- **Responsive Layout** - Mobile-first design with breakpoints at 768px and 480px
- **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation support

## File Structure

```
frontend/
├── dashboard.html          # Main dashboard page
├── dashboard.css           # Dashboard styles with CSS variables
├── dashboard.js            # Dashboard logic & authentication
├── firebase-config.js      # Firebase initialization & exports
├── login.html             # Login page
├── register.html          # Registration page
├── index.html             # Landing page
├── style.css              # Global styles
└── script.js              # Global scripts
```

## Installation & Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project with Authentication and Firestore enabled
- HTTP server for local development

### Firebase Configuration

Update `firebase-config.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

### Running Locally

1. **Start HTTP Server**

   ```bash
   cd frontend
   python3 -m http.server 8089
   ```

2. **Open in Browser**

   - Navigate to `http://localhost:8089/dashboard.html`
   - You'll be redirected to login if not authenticated

3. **Login/Register**
   - Use existing credentials or create a new account
   - Upon successful login, the dashboard loads automatically

## Component Documentation

### Navbar

**File:** `dashboard.html` (lines 14-35), `dashboard.css` (lines 44-95)

- Fixed positioning with glassmorphism effect
- Left side: Logo + tagline
- Right side: User name + logout button
- Responsive stacking on mobile (≤768px)

**Key Features:**

- Blur backdrop effect
- Soft box shadow
- Responsive flex layout
- Smooth logout transition

### Summary Cards

**File:** `dashboard.html` (lines 56-85), `dashboard.css` (lines 202-258)

- 3-column responsive grid
- Left border accent in different colors
- Hover animation (lift effect)
- Trend indicator with bounce animation

**CSS Variables:**

- `--color-primary` for Mentors
- `--color-success` for Study Logs
- `--color-warning` for Catch-Up Plans

### Tab Navigation

**File:** `dashboard.html` (lines 87-95), `dashboard.css` (lines 260-295)

- Pill-style button group
- Active state highlighting
- Smooth hover transitions
- Bottom indicator bar animation

**Interaction:** `dashboard.js` (lines 75-88)

### Catch-Up Plans Section

**File:** `dashboard.html` (lines 97-175), `dashboard.css` (lines 313-466)

- Gradient background for visual hierarchy
- Study plan cards with complete metadata
- Dynamic progress bar with linear gradient
- Responsive two-column meta layout

**Features:**

- Difficulty badges with color coding
- Floating rocket icon animation
- Hover shadow effects
- Mobile-optimized action buttons

### Roadmap Section

**File:** `dashboard.html` (lines 177-225), `dashboard.css` (lines 468-540)

- Completed items with green checkmarks
- Pending items with empty circles
- Subtle background color differentiation
- Strikethrough text for completed tasks

## Responsive Design Breakpoints

| Breakpoint | Device           | Changes                                            |
| ---------- | ---------------- | -------------------------------------------------- |
| Default    | Desktop (>768px) | Full layout with 3-column cards                    |
| 768px      | Tablet           | Navbar flex direction changes, single-column cards |
| 480px      | Mobile           | Reduced font sizes, vertical action buttons        |

## JavaScript Functionality

### Authentication Module

```javascript
initializeAuthState(); // Checks user login status
handleLogout(); // Secure Firebase logout
```

### UI Initialization

```javascript
initializeDashboard(user); // Load user-specific content
initializeTabNavigation(); // Setup tab click handlers
initializeButtonHandlers(); // Setup action buttons
initializeScrollAnimations(); // Setup scroll-triggered animations
```

### Utility Functions

```javascript
formatDate(date); // Format dates to readable string
calculateDaysRemaining(date); // Calculate exam countdown
```

## Future Enhancements

### Planned Features

1. **Dynamic Data Loading** - Fetch actual user data from Firestore
2. **Tab Content** - Load different content based on active tab
3. **Real-time Updates** - Listen to Firestore document changes
4. **Edit Profile** - Update user information
5. **Progress Charts** - Visual analytics of study progress
6. **Mentor Messaging** - In-app messaging with mentors
7. **Study Session Timer** - Pomodoro timer integration
8. **Notifications** - Push notifications for deadlines

### Implementation Hooks

- `loadCatchUpPlans(userId)` - Fetch user's plans from Firestore
- `loadRoadmapItems(userId)` - Fetch user's roadmap from Firestore
- `loadTabContent(tabName)` - Load content for specific tabs

## Styling System

### CSS Variables

The dashboard uses comprehensive CSS variables for maintainability:

```css
--color-primary: #6366f1
--color-secondary: #ec4899
--color-success: #10b981
--color-warning: #f59e0b
--color-danger: #ef4444

--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

--radius-sm: 6px
--radius-md: 12px
--radius-lg: 16px

--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
```

### Animations

- **Bounce** - Trend indicator animation (2s loop)
- **Float** - Rocket icon animation (3s ease-in-out)
- **Slide & Fade** - Scroll-triggered element animations

## Error Handling

The dashboard includes comprehensive error handling:

```javascript
// Authentication errors
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = 'login.html';
});

// Firestore operation errors
try {
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
} catch (error) {
    console.warn('Firestore update failed:', error);
    // Continue gracefully - don't block user experience
}

// Global error handlers
window.addEventListener('error', (event) => { ... });
window.addEventListener('unhandledrejection', (event) => { ... });
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 12+, Chrome Mobile)

## Performance Optimizations

1. **CSS Variables** - Reduce code duplication
2. **Intersection Observer** - Efficient scroll animations
3. **Lazy Loading** - Firebase modules loaded on demand
4. **Event Delegation** - Single listener for multiple buttons
5. **Hardware Acceleration** - GPU-accelerated transforms and animations

## Security Considerations

1. **Firebase Rules** - Ensure Firestore rules restrict access to user's own data
2. **Environment Variables** - Store API keys in environment (not in code for production)
3. **HTTPS Only** - Always use HTTPS in production
4. **XSS Prevention** - Input sanitization for user-generated content
5. **CSRF Protection** - Firebase handles this automatically

### Recommended Firestore Rules

```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  allow read: if request.auth != null; // For mentor discovery
}
```

## Troubleshooting

### "Redirects to login page"

- **Cause:** Not authenticated or token expired
- **Solution:** Login with valid credentials

### "Address already in use"

- **Cause:** Port 8089 is occupied
- **Solution:** Kill process or use different port: `python3 -m http.server 8090`

### "CORS errors"

- **Cause:** Loading from different origin
- **Solution:** Ensure serving via HTTP server, not file://

### "Firestore permission denied"

- **Cause:** Firebase rules don't allow operation
- **Solution:** Check and update Firestore security rules

## Contributing

To add new dashboard features:

1. **Update HTML** - Add new sections in `dashboard.html`
2. **Add CSS** - Style in `dashboard.css` using existing variables
3. **Implement JS** - Add handlers in `dashboard.js`
4. **Test** - Verify in multiple browsers and devices
5. **Document** - Update this README with new features

## License

© 2026 Naalu Aksharam Padikk. All rights reserved.

---

**Last Updated:** January 2026
**Version:** 2.0.0
