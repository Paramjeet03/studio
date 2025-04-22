"use client";

import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

interface AuthContextProps {
  app: FirebaseApp | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  app: null,
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initializedApp: FirebaseApp;
    try {
      initializedApp = initializeApp(firebaseConfig);
      setApp(initializedApp);
    } catch (initializeAppError: any) {
      console.error("Firebase initialization error:", initializeAppError.message);
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth(initializedApp);

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (authError: any) {
      console.error("Authentication error:", authError.message);
      setLoading(false);
    }
  }, []);

  const value: AuthContextProps = { app, user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
