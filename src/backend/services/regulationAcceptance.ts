import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { RegulationAcceptance } from '@/shared/types';

const REGULATION_ACCEPTANCES_COLLECTION = 'regulation_acceptances';

/**
 * Check if a student has accepted a specific regulation
 */
export const hasAcceptedRegulation = async (
  studentId: string,
  regulationId: string
): Promise<boolean> => {
  const q = query(
    collection(db, REGULATION_ACCEPTANCES_COLLECTION),
    where('studentId', '==', studentId),
    where('regulationId', '==', regulationId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Record a regulation acceptance (immutable)
 *
 * @returns The ID of the created acceptance document
 */
export const recordRegulationAcceptance = async (
  studentId: string,
  regulationId: string,
  regulationVersion: string,
  residenceId: string
): Promise<string> => {
  const acceptanceData: Omit<RegulationAcceptance, 'id'> = {
    studentId,
    regulationId,
    regulationVersion,
    residenceId,
    acceptedAt: Timestamp.now(),
    // Optional: Add IP address tracking for legal compliance
    // ipAddress: ... (would need to implement IP detection)
  };

  const docRef = await addDoc(
    collection(db, REGULATION_ACCEPTANCES_COLLECTION),
    acceptanceData
  );

  return docRef.id;
};

/**
 * Get all regulation acceptances for a student
 * Ordered by acceptance date (most recent first)
 */
export const getStudentAcceptanceHistory = async (
  studentId: string
): Promise<RegulationAcceptance[]> => {
  const q = query(
    collection(db, REGULATION_ACCEPTANCES_COLLECTION),
    where('studentId', '==', studentId),
    orderBy('acceptedAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RegulationAcceptance[];
};

/**
 * Get all acceptances for a specific regulation
 * Useful for seeing which students accepted a particular regulation version
 */
export const getRegulationAcceptances = async (
  regulationId: string
): Promise<RegulationAcceptance[]> => {
  const q = query(
    collection(db, REGULATION_ACCEPTANCES_COLLECTION),
    where('regulationId', '==', regulationId),
    orderBy('acceptedAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RegulationAcceptance[];
};

/**
 * Get the most recent acceptance for a student in a specific residence
 * Used to detect re-acceptance scenarios when regulations are updated
 *
 * @returns The latest acceptance or null if no previous acceptances exist
 */
export const getLatestAcceptanceForResidence = async (
  studentId: string,
  residenceId: string
): Promise<RegulationAcceptance | null> => {
  const q = query(
    collection(db, REGULATION_ACCEPTANCES_COLLECTION),
    where('studentId', '==', studentId),
    where('residenceId', '==', residenceId),
    orderBy('acceptedAt', 'desc')
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as RegulationAcceptance;
};
