import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { User, AuthContextType } from "../types";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getUser, createUser } from "../api/firestoreService";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get user data from Firestore
        const userData = await getUser(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          // If user doesn't exist in Firestore, create a basic user object
          const userObj: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName: firebaseUser.displayName?.split(" ")[0] || "",
            lastName: firebaseUser.displayName?.split(" ")[1] || "",
            preferredAccessTags: [],
            createdAt: new Date().toISOString(),
          };
          setUser(userObj);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Try to get user data from Firestore
    const userData = await getUser(firebaseUser.uid);
    if (userData) {
      setUser(userData);
      return userData;
    }

    // If user doesn't exist in Firestore, create a new user document
    const userObj: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      firstName: firebaseUser.displayName?.split(" ")[0] || "",
      lastName: firebaseUser.displayName?.split(" ")[1] || "",
      preferredAccessTags: [],
      createdAt: new Date().toISOString(),
    };

    // Create the user document in Firestore
    await createUser(firebaseUser.uid, userObj);
    setUser(userObj);
    return userObj;
  };

  const logout = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
