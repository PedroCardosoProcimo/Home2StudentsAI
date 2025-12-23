import { useQuery } from '@tanstack/react-query';
import { useStudentAuth } from '@/frontend/contexts/StudentAuthContext';
import { getConsumptionByStudent } from '@/backend/services/energyConsumption';
import type { EnergyConsumption } from '@/shared/types/energy';

/**
 * Hook to fetch energy consumption records for the current student
 * Returns consumption history ordered by billing period (newest first)
 * or empty array if no records exist
 */
export function useMyConsumption() {
  const { user } = useStudentAuth();

  return useQuery<EnergyConsumption[]>({
    queryKey: ['my-consumption', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      const records = await getConsumptionByStudent(user.uid);
      return records;
    },
    enabled: !!user?.uid, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
