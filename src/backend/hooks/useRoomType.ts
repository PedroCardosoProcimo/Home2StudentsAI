import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import { RoomType } from '@/shared/types';

export const useRoomType = (id: string | undefined) => {
  return useQuery({
    queryKey: ['roomType', id],
    queryFn: async () => {
      if (!id) throw new Error('Room type ID is required');

      const roomTypeDoc = await getDoc(doc(db, 'roomTypes', id));
      if (!roomTypeDoc.exists()) throw new Error('Room type not found');

      return {
        id: roomTypeDoc.id,
        ...roomTypeDoc.data()
      } as RoomType;
    },
    enabled: !!id
  });
};

