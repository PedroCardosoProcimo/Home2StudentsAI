import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { Residence, RoomType } from '@/shared/types';

/**
 * Get all residences
 * @param activeOnly If true, returns only active residences
 * @returns Array of residences
 */
export const getAllResidences = async (
  activeOnly: boolean = false
): Promise<Residence[]> => {
  let q;

  if (activeOnly) {
    q = query(
      collection(db, 'residences'),
      where('active', '==', true),
      orderBy('name', 'asc')
    );
  } else {
    q = query(collection(db, 'residences'), orderBy('name', 'asc'));
  }

  const querySnapshot = await getDocs(q);
  const residences: Residence[] = [];

  querySnapshot.forEach((doc) => {
    residences.push({
      id: doc.id,
      ...(doc.data() as Residence),
    } as Residence);
  });

  return residences;
};

/**
 * Get a single residence by ID
 * @param id The residence ID
 * @returns The residence or null if not found
 */
export const getResidenceById = async (
  id: string
): Promise<Residence | null> => {
  const docRef = doc(db, 'residences', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Residence;
};

/**
 * Get a single room type by ID
 * @param id The room type ID
 * @returns The room type or null if not found
 */
export const getRoomTypeById = async (
  id: string
): Promise<RoomType | null> => {
  const docRef = doc(db, 'roomTypes', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as RoomType;
};
