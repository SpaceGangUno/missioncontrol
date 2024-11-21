import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

let app: FirebaseApp;
let auth;
let db;

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
  };

  // Initialize Firebase only if it hasn't been initialized yet
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase instance');
  }

  // Initialize Auth and Firestore
  auth = getAuth(app);
  db = getFirestore(app);

  // Connect to emulators in development
  if (import.meta.env.DEV) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firebase emulators');
    } catch (error) {
      console.warn('Failed to connect to emulators:', error);
    }
  }

  // Log initialization status
  console.log('Firebase configuration:', {
    apiKey: firebaseConfig.apiKey ? '✓' : '✗',
    authDomain: firebaseConfig.authDomain ? '✓' : '✗',
    projectId: firebaseConfig.projectId ? '✓' : '✗',
    storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
    appId: firebaseConfig.appId ? '✓' : '✗',
    databaseURL: firebaseConfig.databaseURL ? '✓' : '✗'
  });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Check your configuration.');
}

export { auth, db };
