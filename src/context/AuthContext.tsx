import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle Firebase auth state changes - simple!
  useEffect(() => {
    console.log('🔧 [AuthContext] Setting up simple auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔧 [AuthContext] Auth state:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    getIdToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}