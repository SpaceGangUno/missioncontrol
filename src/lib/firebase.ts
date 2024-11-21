import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Validate required config values
const requiredFields = ['apiKey', 'authDomain', 'projectId'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required Firebase config fields: ${missingFields.join(', ')}`);
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw new Error('Failed to initialize Firebase');
  }
} else {
  app = getApps()[0];
  console.log('Using existing Firebase instance');
}

// Initialize Auth and Firestore
let auth: Auth;
let db: Firestore;

try {
  auth = getAuth(app);
  db = getFirestore(app);

  // Log initialization status
  console.log('Firebase services initialized:', {
    auth: auth ? '✓' : '✗',
    db: db ? '✓' : '✗'
  });
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  throw new Error('Failed to initialize Firebase services');
}

if (!auth || !db) {
  throw new Error('Firebase services not properly initialized');
}

export { auth, db };
