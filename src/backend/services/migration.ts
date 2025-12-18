import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '@/backend/lib/firebase';
import type { User } from '@/shared/types';

/**
 * Migration service for hybrid approach:
 * - Creates users collection from admins (with role='admin')
 * - Creates users collection from students (with role='student')
 * - Updates students collection to remove email/name (keep student-specific data only)
 */

export interface MigrationResult {
  success: boolean;
  adminsProcessed: number;
  studentsProcessed: number;
  errors: string[];
}

/**
 * Migrate admins to users collection
 * Creates user records with role='admin', needsPasswordChange=false
 */
export const migrateAdminsToUsers = async (): Promise<{
  count: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let count = 0;

  try {
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    const batch = writeBatch(db);

    for (const adminDoc of adminsSnapshot.docs) {
      const adminId = adminDoc.id;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', adminId));
      if (userDoc.exists()) {
        errors.push(`User ${adminId} already exists, skipping`);
        continue;
      }

      // Get admin email from Firebase Auth (if current user is this admin)
      // For now, we'll use a placeholder. In production, you'd need Admin SDK
      const email = auth.currentUser?.uid === adminId
        ? auth.currentUser.email || `admin_${adminId}@placeholder.com`
        : `admin_${adminId}@placeholder.com`;

      const userData: User = {
        id: adminId,
        email,
        name: 'Admin User', // Default name - should be updated manually
        role: 'admin',
        needsPasswordChange: false, // Admins never need password change
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      batch.set(doc(db, 'users', adminId), userData);
      count++;
    }

    await batch.commit();
  } catch (error) {
    errors.push(`Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { count, errors };
};

/**
 * Migrate students to hybrid structure:
 * 1. Create user record in users collection (email, name, role='student', needsPasswordChange)
 * 2. Update student record to remove email/name (keep only student-specific data)
 */
export const migrateStudentsToHybrid = async (): Promise<{
  count: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let count = 0;

  try {
    const studentsSnapshot = await getDocs(collection(db, 'students'));

    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
      const studentId = studentDoc.id;

      try {
        // Step 1: Create user record
        const userDoc = await getDoc(doc(db, 'users', studentId));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', studentId), {
            email: studentData.email,
            name: studentData.name,
            role: 'student',
            needsPasswordChange: studentData.needsPasswordChange ?? false,
            createdAt: studentData.createdAt || Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }

        // Step 2: Update student record to remove redundant fields
        // Keep only: id, phone, residenceId, bookingId, createdAt, updatedAt
        await setDoc(
          doc(db, 'students', studentId),
          {
            phone: studentData.phone,
            residenceId: studentData.residenceId,
            bookingId: studentData.bookingId,
            createdAt: studentData.createdAt || Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
          { merge: false } // Overwrite completely to remove old fields
        );

        count++;
      } catch (error) {
        errors.push(
          `Error migrating student ${studentId}: ${error instanceof Error ? error.message : 'Unknown'}`
        );
      }
    }
  } catch (error) {
    errors.push(`Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { count, errors };
};

/**
 * Verify migration success by checking collection counts and data integrity
 */
export const verifyMigration = async (): Promise<{
  success: boolean;
  details: {
    adminsCount: number;
    oldStudentsCount: number;
    usersCount: number;
    adminUsersCount: number;
    studentUsersCount: number;
    newStudentsCount: number;
  };
  issues: string[];
}> => {
  const issues: string[] = [];

  const adminsSnapshot = await getDocs(collection(db, 'admins'));
  const studentsSnapshot = await getDocs(collection(db, 'students'));
  const usersSnapshot = await getDocs(collection(db, 'users'));

  const adminUsers = usersSnapshot.docs.filter((doc) => doc.data().role === 'admin');
  const studentUsers = usersSnapshot.docs.filter((doc) => doc.data().role === 'student');

  // Check for students without corresponding users
  for (const studentDoc of studentsSnapshot.docs) {
    const userDoc = await getDoc(doc(db, 'users', studentDoc.id));
    if (!userDoc.exists()) {
      issues.push(`Student ${studentDoc.id} missing user record`);
    }
  }

  // Check for old student records with email/name fields
  for (const studentDoc of studentsSnapshot.docs) {
    const data = studentDoc.data();
    if (data.email || data.name || data.needsPasswordChange !== undefined) {
      issues.push(`Student ${studentDoc.id} still has old fields (email/name/needsPasswordChange)`);
    }
  }

  const details = {
    adminsCount: adminsSnapshot.size,
    oldStudentsCount: studentsSnapshot.size,
    usersCount: usersSnapshot.size,
    adminUsersCount: adminUsers.length,
    studentUsersCount: studentUsers.length,
    newStudentsCount: studentsSnapshot.size,
  };

  const success =
    details.adminUsersCount === details.adminsCount &&
    details.studentUsersCount === details.oldStudentsCount &&
    issues.length === 0;

  return { success, details, issues };
};

/**
 * Rollback migration by deleting users collection
 * WARNING: This is destructive and should only be used if migration fails
 */
export const rollbackMigration = async (): Promise<{
  success: boolean;
  deletedCount: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let deletedCount = 0;

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);

    for (const userDoc of usersSnapshot.docs) {
      batch.delete(doc(db, 'users', userDoc.id));
      deletedCount++;
    }

    await batch.commit();
    return { success: true, deletedCount, errors };
  } catch (error) {
    errors.push(`Rollback error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, deletedCount, errors };
  }
};
