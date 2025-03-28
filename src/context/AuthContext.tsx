import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName: "",
          lastName: "",
          preferredAccessTags: [],
          createdAt: new Date(),
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userData: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || "",
        firstName: "",
        lastName: "",
        preferredAccessTags: [],
        createdAt: new Date(),
      };

      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
