'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

import { auth, db } from '@/config/Firebase';
import { useRouter } from 'next/navigation';

// Context type definition
type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<any>;
  isPremium: boolean;
  refreshPremiumStatus: () => Promise<boolean>;
  getUserData: () => Promise<any>;
  updateUserRecStats: () => Promise<void>;
};

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
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
  const [isPremium, setIsPremium] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  /**
   * Checks if the given user is a premium user by querying Firestore.
   * 
   * @param user - The Firebase user object.
   * @returns Promise<boolean> indicating premium status.
   */
  const checkPremium = async (user: User): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log("User document doesn't exist in Firestore");
        return false;
      }
      
      const userData = userDoc.data();
      return userData?.isPremium === true;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  };

  /**
   * Refreshes the user's premium status by checking Firestore.
   * This can be called after a payment to update the UI.
   * 
   * @returns Promise<boolean> The updated premium status
   */
  const refreshPremiumStatus = async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    const status = await checkPremium(currentUser);
    setIsPremium(status);
    return status;
  };

  // Update isPremium state when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setIsPremium(false);
      return;
    }
    (async () => {
      const premium = await checkPremium(currentUser);
      setIsPremium(premium);
    })();
  }, [currentUser]);

  /**
   * Creates or updates a user document in Firestore.
   * @param user - The Firebase user object.
   */
  const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      isPremium: false,
      premiumPurchaseDate: null,
      lastRecDay: null,
      todayUsedRecs: 0,
      lastRecTimestamp: null,
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

  /**
   * Signs up a new user with email and password.
   * @param email - User's email.
   * @param password - User's password.
   */
  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(result.user);
    return result;
  };

  /**
   * Logs in a user with email and password.
   * @param email - User's email.
   * @param password - User's password.
   */
  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(
      userRef,
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    );
    return result;
  };

  /**
   * Logs out the current user and removes Trakt token from localStorage.
   */
  const logout = () => {
    return signOut(auth)
      .then(() => {
        localStorage.removeItem('trakt_token');
      })
      .then(() => {
        router.push('/');
      });
  };

  /**
   * Signs in a user with Google popup.
   */
  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    return result;
  };

  // Add function to get user data
  const getUserData = async () => {
    if (!currentUser) return null;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error("User document doesn't exist");
        return null;
      }
      
      return userDoc.data();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Add function to update user's recommendation stats
  const updateUserRecStats = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const today = new Date().toISOString().split('T')[0];
      
      // Get current user data
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;
      
      const userData = userDoc.data();
      
      // Reset count if it's a new day
      const todayUsedRecs = userData.lastRecDay === today ? 
        (userData.todayUsedRecs || 0) + 1 : 1;
      
      await setDoc(userRef, {
        lastRecDay: today,
        todayUsedRecs,
        lastRecTimestamp: serverTimestamp()
      }, { merge: true });
      
      return todayUsedRecs;
    } catch (error) {
      console.error("Error updating user rec stats:", error);
    }
  };

  // Listen for auth state changes and update currentUser and loading state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Context value
  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    googleSignIn,
    isPremium,
    refreshPremiumStatus,
    getUserData,
    updateUserRecStats
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
