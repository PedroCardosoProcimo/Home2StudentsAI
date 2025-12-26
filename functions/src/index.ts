import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { mandrillApiKey } from './config/mandrill.config';
import { sendConsumptionNotification } from './email/emailService';
import { logger } from './utils/logger';
import type { ConsumptionNotificationData } from './email/types';

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Callable function to send energy consumption notification
 */
export const sendEnergyConsumptionEmail = onCall(
  {
    secrets: [mandrillApiKey],
    region: 'europe-west1', // Use European region for GDPR compliance
  },
  async (request) => {
    const log = logger.child({
      function: 'sendEnergyConsumptionEmail',
      uid: request.auth?.uid,
    });

    // Verify authentication
    if (!request.auth) {
      log.warn('Unauthenticated request');
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // TODO: Add authorization check - only admins should send notifications
    // You can check custom claims or Firestore permissions here

    const data = request.data as ConsumptionNotificationData;

    // Validate required fields
    if (!data.to || !isValidEmail(data.to)) {
      throw new HttpsError('invalid-argument', 'Valid recipient email is required');
    }

    if (!data.studentName) {
      throw new HttpsError('invalid-argument', 'Student name is required');
    }

    if (typeof data.consumptionKwh !== 'number' || data.consumptionKwh < 0) {
      throw new HttpsError('invalid-argument', 'Valid consumption value is required');
    }

    if (typeof data.contractMonthlyLimit !== 'number' || data.contractMonthlyLimit < 0) {
      throw new HttpsError('invalid-argument', 'Valid contract limit is required');
    }

    log.info('Sending consumption notification', {
      recipient: data.to,
      exceedsLimit: data.exceedsLimit,
    });

    try {
      const result = await sendConsumptionNotification(
        mandrillApiKey.value(),
        data
      );

      if (!result.success) {
        log.error('Email send failed', { error: result.error });
        throw new HttpsError('internal', `Failed to send email: ${result.error}`);
      }

      log.info('Email sent successfully', { messageId: result.messageId });

      return {
        success: true,
        messageId: result.messageId,
        retryCount: result.retryCount,
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Unexpected error sending email', { error: errorMessage });
      throw new HttpsError('internal', 'Failed to send email');
    }
  }
);
