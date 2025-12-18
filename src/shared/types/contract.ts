import { Timestamp } from 'firebase/firestore';

/**
 * Contract entity as stored in Firestore
 * Represents a rental agreement between a student and a residence
 */
export interface Contract {
  id: string;

  // Student information (denormalized for query performance)
  studentId: string;
  studentName: string;
  studentEmail: string;

  // Residence information (denormalized)
  residenceId: string;
  residenceName: string;
  
  // Room type information (denormalized)
  roomTypeId: string;
  roomTypeName: string;

  // Contract dates
  startDate: Timestamp;
  endDate: Timestamp;

  // Financial terms
  monthlyValue: number;        // EUR
  monthlyKwhLimit: number;     // kWh limit per month

  // Contact information
  contactEmail: string;        // Contact email for this contract (can differ from student email)
  contactPhone: string;

  // Contract document (optional - may be uploaded later)
  contractFileUrl?: string;    // Firebase Storage download URL
  contractFilePath?: string;   // Storage path for deletion

  // Status management
  status: 'active' | 'terminated';
  terminatedAt?: Timestamp;
  terminationReason?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;           // User ID who created the contract
  updatedBy: string;           // User ID who last updated the contract
}

/**
 * Input data for creating a new contract
 * Uses Date instead of Timestamp for easier form handling
 * residenceId and roomTypeId are fetched from the student (via their booking)
 */
export interface CreateContractInput {
  studentId: string;
  startDate: Date;
  endDate: Date;
  monthlyValue: number;
  monthlyKwhLimit: number;
  contactEmail: string;
  contactPhone: string;
  contractFileUrl?: string;
  contractFilePath?: string;
  createdBy: string;
}

/**
 * Input data for updating an existing contract
 */
export interface UpdateContractInput {
  roomTypeId?: string;
  endDate?: Date;
  monthlyValue?: number;
  monthlyKwhLimit?: number;
  contactEmail?: string;
  contactPhone?: string;
  contractFileUrl?: string;
  contractFilePath?: string;
  updatedBy: string;
}

/**
 * Filter options for querying contracts
 */
export interface ContractFilters {
  residenceId?: string;
  studentId?: string;
  status?: 'active' | 'terminated';
  searchTerm?: string;         // Search in student name/email
  limit?: number;              // Maximum number of results to return
  offset?: number;             // Number of results to skip
}
