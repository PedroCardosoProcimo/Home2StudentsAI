import { getFunctions, httpsCallable } from 'firebase/functions';
import type { EmailResult, SendConsumptionEmailRequest } from '@/shared/types/email.types';

/**
 * Initialize Functions client
 */
const functions = getFunctions(undefined, 'europe-west1'); // Use European region

/**
 * Callable reference to the email function
 */
const sendEnergyConsumptionEmailFn = httpsCallable<
  SendConsumptionEmailRequest,
  EmailResult
>(functions, 'sendEnergyConsumptionEmail');

/**
 * Send energy consumption notification email
 */
export async function sendConsumptionEmail(
  data: SendConsumptionEmailRequest
): Promise<EmailResult> {
  try {
    const result = await sendEnergyConsumptionEmailFn(data);
    return result.data;
  } catch (error: unknown) {
    console.error('Error calling email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';

    return {
      success: false,
      error: errorMessage,
      retryCount: 0,
    };
  }
}
