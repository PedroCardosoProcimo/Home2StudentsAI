import { useQuery } from '@tanstack/react-query';
import { getAcceptanceStatusByResidence } from '@/backend/services/acceptanceStatus';

/**
 * Hook to get acceptance status summary for a specific residence
 * @param residenceId The residence ID
 */
export const useAcceptanceStatusByResidence = (
  residenceId: string | undefined
) => {
  return useQuery({
    queryKey: ['acceptance-status', residenceId],
    queryFn: () => getAcceptanceStatusByResidence(residenceId!),
    enabled: !!residenceId,
    staleTime: 30 * 1000, // 30 seconds - data may change frequently
  });
};
