import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import { Booking } from '@/shared/types';

export const useAdminBookings = () => {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    }
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status
    }: {
      id: string;
      status: 'pending' | 'approved' | 'rejected';
    }) => {
      await updateDoc(doc(db, 'bookings', id), {
        status,
        updatedAt: Timestamp.now()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    }
  });
};
