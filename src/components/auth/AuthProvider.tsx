import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useStore } from '../../lib/store';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setStoreUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state error:', error);
        setError('Authentication error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setStoreUser]);

  if (!user) {
    return children;
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
