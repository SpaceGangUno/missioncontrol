import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseInitialized } from '../../lib/firebase';
import { useStore } from '../../lib/store';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  error: null 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setStoreUser = useStore(state => state.setUser);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Wait for Firebase to initialize
        await firebaseInitialized;

        // Set up auth state listener
        const authPromise = new Promise<void>((resolve, reject) => {
          unsubscribe = onAuthStateChanged(auth, 
            (user) => {
              console.log('Auth state changed:', user ? 'User logged in' : 'No user');
              setUser(user);
              setStoreUser(user);
              setLoading(false);
              setAuthInitialized(true);
              setError(null);
              resolve();
            },
            (error) => {
              console.error('Auth state error:', error);
              setError('Authentication error: ' + error.message);
              setLoading(false);
              setAuthInitialized(true);
              reject(error);
            }
          );
        });

        // Set a timeout to prevent infinite loading
        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => {
            setLoadingTimeout(true);
            reject(new Error('Authentication service timed out'));
          }, 30000); // 30 second timeout
        });

        // Race between auth initialization and timeout
        await Promise.race([authPromise, timeoutPromise]);

      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
        setLoading(false);
        setAuthInitialized(true);
        // Retry initialization if it failed
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(count => count + 1);
            setLoading(true);
            setError(null);
          }, 1000); // Wait 1 second before retrying
        }
      }
    };

    // Initialize auth
    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [setStoreUser, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setAuthInitialized(false);
    setLoadingTimeout(false);
    setRetryCount(0);
  };

  // Show loading state only during initial auth check
  if (loading && !authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Initializing...</p>
          <p className="text-sm text-sky-400/60">Setting up your mission control...</p>
          {loadingTimeout && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-rose-400">Connection seems slow.</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-rose-400 mb-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-semibold">Houston, we have a problem</h2>
          </div>
          <p className="text-sky-400/80 mb-4">{error}</p>
          <p className="text-sm text-sky-400/60 mb-4">
            This could be due to:
            <ul className="list-disc list-inside mt-2">
              <li>Slow internet connection</li>
              <li>Firewall or security settings</li>
              <li>Temporary service disruption</li>
            </ul>
          </p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
