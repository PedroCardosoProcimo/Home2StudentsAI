/**
 * Email result after sending
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryCount: number;
}

/**
 * Base email data
 */
export interface BaseEmailData {
  to: string;
  subject: string;
}

/**
 * Energy consumption notification data
 */
export interface ConsumptionNotificationData extends BaseEmailData {
  studentName: string;
  consumptionKwh: number;
  contractMonthlyLimit: number;
  excessKwh: number | null;
  billingPeriod: string;
  roomNumber: string;
  residenceName: string;
  exceedsLimit: boolean;
}

/**
 * Mandrill merge vars format
 */
export interface MergeVar {
  name: string;
  content: string;
}

/**
 * Per-recipient merge vars for templates
 */
export interface RecipientMergeVars {
  rcpt: string;
  vars: MergeVar[];
}

/**
 * Mandrill recipient format
 */
export interface MandrillRecipient {
  email: string;
  type: 'to' | 'cc' | 'bcc';
  name?: string;
}

/**
 * Mandrill message format
 */
export interface MandrillMessage {
  from_email: string;
  from_name: string;
  to: MandrillRecipient[];
  subject: string;
  global_merge_vars: MergeVar[];
  merge_vars?: RecipientMergeVars[];
  track_opens: boolean;
  track_clicks: boolean;
}
