# 🚀 Quick Deployment Reference

A concise guide for deploying Naalu Aksharam Padikk to Firebase.

---

## ⚡ Quick Start (3 Steps)

### 1. Configure Secrets
Add 9 secrets in GitHub → Settings → Secrets and variables → Actions:
- 6 Firebase config values (from Firebase Console)
- 2 Supabase values (from Supabase Dashboard)  
- 1 Firebase service account JSON (from Firebase Console)

📖 **Detailed instructions**: [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)

### 2. Push to Main
```bash
git push origin main
```

### 3. Done!
- Check GitHub Actions tab for deployment status
- App goes live at: `https://nalu-aksharam-padik.web.app`

---

## 🛠️ Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Setup environment
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your credentials

# 2. Run deployment script
./deploy.sh
```

**Requirements:**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`

---

## 📁 Project Structure

```
Naluaksharampadik/
├── frontend/           # React app (deploys to Firebase Hosting)
├── backend/            # Express API (deploy separately)
├── .github/workflows/  # Automated deployment config
├── deploy.sh          # Manual deployment script
├── firebase.json      # Firebase config
└── .firebaserc        # Firebase project ID
```

---

## 🔑 Required Secrets

| Secret | Where to Get It |
|--------|----------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web App Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings → Web App Config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → Web App Config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project Settings → Web App Config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings → Web App Config |
| `VITE_FIREBASE_APP_ID` | Firebase Console → Project Settings → Web App Config |
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public key |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Project Settings → Service Accounts → Generate Private Key |

---

## 🎯 Deployment Options

### Option 1: Automated (GitHub Actions) ✨ Recommended
- **Trigger**: Push to `main` branch or manual dispatch
- **Duration**: ~2-3 minutes
- **URL**: `https://nalu-aksharam-padik.web.app`

### Option 2: Manual (deploy.sh script)
- **Trigger**: Run `./deploy.sh` from project root
- **Duration**: ~1-2 minutes
- **Requirements**: Firebase CLI + local environment setup

### Option 3: Firebase CLI
```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

---

## 📋 Pre-Deployment Checklist

- [ ] All GitHub secrets configured
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] No TypeScript errors
- [ ] Firebase project exists: `nalu-aksharam-padik`
- [ ] Supabase database schema deployed
- [ ] Firebase Authentication enabled

📖 **Full checklist**: [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

---

## 🔄 Update Workflow

1. Make code changes
2. Test locally: `npm run dev`
3. Build to verify: `npm run build`
4. Commit changes: `git commit -m "Your message"`
5. Push to main: `git push origin main`
6. Wait for automated deployment (~2 mins)
7. Verify at: `https://nalu-aksharam-padik.web.app`

---

## 📊 Monitoring

### Check Deployment Status
- **GitHub**: Actions tab shows build/deploy progress
- **Firebase**: Hosting dashboard shows deployment history
- **Live**: Visit `https://nalu-aksharam-padik.web.app`

### View Logs
- **GitHub Actions**: Click on workflow run → View details
- **Firebase Console**: Hosting → View logs
- **Browser**: DevTools console for client-side errors

---

## 🐛 Common Issues

### Build Fails
```bash
cd frontend
npm install    # Reinstall dependencies
npm run build  # Try building again
```

### Authentication Fails
- Check Firebase secrets are correct
- Regenerate service account key
- Ensure no extra spaces in secret values

### Deploy Succeeds but App Broken
- Check browser console for errors
- Verify all environment variables set
- Check Firebase/Supabase configs

---

## 🔗 Useful Links

- **Production URL**: `https://nalu-aksharam-padik.web.app`
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com/)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **GitHub Actions**: [Actions Tab](https://github.com/sohin-2005/Naluaksharampadik/actions)

---

## 📚 Detailed Documentation

For comprehensive guides, see:

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) - How to configure secrets
- [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) - Pre-flight checks
- [README.md](./README.md) - Project overview

---

## 🆘 Need Help?

1. Review documentation files above
2. Check GitHub Actions logs for errors
3. Verify all secrets are configured
4. Test build locally: `cd frontend && npm run build`
5. Check Firebase Console for hosting status

---

**Happy Deploying! 🎉**

