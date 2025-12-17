import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { Regulation, CreateRegulationInput, UpdateRegulationInput } from '@/shared/types';
import { createAuditLogEntry } from './auditLog';

const REGULATIONS_COLLECTION = 'regulations';

/**
 * Create a new regulation document in Firestore
 * @param data Regulation data to create
 * @returns The ID of the created regulation
 */
export const createRegulation = async (
  data: CreateRegulationInput
): Promise<string> => {
  // Validate residenceId exists
  const residenceRef = doc(db, 'residences', data.residenceId);
  const residenceSnap = await getDoc(residenceRef);

  if (!residenceSnap.exists()) {
    throw new Error('Invalid residence ID. Residence does not exist.');
  }

  // Validate version is non-empty
  if (!data.version.trim()) {
    throw new Error('Version cannot be empty.');
  }

  // If this regulation should be active, deactivate all other regulations for this residence
  if (data.isActive) {
    await deactivateAllRegulations(data.residenceId);
  }

  const now = Timestamp.now();
  const regulationData = {
    residenceId: data.residenceId,
    version: data.version.trim(),
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    filePath: data.filePath,
    fileSize: data.fileSize,
    isActive: data.isActive,
    publishedAt: Timestamp.fromDate(data.publishedAt),
    createdAt: now,
    createdBy: data.createdBy,
    updatedAt: now,
  };

  const docRef = await addDoc(
    collection(db, REGULATIONS_COLLECTION),
    regulationData
  );

  // Create audit log entry
  await createAuditLogEntry({
    regulationId: docRef.id,
    residenceId: data.residenceId,
    action: 'CREATED',
    performedBy: data.createdBy,
    performedByEmail: data.createdByEmail,
    metadata: {
      version: data.version,
      fileName: data.fileName,
      fileSize: data.fileSize,
    },
  });

  return docRef.id;
};

/**
 * Get all regulations for a specific residence, ordered by publishedAt desc
 * @param residenceId The ID of the residence
 * @returns Array of regulations
 */
export const getRegulationsByResidence = async (
  residenceId: string
): Promise<Regulation[]> => {
  const q = query(
    collection(db, REGULATIONS_COLLECTION),
    where('residenceId', '==', residenceId),
    orderBy('publishedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const regulations: Regulation[] = [];

  querySnapshot.forEach((doc) => {
    regulations.push({
      id: doc.id,
      ...doc.data(),
    } as Regulation);
  });

  return regulations;
};

/**
 * Get only the active regulation for a specific residence
 * @param residenceId The ID of the residence
 * @returns The active regulation or null if none exists
 */
export const getActiveRegulation = async (
  residenceId: string
): Promise<Regulation | null> => {
  const q = query(
    collection(db, REGULATIONS_COLLECTION),
    where('residenceId', '==', residenceId),
    where('isActive', '==', true)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Regulation;
};

/**
 * Get a single regulation by ID
 * @param id The regulation ID
 * @returns The regulation or null if not found
 */
export const getRegulationById = async (
  id: string
): Promise<Regulation | null> => {
  const docRef = doc(db, REGULATIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Regulation;
};

/**
 * Update an existing regulation
 * @param id The regulation ID
 * @param data The data to update
 */
export const updateRegulation = async (
  id: string,
  data: UpdateRegulationInput
): Promise<void> => {
  const docRef = doc(db, REGULATIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Regulation not found.');
  }

  const regulation = docSnap.data() as Regulation;

  // If setting this regulation as active, deactivate all others for this residence
  if (data.isActive && !regulation.isActive) {
    await deactivateAllRegulations(regulation.residenceId, id);
  }

  const updateData: Partial<Regulation> = {
    updatedAt: Timestamp.now(),
  };

  if (data.version !== undefined) {
    if (!data.version.trim()) {
      throw new Error('Version cannot be empty.');
    }
    updateData.version = data.version.trim();
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  if (data.publishedAt !== undefined) {
    updateData.publishedAt = Timestamp.fromDate(data.publishedAt);
  }

  await updateDoc(docRef, updateData);
};

/**
 * Delete a regulation
 * Regulations that are currently active cannot be deleted
 * @param id The regulation ID
 * @param performedBy User ID performing the action
 * @param performedByEmail User email performing the action
 */
export const deleteRegulation = async (
  id: string,
  performedBy: string,
  performedByEmail: string
): Promise<void> => {
  const docRef = doc(db, REGULATIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Regulation not found.');
  }

  const regulation = docSnap.data() as Regulation;

  // Prevent deletion of active regulation
  if (regulation.isActive) {
    throw new Error(
      'Cannot delete an active regulation. Please set another regulation as active first.'
    );
  }

  // Delete the regulation
  await deleteDoc(docRef);

  // Create audit log entry
  await createAuditLogEntry({
    regulationId: id,
    residenceId: regulation.residenceId,
    action: 'DELETED',
    performedBy,
    performedByEmail,
    metadata: {
      version: regulation.version,
      fileName: regulation.fileName,
    },
  });
};

/**
 * Atomically switches the active regulation for a residence.
 * Uses Firestore transaction to ensure exactly one regulation is active.
 *
 * @param residenceId The residence ID
 * @param newActiveRegulationId The regulation to make active
 * @param performedBy User ID performing the action
 * @param performedByEmail User email performing the action
 * @throws Error if regulation not found or transaction fails
 * @returns Object with previous and new active regulation IDs
 */
export const setActiveRegulationAtomic = async (
  residenceId: string,
  newActiveRegulationId: string,
  performedBy: string,
  performedByEmail: string
): Promise<{ previousActiveId: string | null; newActiveId: string }> => {
  const result = await runTransaction(db, async (transaction) => {
    // 1. Read the new regulation to activate
    const newRegulationRef = doc(db, REGULATIONS_COLLECTION, newActiveRegulationId);
    const newRegulationSnap = await transaction.get(newRegulationRef);

    if (!newRegulationSnap.exists()) {
      throw new Error('Regulation not found.');
    }

    const newRegulation = {
      id: newRegulationSnap.id,
      ...newRegulationSnap.data(),
    } as Regulation;

    // 2. Validate that the regulation belongs to the specified residence
    if (newRegulation.residenceId !== residenceId) {
      throw new Error('Regulation does not belong to this residence.');
    }

    // 3. Check if this regulation is already active (no-op)
    if (newRegulation.isActive) {
      return {
        previousActiveId: null,
        newActiveId: newActiveRegulationId,
      };
    }

    // 4. Find the currently active regulation for this residence
    const activeQuery = query(
      collection(db, REGULATIONS_COLLECTION),
      where('residenceId', '==', residenceId),
      where('isActive', '==', true)
    );

    const activeSnapshot = await getDocs(activeQuery);
    let previousActiveId: string | null = null;

    // 5. Deactivate the current active regulation (if exists)
    if (!activeSnapshot.empty) {
      const currentActiveDoc = activeSnapshot.docs[0];
      previousActiveId = currentActiveDoc.id;

      transaction.update(currentActiveDoc.ref, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    }

    // 6. Activate the new regulation
    transaction.update(newRegulationRef, {
      isActive: true,
      updatedAt: Timestamp.now(),
    });

    return {
      previousActiveId,
      newActiveId: newActiveRegulationId,
      newRegulationVersion: newRegulation.version,
    };
  });

  // Create audit log entries after transaction succeeds
  if (result.previousActiveId) {
    await createAuditLogEntry({
      regulationId: result.previousActiveId,
      residenceId,
      action: 'DEACTIVATED',
      performedBy,
      performedByEmail,
    });
  }

  await createAuditLogEntry({
    regulationId: newActiveRegulationId,
    residenceId,
    action: 'ACTIVATED',
    performedBy,
    performedByEmail,
    metadata: {
      version: result.newRegulationVersion,
      previousActiveId: result.previousActiveId || undefined,
    },
  });

  return {
    previousActiveId: result.previousActiveId,
    newActiveId: result.newActiveId,
  };
};

/**
 * Deactivate all regulations for a residence (except optionally one)
 * @param residenceId The residence ID
 * @param exceptId Optional regulation ID to keep active
 */
const deactivateAllRegulations = async (
  residenceId: string,
  exceptId?: string
): Promise<void> => {
  const q = query(
    collection(db, REGULATIONS_COLLECTION),
    where('residenceId', '==', residenceId),
    where('isActive', '==', true)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return;
  }

  const batch = writeBatch(db);

  querySnapshot.forEach((document) => {
    if (exceptId && document.id === exceptId) {
      return; // Skip this one
    }
    batch.update(document.ref, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  });

  await batch.commit();
};
