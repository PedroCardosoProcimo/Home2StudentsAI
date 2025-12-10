import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Residence, RoomType } from '@/types';

export const useResidence = (id: string | undefined) => {
  return useQuery({
    queryKey: ['residence', id],
    queryFn: async () => {
      if (!id) throw new Error('Residence ID is required');

      // Fetch residence
      const residenceDoc = await getDoc(doc(db, 'residences', id));
      if (!residenceDoc.exists()) throw new Error('Residence not found');

      const residence = {
        id: residenceDoc.id,
        ...residenceDoc.data()
      } as Residence;

      // Fetch associated room types
      const roomTypesRef = collection(db, 'roomTypes');
      const roomTypesQuery = query(roomTypesRef, where('residenceId', '==', id));
      const roomTypesSnapshot = await getDocs(roomTypesQuery);

      const roomTypes = roomTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoomType[];

      return { residence, roomTypes };
    },
    enabled: !!id
  });
};
