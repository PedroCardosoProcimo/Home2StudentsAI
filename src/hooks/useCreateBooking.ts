import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookingFormData } from '@/types';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!data.checkIn || !data.checkOut) {
        throw new Error('Check-in and check-out dates are required');
      }

      const bookingData = {
        residenceId: data.residenceId,
        roomTypeId: data.roomTypeId,
        checkIn: Timestamp.fromDate(data.checkIn),
        checkOut: Timestamp.fromDate(data.checkOut),
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        notes: data.notes || '',
        status: 'pending' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      return docRef.id;
    },
    onSuccess: () => {
      // Invalidate bookings query to refresh data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};
