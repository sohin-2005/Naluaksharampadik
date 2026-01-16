# 🎓 Naalu Aksharam Padikk

**Connect. Learn. Grow Together.**

A mentorship and accountability platform connecting students for academic success. Solve the "guidance disconnect" with verified mentorship, social accountability through study logs, and smart catch-up plans.

[![Deploy to Firebase](https://img.shields.io/badge/Deploy-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)](https://vitejs.dev)

---

## 🚀 Quick Deploy

Deploy your project to production in 3 simple steps:

### Option 1: Automated Deployment (Recommended)

1. **Configure GitHub Secrets**: Add all required environment variables as GitHub secrets
2. **Push to main**: `git push origin main`
3. **Done!** GitHub Actions will automatically build and deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Option 2: Manual Deployment

```bash
# 1. Setup environment variables
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Firebase & Supabase credentials

# 2. Run deployment script
./deploy.sh

# Your app will be live at: https://nalu-aksharam-padik.web.app
```

---

## 📋 Features

### ✅ Verified Mentorship Network
- Connect with seniors by department and expertise
- Search and filter mentors
- Direct messaging
- Rating system

### ✅ Social Accountability System
- Daily study logs
- Consistency streaks
- Community feed
- Positive peer pressure (no toxic competition)

### ✅ Smart Catch-Up Plans
- Time-optimized roadmaps
- Senior-approved plans
- Progress tracking
- Deadline management

### ✅ User Roles
- **Students**: Seek guidance, log studies, build streaks
- **Mentors**: Help juniors, approve plans, share knowledge
- **Alumni**: Share experience, guide career paths

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS + Radix UI
- React Router v7

**Backend:**
- Node.js + Express
- Google Gemini AI (SemSense feature)

**Services:**
- Firebase (Authentication + Hosting)
- Supabase (PostgreSQL Database)

---

## 💻 Local Development

### Prerequisites

- Node.js 20.19+ or 22.12+
- Firebase account
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sohin-2005/Naluaksharampadik.git
   cd Naluaksharampadik
   ```

2. **Setup Supabase Database**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Open SQL Editor
   - Run the SQL from `frontend/src/supabase-setup.sql`

3. **Configure Environment Variables**
   ```bash
   # Frontend
   cd frontend
   cp .env.example .env
   # Edit .env with your credentials
   
   # Backend
   cd ../backend
   cp .env.example .env
   # Add your Gemini API key
   ```

4. **Install Dependencies & Run**
   
   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Opens at http://localhost:5173
   ```
   
   **Backend (optional):**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs at http://localhost:5000
   ```

---

## 📁 Project Structure

```
Naluaksharampadik/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── config/        # Firebase & Supabase config
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Express backend (SemSense AI)
│   ├── server.js          # Main server file
│   └── package.json
│
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
│       └── firebase-deploy.yml
│
├── firebase.json          # Firebase configuration
├── .firebaserc            # Firebase project settings
├── deploy.sh              # Deployment script
├── DEPLOYMENT.md          # Detailed deployment guide
└── PRE_DEPLOYMENT_CHECKLIST.md  # Pre-deploy checklist
```

---

## 🚀 Deployment

This project uses **Firebase Hosting** for the frontend and includes automated deployment via **GitHub Actions**.

### Automated Deployment

Every push to `main` branch automatically triggers deployment:

1. Builds the React app
2. Deploys to Firebase Hosting
3. App goes live at: `https://nalu-aksharam-padik.web.app`

### Manual Deployment

```bash
# Quick deploy
./deploy.sh

# Or manually
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

### Required GitHub Secrets

Configure these in GitHub repository settings → Secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `FIREBASE_SERVICE_ACCOUNT` (JSON key)

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 📝 Environment Variables

### Frontend (`frontend/.env`)

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

### Backend (`backend/.env`)

```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

---

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run lint        # Run ESLint
npm run build       # Test production build
npm run preview     # Preview production build
```

---

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Firebase Authentication with secure token handling
- Environment variables for sensitive data
- Protected routes for authenticated users only
- `.env` files excluded from git

---

## 📊 Database Schema

### Core Tables

- **users**: User profiles with authentication details
- **mentorship_connections**: Mentor-mentee relationships
- **study_logs**: Daily study accountability tracking
- **catch_up_plans**: Personalized recovery roadmaps
- **community_posts**: Social feed for sharing progress
- **user_streaks**: Gamification and motivation
- **messages**: Direct messaging between users

See `frontend/src/supabase-setup.sql` for complete schema.

---

## 🤝 Contributing

This is a student project aimed at solving real academic challenges.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Built with ❤️ for students, by students.

---

## 🆘 Support & Troubleshooting

### Common Issues

**Build Fails:**
- Verify all environment variables are set
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (20.19+ or 22.12+ required)

**Deployment Fails:**
- Verify Firebase project ID in `.firebaserc`
- Check GitHub secrets are configured
- Ensure Firebase CLI is authenticated: `firebase login`

**Authentication Issues:**
- Verify Firebase Auth is enabled in console
- Check Firebase config in `.env`
- Ensure authorized domains include your deployment URL

### Getting Help

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides
2. Review [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
3. Check GitHub Actions logs for deployment errors
4. Verify Firebase Console for hosting status

---

## 🌐 Live Demo

**Production URL:** `https://nalu-aksharam-padik.web.app`

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Pre-Deployment Checklist](./PRE_DEPLOYMENT_CHECKLIST.md) - Ensure you're ready to deploy
- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Backend README](./backend/README.md) - Backend API documentation

---

**Let's build a supportive academic community together! 🎓✨**

