import { Timestamp } from 'firebase/firestore';

/**
 * Regulation entity as stored in Firestore
 * Represents a regulation document (PDF) for a residence
 */
export interface Regulation {
  id: string;
  residenceId: string;
  version: string;              // e.g., "1.0", "1.1", "2.0"
  fileName: string;             // Original file name
  fileUrl: string;              // Firebase Storage download URL
  filePath: string;             // Storage path for deletion
  fileSize: number;             // In bytes
  isActive: boolean;            // Only one per residence should be active
  publishedAt: Timestamp;       // When made available
  createdAt: Timestamp;
  createdBy: string;            // Admin user ID
  updatedAt: Timestamp;
}

/**
 * Input data for creating a new regulation
 * Uses Date instead of Timestamp for easier form handling
 */
export interface CreateRegulationInput {
  residenceId: string;
  version: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  isActive: boolean;
  publishedAt: Date;
  createdBy: string;
  createdByEmail: string;
}

/**
 * Input data for updating an existing regulation
 */
export interface UpdateRegulationInput {
  version?: string;
  isActive?: boolean;
  publishedAt?: Date;
}

/**
 * Audit action types for regulation changes
 */
export type RegulationAuditAction = 'CREATED' | 'ACTIVATED' | 'DEACTIVATED' | 'DELETED';

/**
 * Audit log entry for regulation changes
 * Immutable record of all regulation operations
 */
export interface RegulationAuditLog {
  id: string;
  regulationId: string;
  residenceId: string;
  action: RegulationAuditAction;
  performedBy: string;        // User ID
  performedByEmail: string;   // For display
  performedByName?: string;   // If available
  timestamp: Timestamp;       // Server timestamp
  metadata?: {
    version?: string;
    previousActiveId?: string;
    fileName?: string;
    fileSize?: number;
  };
}

/**
 * Input data for creating an audit log entry
 */
export interface CreateAuditLogInput {
  regulationId: string;
  residenceId: string;
  action: RegulationAuditAction;
  performedBy: string;
  performedByEmail: string;
  performedByName?: string;
  metadata?: {
    version?: string;
    previousActiveId?: string;
    fileName?: string;
    fileSize?: number;
  };
}

/**
 * Filter options for querying audit logs
 */
export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  actions?: RegulationAuditAction[];
  limit?: number;
}
