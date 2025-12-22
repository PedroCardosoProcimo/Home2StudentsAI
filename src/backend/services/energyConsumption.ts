import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import { auth } from '@/backend/lib/firebase';
import {
  EnergyConsumption,
  CreateEnergyConsumptionInput,
  UpdateEnergyConsumptionInput,
  ConsumptionSummary,
} from '@/shared/types/energy';

const COLLECTION_NAME = 'energy_consumption';

// ===== Helper Functions =====

export function formatBillingPeriodKey(month: number, year: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`;
}

export function parseBillingPeriodKey(key: string): { month: number; year: number } {
  const [year, month] = key.split('-').map(Number);
  return { month, year };
}

export function formatBillingPeriodDisplay(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
}

export function calculateSummary(records: EnergyConsumption[]): ConsumptionSummary {
  return {
    totalRecords: records.length,
    exceededCount: records.filter(r => r.exceedsLimit).length,
    pendingNotifications: records.filter(
      r => r.exceedsLimit && !r.notificationSent && r.studentId
    ).length,
  };
}

function generateConsumptionId(
  residenceId: string,
  roomNumber: string,
  billingPeriodKey: string
): string {
  return `${residenceId}_${roomNumber}_${billingPeriodKey}`;
}

// ===== CRUD Operations =====

export async function createEnergyConsumption(
  data: CreateEnergyConsumptionInput
): Promise<EnergyConsumption> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const billingPeriodKey = formatBillingPeriodKey(data.billingMonth, data.billingYear);
  const id = generateConsumptionId(data.residenceId, data.roomNumber, billingPeriodKey);

  // Check for duplicate
  const exists = await consumptionExists(data.residenceId, data.roomNumber, billingPeriodKey);
  if (exists) {
    throw new Error('Consumption already recorded for this room and period');
  }

  // Calculate limit comparison
  const exceedsLimit = data.contractMonthlyLimit !== null &&
    data.contractMonthlyLimit !== undefined &&
    data.consumptionKwh > data.contractMonthlyLimit;

  const excessKwh = exceedsLimit
    ? data.consumptionKwh - (data.contractMonthlyLimit || 0)
    : null;

  const consumption: EnergyConsumption = {
    id,
    residenceId: data.residenceId,
    residenceName: data.residenceName,
    roomNumber: data.roomNumber,
    billingPeriod: {
      month: data.billingMonth,
      year: data.billingYear,
    },
    billingPeriodKey,
    consumptionKwh: data.consumptionKwh,
    contractId: data.contractId || null,
    studentId: data.studentId || null,
    studentName: data.studentName || null,
    studentEmail: data.studentEmail || null,
    contractMonthlyLimit: data.contractMonthlyLimit || null,
    exceedsLimit,
    excessKwh,
    notificationSent: false,
    notificationSentAt: null,
    createdAt: Timestamp.now(),
    createdBy: user.uid,
    updatedAt: Timestamp.now(),
    updatedBy: user.uid,
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, consumption);

  return consumption;
}

export async function updateEnergyConsumption(
  id: string,
  data: UpdateEnergyConsumptionInput
): Promise<EnergyConsumption> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, COLLECTION_NAME, id);

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  });

  const updated = await getEnergyConsumption(id);
  if (!updated) throw new Error('Failed to retrieve updated consumption');

  return updated;
}

export async function getEnergyConsumption(id: string): Promise<EnergyConsumption | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as EnergyConsumption;
}

export async function getConsumptionByResidence(
  residenceId: string,
  filters?: { year?: number; month?: number }
): Promise<EnergyConsumption[]> {
  const colRef = collection(db, COLLECTION_NAME);
  let q = query(
    colRef,
    where('residenceId', '==', residenceId),
    orderBy('billingPeriodKey', 'desc')
  );

  // If specific period requested
  if (filters?.year && filters?.month) {
    const periodKey = formatBillingPeriodKey(filters.month, filters.year);
    q = query(
      colRef,
      where('residenceId', '==', residenceId),
      where('billingPeriodKey', '==', periodKey)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnergyConsumption));
}

export async function getConsumptionByStudent(
  studentId: string
): Promise<EnergyConsumption[]> {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(
    colRef,
    where('studentId', '==', studentId),
    orderBy('billingPeriodKey', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnergyConsumption));
}

export async function consumptionExists(
  residenceId: string,
  roomNumber: string,
  billingPeriodKey: string
): Promise<boolean> {
  const id = generateConsumptionId(residenceId, roomNumber, billingPeriodKey);
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function markNotificationSent(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    notificationSent: true,
    notificationSentAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid || 'system',
  });
}
