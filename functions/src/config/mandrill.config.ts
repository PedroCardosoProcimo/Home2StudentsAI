import { defineSecret } from 'firebase-functions/params';

// Use Firebase Secret Manager for API key (more secure than env vars)
export const mandrillApiKey = defineSecret('MANDRILL_API_KEY');

export const mandrillConfig = {
  requestTimeoutMs: 8000,
  maxRetries: 3,
  retryBaseDelayMs: 1000,
  retryJitterPercent: 20,

  // Template names from Mandrill dashboard
  templates: {
    consumptionExceeded: 'consumption-notification-exceeded',
    consumptionNormal: 'consumption-notification-normal',
  },

  // Tracking
  trackOpens: true,
  trackClicks: true,
} as const;

export type MandrillConfig = typeof mandrillConfig;
