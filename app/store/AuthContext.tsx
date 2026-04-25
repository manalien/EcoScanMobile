import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '445824023413-e0qes8nf1lagcu3uiq227d9gsai93uf8.apps.googleusercontent.com',
});

interface AuthContextType {
  isLoggedIn: boolean;
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
  try {
    setError(null);
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    
    // newer versions nest it under response.data
    const idToken = response.data?.idToken ?? (response as any).idToken;
    
    if (!idToken) {
      setError('Sign-in failed: no token received.');
      return;
    }

    const credential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(credential);
  } catch (e: any) {
    console.error('Google Sign-In error:', e);
    setError('Sign-in failed. Please try again.');
  }
};

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!user,
        user,
        loading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}