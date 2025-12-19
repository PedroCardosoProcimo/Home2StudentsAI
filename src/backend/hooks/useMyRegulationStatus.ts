import { useQuery } from '@tanstack/react-query';
import { useStudentAuth } from '@/frontend/contexts/StudentAuthContext';
import { getMyRegulationStatus } from '@/backend/services/studentRegulations';
import { MyRegulationStatus } from '@/shared/types';

/**
 * Hook to fetch the current regulation and acceptance status for logged-in student
 */
export function useMyRegulationStatus() {
  const { user } = useStudentAuth();

  return useQuery<MyRegulationStatus | null>({
    queryKey: ['my-regulation-status', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      return getMyRegulationStatus(user.uid);
    },
    enabled: !!user?.uid, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
