import Mandrill from '@mailchimp/mailchimp_transactional';
import { mandrillConfig } from '../config/mandrill.config';
import { brandConfig } from '../config/brand.config';
import { withRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import {
  EmailResult,
  ConsumptionNotificationData,
  MandrillMessage,
  MergeVar,
} from './types';
import { getConsumptionTemplate, getConsumptionSubject } from './templates';

/**
 * Initialize Mandrill client
 */
function createMandrillClient(apiKey: string) {
  return Mandrill(apiKey);
}

/**
 * Build merge variables for template
 */
function buildMergeVars(data: Record<string, string | number>): MergeVar[] {
  return Object.entries(data).map(([name, content]) => ({
    name,
    content: String(content),
  }));
}

/**
 * Send email using Mandrill template
 */
async function sendTemplateEmail(
  client: ReturnType<typeof Mandrill>,
  templateName: string,
  message: MandrillMessage
): Promise<EmailResult> {
  const log = logger.child({
    function: 'sendTemplateEmail',
    template: templateName,
    recipient: message.to[0]?.email,
  });

  let retryCount = 0;

  try {
    log.info('Sending email', {
      templateName,
      recipient: message.to[0]?.email,
    });

    const result = await withRetry(
      async () => {
        return await client.messages.sendTemplate({
          template_name: templateName,
          template_content: [],
          message,
        });
      },
      {
        maxRetries: mandrillConfig.maxRetries,
        baseDelayMs: mandrillConfig.retryBaseDelayMs,
        jitterPercent: mandrillConfig.retryJitterPercent,
        timeoutMs: mandrillConfig.requestTimeoutMs,
      },
      (attempt, error) => {
        retryCount = attempt;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStatus = typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined;

        log.warn('Retrying email send', {
          attempt,
          error: errorMessage,
          status: errorStatus,
        });
      }
    );

    // Check Mandrill response
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Empty response from Mandrill');
    }

    const response = result[0];

    if (response.status === 'rejected' || response.status === 'invalid') {
      throw new Error(`Email ${response.status}: ${response.reject_reason || 'Unknown reason'}`);
    }

    log.info('Email sent successfully', {
      messageId: response._id,
      status: response.status,
      retryCount,
    });

    return {
      success: true,
      messageId: response._id,
      retryCount,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStatus = typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined;

    log.error('Failed to send email', {
      error: errorMessage,
      status: errorStatus,
      retryCount,
    });

    return {
      success: false,
      error: errorMessage,
      retryCount,
    };
  }
}

/**
 * Send energy consumption notification
 */
export async function sendConsumptionNotification(
  apiKey: string,
  data: ConsumptionNotificationData
): Promise<EmailResult> {
  const client = createMandrillClient(apiKey);

  const templateName = getConsumptionTemplate(data.exceedsLimit);
  const subject = getConsumptionSubject(data.exceedsLimit, data.billingPeriod);

  // Calculate percentage used
  const percentageUsed = data.contractMonthlyLimit > 0
    ? Math.round((data.consumptionKwh / data.contractMonthlyLimit) * 100)
    : 0;

  // Build merge variables (used for both global and per-recipient)
  const mergeVars = buildMergeVars({
    STUDENT_NAME: data.studentName,
    BILLING_PERIOD: data.billingPeriod,
    RESIDENCE_NAME: data.residenceName,
    ROOM_NUMBER: data.roomNumber,
    CONSUMPTION_KWH: data.consumptionKwh,
    LIMIT_KWH: data.contractMonthlyLimit,
    EXCESS_KWH: data.excessKwh ?? 0,
    PERCENTAGE_USED: percentageUsed,
    supportEmail: brandConfig.supportEmail,
    websiteUrl: brandConfig.websiteUrl,
  });

  const message: MandrillMessage = {
    from_email: brandConfig.fromEmail,
    from_name: brandConfig.fromName,
    to: [{
      email: data.to,
      type: 'to',
      name: data.studentName,
    }],
    subject,
    global_merge_vars: mergeVars, // For subject line and headers
    merge_vars: [{
      rcpt: data.to, // Recipient email
      vars: mergeVars, // Same variables for template HTML content
    }],
    track_opens: mandrillConfig.trackOpens,
    track_clicks: mandrillConfig.trackClicks,
  };

  return sendTemplateEmail(client, templateName, message);
}
