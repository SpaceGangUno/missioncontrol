import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore, collection, getDocs, limit, query } from 'firebase/firestore';

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

// Initialize Firebase with retry mechanism
async function initializeFirebase(): Promise<{ app: FirebaseApp; auth: Auth; db: Firestore }> {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  while (retryCount < maxRetries) {
    try {
      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
      } else {
        app = getApps()[0];
        console.log('Using existing Firebase instance');
      }

      const auth = getAuth(app);
      const db = getFirestore(app);

      // Test auth initialization
      await new Promise<void>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          () => {
            unsubscribe();
            resolve();
          },
          (error) => {
            unsubscribe();
            reject(error);
          }
        );

        // Set a timeout for auth initialization
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Auth initialization timeout'));
        }, 5000);
      });

      // Test Firestore connection
      await new Promise<void>(async (resolve, reject) => {
        try {
          // Try to read a single document from any collection
          const testQuery = query(collection(db, 'test'), limit(1));
          await getDocs(testQuery);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      console.log('Firebase services initialized successfully');
      return { app, auth, db };
    } catch (error) {
      console.error(`Firebase initialization attempt ${retryCount + 1} failed:`, error);
      retryCount++;

      if (retryCount === maxRetries) {
        throw new Error('Failed to initialize Firebase after multiple attempts');
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Failed to initialize Firebase');
}

// Initialize Firebase services
let auth: Auth;
let db: Firestore;

// Initialize immediately and export a promise that resolves when initialization is complete
export const firebaseInitialized = initializeFirebase()
  .then(({ auth: initializedAuth, db: initializedDb }) => {
    auth = initializedAuth;
    db = initializedDb;
    return { auth, db };
  })
  .catch(error => {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  });

// Export auth and db with proper error handling
export { auth, db };
