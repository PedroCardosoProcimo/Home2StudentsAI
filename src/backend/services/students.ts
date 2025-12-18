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
import type { Student, StudentWithUser } from '@/shared/types';
import { getUserById } from './users';

/**
 * Creates a student account with Firebase Auth and Firestore documents
 * Hybrid approach: creates both user and student records
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
    // Step 1: Create Firebase Auth user on secondary auth instance
    // This doesn't affect the admin's login session
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    const studentId = userCredential.user.uid;

    // Step 2: Create user record (basic auth info)
    await setDoc(doc(db, 'users', studentId), {
      email,
      name,
      role: 'student',
      needsPasswordChange: true, // Flag for mandatory first-time password change
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Step 3: Create student record (student-specific data only)
    await setDoc(doc(db, 'students', studentId), {
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
 * Get student by ID (returns student-specific data only)
 * For full student info with user data, use getStudentWithUser
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
 * Get all students for a specific residence
 * @param residenceId The residence ID
 * @returns Array of students with user data
 */
export const getStudentsByResidence = async (
  residenceId: string
): Promise<StudentWithUser[]> => {
  // Query students by residenceId
  const studentsQuery = query(
    collection(db, 'students'),
    where('residenceId', '==', residenceId)
  );
  const studentsSnapshot = await getDocs(studentsQuery);

  // Fetch user data for each student
  const studentsWithUser: StudentWithUser[] = [];
  
  for (const studentDoc of studentsSnapshot.docs) {
    const student = {
      id: studentDoc.id,
      ...studentDoc.data(),
    } as Student;

    const user = await getUserById(student.id);
    if (user) {
      studentsWithUser.push({
        ...student,
        email: user.email,
        name: user.name,
        needsPasswordChange: user.needsPasswordChange,
      });
    }
  }

  return studentsWithUser;
};

/**
 * Get student with user data (combined view)
 * Useful for UI components that need both student and user info
 */
export const getStudentWithUser = async (studentId: string): Promise<StudentWithUser | null> => {
  const [student, user] = await Promise.all([
    getStudentById(studentId),
    getUserById(studentId),
  ]);

  if (!student || !user) {
    return null;
  }

  return {
    ...student,
    email: user.email,
    name: user.name,
    needsPasswordChange: user.needsPasswordChange,
  };
};

/**
 * Get student by email (searches users collection, then gets student data)
 */
export const getStudentByEmail = async (email: string): Promise<StudentWithUser | null> => {
  // Search for user by email
  const q = query(collection(db, 'users'), where('email', '==', email), where('role', '==', 'student'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  const userId = userDoc.id;

  // Get student data
  return getStudentWithUser(userId);
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
