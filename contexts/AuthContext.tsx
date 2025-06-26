'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '@/config/Firebase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      isPremium: false,
      premiumPurchaseDate: null,
      freeRecsCountToday: 0,
      lastRecTimestamp: null,
      dailyRecsLimitResetDate: null,
      traktAccessToken: null,
      traktRefreshToken: null,
      traktExpiresAt: null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    try {
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  };

  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(result.user);
    return result;
  };

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    return result;
  };

  const logout = () => {
    return signOut(auth).then(() => {
      localStorage.removeItem('trakt_token');
    }).then(() => {
      router.push('/');
    });
  };

  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    return result;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    googleSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
