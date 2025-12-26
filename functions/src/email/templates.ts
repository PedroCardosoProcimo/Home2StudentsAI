import { mandrillConfig } from '../config/mandrill.config';

/**
 * Template names from Mandrill dashboard
 */
export const TEMPLATES = {
  CONSUMPTION_EXCEEDED: mandrillConfig.templates.consumptionExceeded,
  CONSUMPTION_NORMAL: mandrillConfig.templates.consumptionNormal,
} as const;

/**
 * Get template name based on consumption status
 */
export function getConsumptionTemplate(exceedsLimit: boolean): string {
  return exceedsLimit
    ? TEMPLATES.CONSUMPTION_EXCEEDED
    : TEMPLATES.CONSUMPTION_NORMAL;
}

/**
 * Generate subject line for consumption notification
 */
export function getConsumptionSubject(exceedsLimit: boolean, billingPeriod: string): string {
  if (exceedsLimit) {
    return `Energy Consumption Alert - ${billingPeriod} - Limit Exceeded`;
  } else {
    return `Energy Consumption Report - ${billingPeriod}`;
  }
}
