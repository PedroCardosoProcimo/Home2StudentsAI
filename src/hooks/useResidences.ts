import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Residence } from '@/types';

export const useResidences = (activeOnly = true) => {
  return useQuery({
    queryKey: ['residences', activeOnly],
    queryFn: async () => {
      const residencesRef = collection(db, 'residences');
      const q = activeOnly
        ? query(residencesRef, where('active', '==', true), orderBy('name'))
        : query(residencesRef, orderBy('name'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Residence[];
    }
  });
};
