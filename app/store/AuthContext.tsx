import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '445824023413-e0qes8nf1lagcu3uiq227d9gsai93uf8.apps.googleusercontent.com', // from Firebase console → Project settings → Web API key
});

interface AuthContextType {
  isLoggedIn: boolean;
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);
    } catch (e: any) {
      setError('Sign-in failed. Please try again.');
      console.error(e);
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
        loginWithGoogle,
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