import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// TODO: REPLACE WITH YOUR FIREBASE CONFIGURATION
// Get this from the Firebase Console -> Project Settings -> General
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (firebaseConfig.apiKey) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase API key is missing. Please check your .env file.");
}

export { auth, db, googleProvider };
