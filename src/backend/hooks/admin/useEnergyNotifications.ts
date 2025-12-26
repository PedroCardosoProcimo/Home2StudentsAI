import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendConsumptionEmail } from '@/backend/services/email/emailClient';
import { markNotificationSent, formatBillingPeriodDisplay } from '@/backend/services/energyConsumption';
import type { EnergyConsumption } from '@/shared/types/energy';
import type { SendConsumptionEmailRequest } from '@/shared/types/email.types';
import { toast } from 'sonner';

/**
 * Hook to send energy consumption notification
 */
export function useSendConsumptionNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consumption: EnergyConsumption) => {
      // Validate required data
      if (!consumption.studentEmail) {
        throw new Error('Student email is required');
      }

      if (!consumption.studentName) {
        throw new Error('Student name is required');
      }

      // Prepare email data
      const emailData: SendConsumptionEmailRequest = {
        to: consumption.studentEmail,
        subject: '', // Will be set by the function
        studentName: consumption.studentName,
        consumptionKwh: consumption.consumptionKwh,
        contractMonthlyLimit: consumption.contractMonthlyLimit || 0,
        excessKwh: consumption.excessKwh,
        billingPeriod: formatBillingPeriodDisplay(
          consumption.billingPeriod.month,
          consumption.billingPeriod.year
        ),
        roomNumber: consumption.roomNumber,
        residenceName: consumption.residenceName,
        exceedsLimit: consumption.exceedsLimit,
      };

      // Send email
      const result = await sendConsumptionEmail(emailData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Mark notification as sent in Firestore
      await markNotificationSent(consumption.id);

      return result;
    },
    onSuccess: (result, consumption) => {
      toast.success('Email notification sent successfully', {
        description: `Sent to ${consumption.studentEmail}`,
      });

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['energyConsumption'] });
    },
    onError: (error, consumption) => {
      toast.error('Failed to send email notification', {
        description: error.message || 'Unknown error',
      });
    },
  });
}
