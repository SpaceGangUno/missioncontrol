import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useStore } from '../../lib/store';
import { Loader, AlertCircle } from 'lucide-react';

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
  const { setUser: setStoreUser } = useStore();

  useEffect(() => {
    console.log('Setting up auth state listener...'); // Debug log
    
    if (!auth) {
      console.error('Firebase auth not initialized');
      setError('Authentication service not available');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user'); // Debug log
          setUser(user);
          setStoreUser(user);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Auth state error:', error);
          setError('Authentication error: ' + error.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setError('Failed to initialize authentication');
      setLoading(false);
    }
  }, [setStoreUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-rose-400 mb-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-semibold">Authentication Error</h2>
          </div>
          <p className="text-sky-400/80">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
          >
            Retry
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

export const useAuth = () => useContext(AuthContext);
