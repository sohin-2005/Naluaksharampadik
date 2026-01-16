# 🔐 GitHub Secrets Setup Guide

This guide will help you configure all the necessary GitHub secrets for automated deployment.

## Prerequisites

Before setting up GitHub secrets, ensure you have:

1. **Firebase Project**: Created at [Firebase Console](https://console.firebase.google.com/)
2. **Supabase Project**: Created at [Supabase Dashboard](https://supabase.com/dashboard)
3. **Admin Access**: To your GitHub repository settings

---

## 📍 Where to Add Secrets

1. Go to your GitHub repository: `https://github.com/sohin-2005/Naluaksharampadik`
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button

---

## 🔑 Required Secrets

### Firebase Configuration Secrets

These are obtained from your Firebase Console:

#### 1. Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nalu-aksharam-padik`
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. If you haven't added a web app, click **</>** (Web) and follow the prompts
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### 2. Add Each Value as a Secret

Add these secrets in GitHub:

| Secret Name | Value From | Example |
|------------|-----------|---------|
| `VITE_FIREBASE_API_KEY` | `apiKey` | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | `nalu-aksharam-padik.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | `nalu-aksharam-padik` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | `nalu-aksharam-padik.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `appId` | `1:123456789012:web:abc123def456` |

---

### Supabase Configuration Secrets

These are obtained from your Supabase Dashboard:

#### 1. Get Supabase Config Values

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API** in the settings menu
5. Find these values:

#### 2. Add Supabase Secrets

| Secret Name | Value From | Example |
|------------|-----------|---------|
| `VITE_SUPABASE_URL` | Project URL | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `anon` `public` key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

⚠️ **Use the `anon` / `public` key, NOT the `service_role` key!**

---

### Firebase Service Account Secret

This is needed for GitHub Actions to deploy to Firebase Hosting:

#### 1. Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nalu-aksharam-padik`
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Scroll down and click **Generate new private key**
6. Click **Generate key** in the confirmation dialog
7. A JSON file will be downloaded (keep it secure!)

#### 2. Add Service Account as Secret

1. Open the downloaded JSON file in a text editor
2. Copy the **entire JSON content** (all of it!)
3. In GitHub, create a new secret:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Paste the entire JSON content

Example JSON structure (yours will have real values):
```json
{
  "type": "service_account",
  "project_id": "nalu-aksharam-padik",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@nalu-aksharam-padik.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## ✅ Verify All Secrets Are Added

After adding all secrets, your GitHub Secrets page should show:

- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `FIREBASE_SERVICE_ACCOUNT`

Total: **9 secrets**

---

## 🚀 Test the Deployment

Once all secrets are configured:

1. Push changes to the `main` branch:
   ```bash
   git push origin main
   ```

2. Go to the **Actions** tab in your GitHub repository

3. You should see the **Deploy to Firebase** workflow running

4. Wait for it to complete (usually 2-3 minutes)

5. Your app will be live at: `https://nalu-aksharam-padik.web.app`

---

## 🐛 Troubleshooting

### Error: "Secret not found"

- **Solution**: Double-check the secret name matches exactly (case-sensitive)
- Ensure there are no extra spaces in the secret name

### Error: "Firebase authentication failed"

- **Solution**: Regenerate the Firebase service account key
- Make sure you copied the entire JSON content

### Error: "Invalid Firebase config"

- **Solution**: Verify each Firebase config value is correct
- Check for any extra quotes or spaces in the values

### Build succeeds but app doesn't work

- **Solution**: Check browser console for errors
- Verify environment variables are being used correctly
- Ensure Supabase URL and key are correct

---

## 🔒 Security Best Practices

1. **Never commit** the Firebase service account JSON file to git
2. **Never share** your secrets publicly
3. **Use separate** Firebase/Supabase projects for development and production
4. **Rotate keys** periodically for better security
5. **Limit permissions** on service accounts to only what's needed

---

## 📝 Optional: Local Development Secrets

For local development, create `.env` files:

**frontend/.env:**
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=nalu-aksharam-padik.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nalu-aksharam-padik
VITE_FIREBASE_STORAGE_BUCKET=nalu-aksharam-padik.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**backend/.env:**
```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

⚠️ **Remember**: `.env` files should never be committed to git (they're in `.gitignore`)

---

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)

---

**Need help?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide or [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

