// Firebase Configuration
// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase Configuration - Update with your project credentials
const firebaseConfig = {
    apiKey: "AIzaSyC_9en-PEY9M9qWexgH9iHUKmpJCCbgOUk",
    authDomain: "nalu-aksharam-padik.firebaseapp.com",
    projectId: "nalu-aksharam-padik",
    storageBucket: "nalu-aksharam-padik.firebasestorage.app",
    messagingSenderId: "805693800610",
    appId: "1:805693800610:web:b58a792844f4af070657fb",
    measurementId: "G-DC9F3R71RN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export services for use in other files
export { app, auth, db, analytics };
