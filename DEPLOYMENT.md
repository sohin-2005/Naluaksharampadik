# 🚀 Deployment Guide for Naalu Aksharam Padikk

This guide will help you deploy your project to production using Firebase Hosting.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)
2. **Supabase Database**: Set up at [Supabase Dashboard](https://supabase.com/dashboard)
3. **Node.js**: Version 20.19+ or 22.12+
4. **Firebase CLI**: Install globally with `npm install -g firebase-tools`

## 🔧 Setup Steps

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project `nalu-aksharam-padik`
3. Enable the following services:
   - **Authentication**: Enable Email/Password sign-in method
   - **Hosting**: Will be enabled automatically during deployment

### 2. Supabase Database Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing
3. Open SQL Editor
4. Run the SQL script from `frontend/src/supabase-setup.sql`
5. This creates all necessary tables, indexes, and Row Level Security policies

### 3. Environment Variables

You need to set up environment variables in two places:

#### GitHub Secrets (for automated deployment)

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

**Firebase Configuration:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Supabase Configuration:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Firebase Service Account:**
- `FIREBASE_SERVICE_ACCOUNT`: JSON service account key (see below)

#### Local Environment (for manual deployment)

Create `.env` files:

**Frontend (`frontend/.env`):**
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`backend/.env`):**
```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=production
```

### 4. Get Firebase Service Account Key

This is needed for GitHub Actions to deploy:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Copy the entire JSON content
7. Add it as `FIREBASE_SERVICE_ACCOUNT` secret in GitHub

## 🚀 Deployment Methods

### Method 1: Automated Deployment (Recommended)

**GitHub Actions** will automatically deploy when you push to the `main` branch.

1. Ensure all GitHub secrets are configured
2. Push your changes to `main` branch:
   ```bash
   git push origin main
   ```
3. Go to GitHub Actions tab to monitor deployment
4. Once complete, your app will be live at: `https://nalu-aksharam-padik.web.app`

### Method 2: Manual Deployment

#### Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Login to Firebase

```bash
firebase login
```

#### Build the Frontend

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in `frontend/dist/`

#### Deploy to Firebase

From the root directory:

```bash
firebase deploy --only hosting
```

Your app will be deployed to: `https://nalu-aksharam-padik.web.app`

## 🖥️ Backend Deployment Options

The backend (Express server) needs to be deployed separately. You have several options:

### Option A: Firebase Functions (Recommended)

1. Create a `functions` directory in the root
2. Move backend code to functions
3. Deploy with: `firebase deploy --only functions`

### Option B: Cloud Run / App Engine

Deploy the backend as a containerized service or to Google App Engine.

### Option C: Heroku / Railway / Render

Deploy the Express backend to any Node.js hosting platform:

1. Connect your repository
2. Set environment variables
3. Deploy the `backend` directory

**Important:** Update the API endpoint in `frontend/src/config/api.ts` to point to your deployed backend URL.

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Frontend loads at Firebase Hosting URL
- [ ] Firebase Authentication works (sign up/login)
- [ ] Supabase database queries work
- [ ] Backend API is accessible (if deployed)
- [ ] All environment variables are set correctly
- [ ] CORS is configured for production URLs
- [ ] SSL/HTTPS is working

## 🔄 Updating Your Deployment

For automated updates:
1. Make changes to your code
2. Push to `main` branch
3. GitHub Actions will automatically rebuild and deploy

For manual updates:
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`
- Run `npm install` in frontend directory
- Check that all dependencies are in `package.json`

**Error:** Environment variables undefined
- Verify all `VITE_*` variables are set
- Check `.env` file exists and is properly formatted

### Deployment Fails

**Error:** `Permission denied`
- Run `firebase login` again
- Verify Firebase project ID in `.firebaserc`

**Error:** `No Firebase project selected`
- Run `firebase use nalu-aksharam-padik`

### Runtime Issues

**Error:** API calls fail
- Check backend is deployed and running
- Verify CORS configuration in backend
- Update API URL in frontend config

**Error:** Authentication doesn't work
- Verify Firebase Auth is enabled in console
- Check Firebase config variables are correct
- Ensure domain is authorized in Firebase console

## 📊 Monitoring

Monitor your deployment:

1. **Firebase Console**: Check hosting metrics, errors
2. **GitHub Actions**: View deployment logs
3. **Browser DevTools**: Check for console errors

## 🔐 Security Notes

- Never commit `.env` files to git
- Use GitHub Secrets for sensitive data
- Enable Firebase Security Rules
- Keep dependencies updated
- Monitor for vulnerabilities

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Firebase Console logs
4. Verify all environment variables
5. Test locally first with `npm run build && npm run preview`

---

**Your app will be live at:** `https://nalu-aksharam-padik.web.app`

Happy Deploying! 🎉
