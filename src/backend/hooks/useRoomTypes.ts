import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import { RoomType } from '@/shared/types';

export const useRoomTypes = (residenceId?: string) => {
  return useQuery({
    queryKey: ['roomTypes', residenceId],
    queryFn: async () => {
      if (!residenceId) return [];

      const roomTypesRef = collection(db, 'roomTypes');
      const q = query(roomTypesRef, where('residenceId', '==', residenceId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoomType[];
    },
    enabled: !!residenceId
  });
};
