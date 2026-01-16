# 📋 Pre-Deployment Checklist

Use this checklist before deploying to production to ensure everything is configured correctly.

## 🔐 Environment Variables

### Frontend Environment Variables

- [ ] `VITE_FIREBASE_API_KEY` - Your Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., `project.firebaseapp.com`)
- [ ] `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Backend Environment Variables (if deploying backend)

- [ ] `GEMINI_API_KEY` - Your Google Gemini API key
- [ ] `PORT` - Server port (default: 5000)
- [ ] `NODE_ENV` - Set to `production`

### GitHub Secrets (for automated deployment)

- [ ] All frontend environment variables added as secrets
- [ ] `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- [ ] `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## 🔧 Firebase Configuration

- [ ] Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- [ ] Firebase Authentication enabled
- [ ] Email/Password sign-in method enabled
- [ ] Firebase Hosting enabled
- [ ] Authorized domains configured (if needed)
- [ ] `.firebaserc` file contains correct project ID: `nalu-aksharam-padik`
- [ ] `firebase.json` configured correctly

## 💾 Database Setup

- [ ] Supabase project created
- [ ] Database schema deployed (`frontend/src/supabase-setup.sql`)
- [ ] Row Level Security (RLS) policies enabled
- [ ] All tables created successfully:
  - [ ] `users`
  - [ ] `mentorship_connections`
  - [ ] `study_logs`
  - [ ] `catch_up_plans`
  - [ ] `community_posts`
  - [ ] `user_streaks`
  - [ ] `messages`
- [ ] Database connection string and keys obtained

## 🏗️ Build Verification

- [ ] Frontend builds successfully locally:
  ```bash
  cd frontend
  npm install
  npm run build
  ```
- [ ] No TypeScript errors
- [ ] No ESLint errors (or acceptable warnings only)
- [ ] Build output created in `frontend/dist/`
- [ ] Test build locally:
  ```bash
  npm run preview
  ```

## 📦 Dependencies

- [ ] All `package.json` dependencies are up to date
- [ ] No critical security vulnerabilities:
  ```bash
  npm audit
  ```
- [ ] `package-lock.json` committed to repository

## 🔒 Security

- [ ] `.env` files NOT committed to git
- [ ] `.gitignore` includes:
  - [ ] `.env`
  - [ ] `node_modules/`
  - [ ] `dist/` or `build/`
  - [ ] `.firebase/`
- [ ] No API keys or secrets in source code
- [ ] Firebase Security Rules configured (if using Firestore/Storage)
- [ ] Supabase RLS policies properly configured
- [ ] CORS configured in backend (if applicable)

## 🧪 Testing

- [ ] App works correctly in development mode
- [ ] Authentication flow tested (signup, login, logout)
- [ ] Database operations tested (create, read, update, delete)
- [ ] All major features tested:
  - [ ] Mentorship connections
  - [ ] Study logs
  - [ ] Catch-up plans
  - [ ] Community feed
  - [ ] User profiles
  - [ ] Messaging

## 🌐 Domain & Hosting

- [ ] Firebase Hosting configured in `firebase.json`
- [ ] Public directory set to `frontend/build` (or `frontend/dist`)
- [ ] Rewrites configured for SPA routing
- [ ] Custom domain configured (optional)
- [ ] SSL certificate configured (automatic with Firebase)

## 🔄 CI/CD Setup

- [ ] GitHub Actions workflow created (`.github/workflows/firebase-deploy.yml`)
- [ ] Workflow triggers on push to `main` branch
- [ ] All required GitHub secrets configured
- [ ] Manual workflow dispatch enabled (for on-demand deployments)

## 📱 Backend Deployment (if applicable)

- [ ] Backend deployment method chosen:
  - [ ] Firebase Functions
  - [ ] Cloud Run
  - [ ] Heroku/Railway/Render
  - [ ] Other: ___________
- [ ] Backend environment variables configured
- [ ] Backend URL updated in frontend config
- [ ] CORS configured for production domain
- [ ] API endpoints tested

## 📊 Monitoring & Analytics

- [ ] Firebase Console access verified
- [ ] Google Analytics configured (optional)
- [ ] Error monitoring set up (optional)
- [ ] Performance monitoring enabled (optional)

## 📚 Documentation

- [ ] `README.md` updated with deployment info
- [ ] `DEPLOYMENT.md` reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented (if applicable)
- [ ] Setup instructions clear and tested

## ✅ Final Checks

- [ ] All code changes committed and pushed
- [ ] Working branch merged to `main` (or deployment branch)
- [ ] Team members notified about deployment
- [ ] Rollback plan prepared (if needed)
- [ ] Post-deployment testing plan ready

## 🚀 Ready to Deploy!

Once all items are checked, you're ready to deploy:

### Automated Deployment (GitHub Actions)
```bash
git push origin main
```

### Manual Deployment
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## 📝 Post-Deployment Verification

After deployment, verify:

- [ ] Site loads at production URL: `https://nalu-aksharam-padik.web.app`
- [ ] No console errors in browser
- [ ] Authentication works
- [ ] Database queries work
- [ ] All pages load correctly
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable (Lighthouse score)

## 🆘 Rollback Plan

If something goes wrong:

1. Check Firebase Hosting versions in console
2. Roll back to previous version:
   ```bash
   firebase hosting:rollback
   ```
3. Or redeploy from last known good commit

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Build Version:** _________________

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________
