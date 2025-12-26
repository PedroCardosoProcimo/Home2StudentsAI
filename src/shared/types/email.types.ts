/**
 * Shared email types between frontend and functions
 */

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryCount: number;
}

export interface SendConsumptionEmailRequest {
  to: string;
  subject: string;
  studentName: string;
  consumptionKwh: number;
  contractMonthlyLimit: number;
  excessKwh: number | null;
  billingPeriod: string;
  roomNumber: string;
  residenceName: string;
  exceedsLimit: boolean;
}
