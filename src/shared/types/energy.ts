import { Timestamp } from 'firebase/firestore';

export interface EnergyConsumption {
  id: string;

  // Location
  residenceId: string;
  residenceName: string;        // Denormalized for display
  roomNumber: string;

  // Billing Period
  billingPeriod: {
    month: number;              // 1-12
    year: number;               // e.g., 2025
  };
  billingPeriodKey: string;     // "2025-01" for efficient querying

  // Consumption Data
  consumptionKwh: number;

  // Contract Association (populated automatically on creation)
  contractId: string | null;
  studentId: string | null;
  studentName: string | null;
  studentEmail: string | null;
  contractMonthlyLimit: number | null;

  // Limit Analysis
  exceedsLimit: boolean;
  excessKwh: number | null;     // Amount over limit if exceeded

  // Notification Tracking
  notificationSent: boolean;
  notificationSentAt: Timestamp | null;

  // Audit Fields
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface CreateEnergyConsumptionInput {
  residenceId: string;
  residenceName: string;
  roomNumber: string;
  billingMonth: number;
  billingYear: number;
  consumptionKwh: number;
  contractId?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  studentEmail?: string | null;
  contractMonthlyLimit?: number | null;
}

export interface UpdateEnergyConsumptionInput {
  consumptionKwh?: number;
  notificationSent?: boolean;
  notificationSentAt?: Timestamp | null;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface ConsumptionSummary {
  totalRecords: number;
  exceededCount: number;
  pendingNotifications: number;
}

/**
 * Summary statistics for student consumption view
 */
export interface StudentConsumptionSummary {
  totalRecords: number;
  totalKwh: number;
  averageKwh: number;
  exceededCount: number;
  currentLimit: number | null;
}

export interface ContractInfo {
  contractId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  monthlyKwhLimit: number;
}
