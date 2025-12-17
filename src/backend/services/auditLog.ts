import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit as firestoreLimit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import type { RegulationAuditLog, CreateAuditLogInput, AuditLogFilters } from '@/shared/types';

const AUDIT_LOG_COLLECTION = 'regulation_audit_logs';

/**
 * Create an audit log entry
 * Internal function - should be called by regulation service
 * @param entry Audit log entry data
 * @returns The ID of the created audit log entry
 */
export const createAuditLogEntry = async (
  entry: CreateAuditLogInput
): Promise<string> => {
  const auditLogData = {
    regulationId: entry.regulationId,
    residenceId: entry.residenceId,
    action: entry.action,
    performedBy: entry.performedBy,
    performedByEmail: entry.performedByEmail,
    performedByName: entry.performedByName || null,
    timestamp: serverTimestamp(), // Use server timestamp for consistency
    metadata: entry.metadata || null,
  };

  const docRef = await addDoc(
    collection(db, AUDIT_LOG_COLLECTION),
    auditLogData
  );

  return docRef.id;
};

/**
 * Get audit logs for a specific residence
 * @param residenceId The residence ID
 * @param filters Optional filters
 * @returns Array of audit log entries
 */
export const getAuditLogsByResidence = async (
  residenceId: string,
  filters?: AuditLogFilters
): Promise<RegulationAuditLog[]> => {
  let q = query(
    collection(db, AUDIT_LOG_COLLECTION),
    where('residenceId', '==', residenceId),
    orderBy('timestamp', 'desc')
  );

  // Apply filters
  if (filters?.startDate) {
    q = query(
      q,
      where('timestamp', '>=', Timestamp.fromDate(filters.startDate))
    );
  }

  if (filters?.endDate) {
    q = query(
      q,
      where('timestamp', '<=', Timestamp.fromDate(filters.endDate))
    );
  }

  if (filters?.actions && filters.actions.length > 0) {
    q = query(q, where('action', 'in', filters.actions));
  }

  if (filters?.limit) {
    q = query(q, firestoreLimit(filters.limit));
  }

  const querySnapshot = await getDocs(q);
  const auditLogs: RegulationAuditLog[] = [];

  querySnapshot.forEach((doc) => {
    auditLogs.push({
      id: doc.id,
      ...doc.data(),
    } as RegulationAuditLog);
  });

  return auditLogs;
};

/**
 * Get audit logs for a specific regulation
 * @param regulationId The regulation ID
 * @returns Array of audit log entries for this regulation
 */
export const getAuditLogsByRegulation = async (
  regulationId: string
): Promise<RegulationAuditLog[]> => {
  const q = query(
    collection(db, AUDIT_LOG_COLLECTION),
    where('regulationId', '==', regulationId),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const auditLogs: RegulationAuditLog[] = [];

  querySnapshot.forEach((doc) => {
    auditLogs.push({
      id: doc.id,
      ...doc.data(),
    } as RegulationAuditLog);
  });

  return auditLogs;
};
