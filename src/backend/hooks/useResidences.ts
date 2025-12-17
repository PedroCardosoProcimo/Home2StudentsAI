import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import { Residence } from '@/shared/types';
import { getResidenceById } from '@/backend/services/residences';

export const useResidences = (activeOnly = true) => {
  return useQuery({
    queryKey: ['residences', activeOnly],
    queryFn: async () => {
      const residencesRef = collection(db, 'residences');
      const q = activeOnly
        ? query(residencesRef, where('active', '==', true))
        : query(residencesRef);

      const snapshot = await getDocs(q);
      const residences = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Residence[];

      // Sort in memory instead of in the query to avoid index requirement
      return residences.sort((a, b) => a.name.localeCompare(b.name));
    }
  });
};

/**
 * Hook to get a single residence by ID
 * @param residenceId The residence ID
 */
export const useResidence = (residenceId: string | undefined) => {
  return useQuery({
    queryKey: ['residences', residenceId],
    queryFn: () => getResidenceById(residenceId!),
    enabled: !!residenceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
