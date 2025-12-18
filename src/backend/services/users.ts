import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { User } from '@/shared/types';

/**
 * Creates a user record (for both admins and students)
 * Note: This only creates the user record, not the Firebase Auth account
 */
export const createUser = async (
  userId: string,
  email: string,
  name: string,
  role: 'admin' | 'student',
  needsPasswordChange: boolean = false
): Promise<void> => {
  await setDoc(doc(db, 'users', userId), {
    email,
    name,
    role,
    needsPasswordChange,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    return null;
  }

  return {
    id: userDoc.id,
    ...userDoc.data(),
  } as User;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnapshot = snapshot.docs[0];
  return {
    id: docSnapshot.id,
    ...docSnapshot.data(),
  } as User;
};

/**
 * Update user information
 */
export const updateUser = async (
  userId: string,
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const user = await getUserById(userId);
  return user?.role === 'admin';
};

/**
 * Check if user is student
 */
export const isUserStudent = async (userId: string): Promise<boolean> => {
  const user = await getUserById(userId);
  return user?.role === 'student';
};

/**
 * Get all users by role
 */
export const getUsersByRole = async (role: 'admin' | 'student'): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snapshot = await getDocs(q);

  const users: User[] = [];
  snapshot.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data(),
    } as User);
  });

  return users;
};
