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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '@/backend/lib/firebase';
import type { Student } from '@/shared/types';

/**
 * Creates a student account with Firebase Auth and Firestore document
 * Uses secondary auth instance to avoid logging out the admin
 *
 * @throws Error if email already exists or creation fails
 */
export const createStudentAccount = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  residenceId: string,
  bookingId: string
): Promise<string> => {
  try {
    // Create Firebase Auth user on secondary auth instance
    // This doesn't affect the admin's login session
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    const studentId = userCredential.user.uid;

    // Create Firestore student document
    await setDoc(doc(db, 'students', studentId), {
      email,
      name,
      phone,
      residenceId,
      bookingId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return studentId;
  } catch (error) {
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('A user with this email already exists');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    } else {
      throw new Error('Failed to create student account');
    }
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  const studentDoc = await getDoc(doc(db, 'students', studentId));

  if (!studentDoc.exists()) {
    return null;
  }

  return {
    id: studentDoc.id,
    ...studentDoc.data(),
  } as Student;
};

/**
 * Get student by email
 */
export const getStudentByEmail = async (email: string): Promise<Student | null> => {
  const q = query(collection(db, 'students'), where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Student;
};

/**
 * Update student information
 */
export const updateStudent = async (
  studentId: string,
  data: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  await updateDoc(doc(db, 'students', studentId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};
