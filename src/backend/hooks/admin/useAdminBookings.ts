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
import { createStudentAccount } from '@/backend/services/students';

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

/**
 * Hook to approve booking and create student account
 * Creates student with secondary auth instance, then updates booking
 * Returns credentials for display to admin
 */
export const useApproveBookingWithStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      booking,
      password,
    }: {
      booking: Booking;
      password: string;
    }) => {
      // Create student account using secondary auth (doesn't log out admin)
      const studentId = await createStudentAccount(
        booking.guestEmail,
        password,
        booking.guestName,
        booking.guestPhone,
        booking.residenceId,
        booking.id
      );

      // Update booking status to approved and link to student
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'approved',
        studentId: studentId,
        updatedAt: Timestamp.now(),
      });

      // Return credentials for admin to display
      return {
        email: booking.guestEmail,
        password: password,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
};
