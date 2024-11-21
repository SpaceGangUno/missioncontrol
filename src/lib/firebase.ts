import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private _auth;
  private _db;
  private initialized = false;

  private constructor() {
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
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required Firebase config fields: ${missingFields.join(', ')}`);
    }

    // Initialize Firebase
    if (!getApps().length) {
      this.app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      this.app = getApps()[0];
      console.log('Using existing Firebase instance');
    }

    // Initialize services
    this._auth = getAuth(this.app);
    this._db = getFirestore(this.app);

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
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Firebase initialization timeout'));
      }, 10000);

      const unsubscribe = onAuthStateChanged(
        this._auth,
        () => {
          clearTimeout(timeoutId);
          this.initialized = true;
          unsubscribe();
          resolve();
        },
        (error) => {
          clearTimeout(timeoutId);
          unsubscribe();
          reject(error);
        }
      );
    });
  }

  public get auth() {
    if (!this._auth) {
      throw new Error('Firebase Auth not initialized');
    }
    return this._auth;
  }

  public get db() {
    if (!this._db) {
      throw new Error('Firebase Firestore not initialized');
    }
    return this._db;
  }
}

// Initialize Firebase service
const firebaseService = FirebaseService.getInstance();

// Initialize immediately and log any errors
firebaseService.initialize().catch(error => {
  console.error('Failed to initialize Firebase:', error);
});

// Export auth and db
export const auth = firebaseService.auth;
export const db = firebaseService.db;
