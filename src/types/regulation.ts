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
}

/**
 * Input data for updating an existing regulation
 */
export interface UpdateRegulationInput {
  version?: string;
  isActive?: boolean;
  publishedAt?: Date;
}
