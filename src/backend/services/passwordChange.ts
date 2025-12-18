import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/backend/lib/firebase';

/**
 * Changes student password and clears needsPasswordChange flag
 * Requires re-authentication with current password for security
 *
 * @param studentId - The student's user ID
 * @param currentPassword - Current password for verification
 * @param newPassword - New password to set
 * @throws Error if authentication fails or password update fails
 */
export const changeStudentPassword = async (
  studentId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user');
  }

  if (user.uid !== studentId) {
    throw new Error('User mismatch');
  }

  if (!user.email) {
    throw new Error('User email not found');
  }

  try {
    // Step 1: Re-authenticate user with current password
    // This is required by Firebase for security before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Step 2: Update Firebase Auth password
    await updatePassword(user, newPassword);

    // Step 3: Clear needsPasswordChange flag in users collection
    await updateDoc(doc(db, 'users', studentId), {
      needsPasswordChange: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    // Handle specific Firebase Auth errors with user-friendly messages
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log in again to change your password');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Current password is incorrect');
    } else {
      console.error('Password change error:', error);
      throw new Error('Failed to change password. Please try again.');
    }
  }
};
