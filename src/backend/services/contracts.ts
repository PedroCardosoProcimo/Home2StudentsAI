import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { Booking } from '@/shared/types';

/**
 * Get all active contracts (approved bookings) for a specific residence
 * @param residenceId The residence ID
 * @returns Array of approved bookings (contracts)
 */
export const getActiveContractsByResidence = async (
  residenceId: string
): Promise<Booking[]> => {
  const q = query(
    collection(db, 'bookings'),
    where('residenceId', '==', residenceId),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const contracts: Booking[] = [];

  querySnapshot.forEach((doc) => {
    contracts.push({
      id: doc.id,
      ...doc.data(),
    } as Booking);
  });

  return contracts;
};

/**
 * Get all approved bookings (contracts) across all residences
 * @returns Array of all approved bookings
 */
export const getAllActiveContracts = async (): Promise<Booking[]> => {
  const q = query(
    collection(db, 'bookings'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const contracts: Booking[] = [];

  querySnapshot.forEach((doc) => {
    contracts.push({
      id: doc.id,
      ...doc.data(),
    } as Booking);
  });

  return contracts;
};
