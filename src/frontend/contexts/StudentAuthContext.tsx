import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/backend/lib/firebase";

interface StudentAuthContextType {
  user: User | null;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Check if user exists in students collection
        // Similar to how admin checks work (via Firestore, not custom claims)
        try {
          const studentDoc = await getDoc(doc(db, 'students', user.uid));
          setIsStudent(studentDoc.exists());
        } catch (error) {
          console.error('Error checking student status:', error);
          setIsStudent(false);
        }
      } else {
        setIsStudent(false);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State will be updated via onAuthStateChanged listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <StudentAuthContext.Provider value={{ user, isStudent, login, logout, isLoading }}>
      {!isLoading && children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider");
  }
  return context;
};
