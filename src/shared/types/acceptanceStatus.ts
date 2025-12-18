import { Timestamp } from 'firebase/firestore';

export interface StudentAcceptanceStatus {
  // Student info
  studentId: string;
  studentName: string;
  studentEmail: string;

  // Contract info (optional - students may not have contracts yet)
  contractId?: string;
  residenceName: string; // residence name from contract or student, or 'N/A' if no contract
  contractStartDate?: Timestamp;
  contractEndDate?: Timestamp;

  // Acceptance status
  status: 'accepted' | 'pending';
  acceptedRegulationId?: string;
  acceptedRegulationVersion?: string;
  acceptedAt?: Timestamp;

  // Current regulation info
  currentRegulationId: string;
  currentRegulationVersion: string;
}

export interface AcceptanceStatusSummary {
  residenceId: string;
  residenceName: string;
  currentRegulationVersion: string | null;
  currentRegulationId: string | null;
  totalStudents: number;
  acceptedCount: number;
  pendingCount: number;
  acceptanceRate: number; // percentage
  students: StudentAcceptanceStatus[];
  hasActiveRegulation: boolean;
}
