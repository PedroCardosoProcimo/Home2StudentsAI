import { useQuery } from '@tanstack/react-query';
import { useStudentAuth } from '@/frontend/contexts/StudentAuthContext';
import { getActiveContractByStudent } from '@/backend/services/contracts';
import { enrichContractData, type ContractWithStatus } from '@/backend/utils/contractEnrichment';

/**
 * Hook to fetch and enrich the current student's active contract
 * Returns the contract with computed fields (daysRemaining, isExpiringSoon, isExpired)
 * or null if no active contract exists
 */
export function useMyContract() {
  const { user } = useStudentAuth();

  return useQuery<ContractWithStatus | null>({
    queryKey: ['my-contract', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;

      const contract = await getActiveContractByStudent(user.uid);

      if (!contract) return null;

      return enrichContractData(contract);
    },
    enabled: !!user?.uid, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
