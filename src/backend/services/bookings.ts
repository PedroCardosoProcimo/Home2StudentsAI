import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { Booking } from '@/shared/types';

/**
 * Get a booking by ID
 * @param id The booking ID
 * @returns The booking or null if not found
 */
export const getBookingById = async (id: string): Promise<Booking | null> => {
  const docRef = doc(db, 'bookings', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Booking;
};
