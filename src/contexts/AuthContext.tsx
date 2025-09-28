import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserData, UserData } from '../firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role?: 'user' | 'shop' | 'admin', phone?: string, address?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userData = await getUserData(user.uid, user.email || undefined);
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: 'user' | 'shop' | 'admin' = 'user', phone?: string, address?: string) => {
    const { signUp: firebaseSignUp } = await import('../firebase/auth');
    return firebaseSignUp(email, password, displayName, role, phone, address);
  };

  const signIn = async (email: string, password: string) => {
    const { signIn: firebaseSignIn } = await import('../firebase/auth');
    return firebaseSignIn(email, password);
  };

  const signOut = async () => {
    const { signOutUser } = await import('../firebase/auth');
    return signOutUser();
  };

  const resetPassword = async (email: string) => {
    const { resetPassword: firebaseResetPassword } = await import('../firebase/auth');
    return firebaseResetPassword(email);
  };

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        console.log('Refreshing user data for:', currentUser.uid);
        const userData = await getUserData(currentUser.uid, currentUser.email || undefined);
        console.log('Refreshed user data:', userData);
        setUserData(userData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
