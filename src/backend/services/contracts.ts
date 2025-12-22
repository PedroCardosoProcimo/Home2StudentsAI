import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  ContractFilters,
  Booking,
} from '@/shared/types';
import { getStudentWithUser } from './students';
import { getResidenceById, getRoomTypeById } from './residences';

const CONTRACTS_COLLECTION = 'contracts';

/**
 * Create a new contract in Firestore
 * @param data Contract data to create
 * @returns The created contract with ID
 * @throws Error if validation fails or duplicate active contract exists
 */
export const createContract = async (
  data: CreateContractInput
): Promise<Contract> => {
  // Validate date range
  if (data.endDate <= data.startDate) {
    throw new Error('End date must be after start date');
  }

  // Validate financial values
  if (data.monthlyValue <= 0) {
    throw new Error('Monthly value must be positive');
  }

  if (data.monthlyKwhLimit <= 0) {
    throw new Error('Monthly kWh limit must be positive');
  }

  // Get student data (contains residenceId and bookingId)
  const student = await getStudentWithUser(data.studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  // Get residenceId from student
  const residenceId = student.residenceId;
  if (!residenceId) {
    throw new Error('Student does not have a residence assigned');
  }

  // Check for duplicate active contract
  const existingContract = await hasActiveContract(
    data.studentId,
    residenceId
  );

  if (existingContract) {
    throw new Error(
      'Student already has an active contract for this residence'
    );
  }

  // Get booking to fetch roomTypeId
  if (!student.bookingId) {
    throw new Error('Student does not have a booking assigned');
  }

  const bookingDoc = await getDoc(doc(db, 'bookings', student.bookingId));
  if (!bookingDoc.exists()) {
    throw new Error('Student booking not found');
  }

  const booking = {
    id: bookingDoc.id,
    ...bookingDoc.data(),
  } as Booking;

  if (!booking.roomTypeId) {
    throw new Error('Booking does not have a room type assigned');
  }

  // Denormalize residence data
  const residence = await getResidenceById(residenceId);
  if (!residence) {
    throw new Error('Residence not found');
  }

  // Denormalize room type data
  const roomType = await getRoomTypeById(booking.roomTypeId);
  if (!roomType) {
    throw new Error('Room type not found');
  }

  const now = Timestamp.now();

  // Prepare contract data
  const contractData = {
    studentId: data.studentId,
    studentName: student.name,
    studentEmail: student.email,
    residenceId: residenceId,
    residenceName: residence.name,
    roomTypeId: booking.roomTypeId,
    roomTypeName: roomType.name,
    roomNumber: data.roomNumber,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    monthlyValue: data.monthlyValue,
    monthlyKwhLimit: data.monthlyKwhLimit,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    contractFileUrl: data.contractFileUrl || null,
    contractFilePath: data.contractFilePath || null,
    status: 'active' as const,
    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy,
    updatedBy: data.createdBy,
  };

  const docRef = await addDoc(
    collection(db, CONTRACTS_COLLECTION),
    contractData
  );

  return {
    id: docRef.id,
    ...contractData,
  } as Contract;
};

/**
 * Update an existing contract
 * @param id The contract ID
 * @param data The data to update
 * @returns The updated contract
 * @throws Error if contract not found
 */
export const updateContract = async (
  id: string,
  data: UpdateContractInput
): Promise<Contract> => {
  const docRef = doc(db, CONTRACTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Contract not found');
  }

  const contract = docSnap.data() as Contract;

  // Validate end date if being updated
  if (data.endDate) {
    const newEndDate = Timestamp.fromDate(data.endDate);
    if (newEndDate.toMillis() <= contract.startDate.toMillis()) {
      throw new Error('End date must be after start date');
    }
  }

  // Validate financial values if being updated
  if (data.monthlyValue !== undefined && data.monthlyValue <= 0) {
    throw new Error('Monthly value must be positive');
  }

  if (data.monthlyKwhLimit !== undefined && data.monthlyKwhLimit <= 0) {
    throw new Error('Monthly kWh limit must be positive');
  }

  // Prepare update data
  const updateData: Partial<Contract> = {
    updatedAt: Timestamp.now(),
    updatedBy: data.updatedBy,
  };

  // Handle room type update (fetch new room type name if roomTypeId changed)
  if (data.roomTypeId !== undefined) {
    const roomType = await getRoomTypeById(data.roomTypeId);
    if (!roomType) {
      throw new Error('Room type not found');
    }
    updateData.roomTypeId = data.roomTypeId;
    updateData.roomTypeName = roomType.name;
  }

  if (data.endDate !== undefined) {
    updateData.endDate = Timestamp.fromDate(data.endDate);
  }

  if (data.monthlyValue !== undefined) {
    updateData.monthlyValue = data.monthlyValue;
  }

  if (data.monthlyKwhLimit !== undefined) {
    updateData.monthlyKwhLimit = data.monthlyKwhLimit;
  }

  if (data.contactEmail !== undefined) {
    updateData.contactEmail = data.contactEmail;
  }

  if (data.contactPhone !== undefined) {
    updateData.contactPhone = data.contactPhone;
  }

  if (data.contractFileUrl !== undefined) {
    updateData.contractFileUrl = data.contractFileUrl;
  }

  if (data.contractFilePath !== undefined) {
    updateData.contractFilePath = data.contractFilePath;
  }

  if (data.roomNumber !== undefined) {
    updateData.roomNumber = data.roomNumber;
  }

  await updateDoc(docRef, updateData);

  // Return updated contract
  const updatedDoc = await getDoc(docRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Contract;
};

/**
 * Get a single contract by ID
 * @param id The contract ID
 * @returns The contract or null if not found
 */
export const getContract = async (id: string): Promise<Contract | null> => {
  const docRef = doc(db, CONTRACTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Contract;
};

/**
 * Get the active contract for a specific student
 * @param studentId The student ID
 * @returns The active contract or null if none exists
 */
export const getActiveContractByStudent = async (
  studentId: string
): Promise<Contract | null> => {
  const q = query(
    collection(db, CONTRACTS_COLLECTION),
    where('studentId', '==', studentId),
    where('status', '==', 'active')
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Contract;
};

/**
 * Get all contracts for a specific residence
 * @param residenceId The residence ID
 * @param status Optional status filter ('active' | 'terminated')
 * @returns Array of contracts
 */
export const getContractsByResidence = async (
  residenceId: string,
  status?: 'active' | 'terminated'
): Promise<Contract[]> => {
  const q = status
    ? query(
        collection(db, CONTRACTS_COLLECTION),
        where('residenceId', '==', residenceId),
        where('status', '==', status),
        orderBy('startDate', 'desc')
      )
    : query(
        collection(db, CONTRACTS_COLLECTION),
        where('residenceId', '==', residenceId),
        orderBy('startDate', 'desc')
      );

  const querySnapshot = await getDocs(q);
  const contracts: Contract[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    contracts.push({
      id: doc.id,
      ...data,
    } as Contract);
  });

  return contracts;
};

/**
 * Get contracts with optional filters
 * @param filters Filter options
 * @returns Array of contracts matching the filters
 */
export const getContracts = async (
  filters: ContractFilters = {}
): Promise<Contract[]> => {
  // Build query based on filters
  const q = (() => {
    const baseCollection = collection(db, CONTRACTS_COLLECTION);

    if (filters.residenceId && filters.status) {
      // Both residenceId and status filters
      return query(
        baseCollection,
        where('residenceId', '==', filters.residenceId),
        where('status', '==', filters.status),
        orderBy('startDate', 'desc')
      );
    } else if (filters.residenceId) {
      // Only residenceId filter
      return query(
        baseCollection,
        where('residenceId', '==', filters.residenceId),
        orderBy('startDate', 'desc')
      );
    } else if (filters.status) {
      // Only status filter
      return query(
        baseCollection,
        where('status', '==', filters.status),
        orderBy('startDate', 'desc')
      );
    } else if (filters.studentId) {
      // Student filter
      return query(
        baseCollection,
        where('studentId', '==', filters.studentId),
        orderBy('startDate', 'desc')
      );
    } else {
      // No filters - get all contracts
      return query(baseCollection, orderBy('startDate', 'desc'));
    }
  })();

  const querySnapshot = await getDocs(q);
  let contracts: Contract[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    contracts.push({
      id: doc.id,
      ...data,
    } as Contract);
  });

  // Apply client-side search filter if provided
  // (Firestore doesn't support LIKE queries, so we filter in memory)
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    contracts = contracts.filter(
      (contract) =>
        contract.studentName.toLowerCase().includes(searchLower) ||
        contract.studentEmail.toLowerCase().includes(searchLower)
    );
  }

  // Apply pagination (limit/offset)
  if (filters.offset !== undefined) {
    contracts = contracts.slice(filters.offset);
  }
  if (filters.limit !== undefined) {
    contracts = contracts.slice(0, filters.limit);
  }

  return contracts;
};

/**
 * Terminate a contract
 * @param id The contract ID
 * @param reason Optional termination reason
 * @returns The terminated contract
 * @throws Error if contract not found or already terminated
 */
export const terminateContract = async (
  id: string,
  reason?: string
): Promise<Contract> => {
  const docRef = doc(db, CONTRACTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Contract not found');
  }

  const contract = docSnap.data() as Contract;

  if (contract.status === 'terminated') {
    throw new Error('Contract is already terminated');
  }

  const now = Timestamp.now();

  const updateData: Partial<Contract> = {
    status: 'terminated',
    terminatedAt: now,
    updatedAt: now,
  };

  if (reason) {
    updateData.terminationReason = reason;
  }

  await updateDoc(docRef, updateData);

  // Return updated contract
  const updatedDoc = await getDoc(docRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  } as Contract;
};

/**
 * Check if a student has an active contract for a specific residence
 * @param studentId The student ID
 * @param residenceId The residence ID
 * @returns True if an active contract exists
 */
export const hasActiveContract = async (
  studentId: string,
  residenceId: string
): Promise<boolean> => {
  const q = query(
    collection(db, CONTRACTS_COLLECTION),
    where('studentId', '==', studentId),
    where('residenceId', '==', residenceId),
    where('status', '==', 'active')
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Get all active contracts (approved bookings) for a specific residence
 * @deprecated Use getContractsByResidence(residenceId, 'active') instead
 * @param residenceId The residence ID
 * @returns Array of active contracts
 */
export const getActiveContractsByResidence = async (
  residenceId: string
): Promise<Contract[]> => {
  return getContractsByResidence(residenceId, 'active');
};

/**
 * Get all active contracts across all residences
 * @deprecated Use getContracts({ status: 'active' }) instead
 * @returns Array of all active contracts
 */
export const getAllActiveContracts = async (): Promise<Contract[]> => {
  return getContracts({ status: 'active' });
};

/**
 * Find an active contract for a specific room during a billing period
 * Used by energy consumption module to link consumption to contracts
 * @param residenceId The residence ID
 * @param roomNumber The room number
 * @param month The billing month (1-12)
 * @param year The billing year
 * @returns Contract info if found, null otherwise
 */
export const findContractForRoom = async (
  residenceId: string,
  roomNumber: string,
  month: number,
  year: number
): Promise<{
  contractId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  monthlyKwhLimit: number;
} | null> => {
  // Query contracts for the residence and room
  const q = query(
    collection(db, CONTRACTS_COLLECTION),
    where('residenceId', '==', residenceId),
    where('roomNumber', '==', roomNumber),
    where('status', '==', 'active')
  );

  const snapshot = await getDocs(q);

  // Check if billing period falls within contract period
  const billingDate = new Date(year, month - 1, 15); // Mid-month

  for (const doc of snapshot.docs) {
    const contract = doc.data() as Contract;
    const startDate = contract.startDate.toDate();
    const endDate = contract.endDate.toDate();

    // Check if billing date falls within contract period
    if (billingDate >= startDate && billingDate <= endDate) {
      return {
        contractId: doc.id,
        studentId: contract.studentId,
        studentName: contract.studentName,
        studentEmail: contract.studentEmail,
        monthlyKwhLimit: contract.monthlyKwhLimit,
      };
    }
  }

  return null;
};
