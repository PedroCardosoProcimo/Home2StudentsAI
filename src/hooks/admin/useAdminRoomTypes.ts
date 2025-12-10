import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RoomType } from '@/types';

export const useAdminRoomTypes = () => {
  return useQuery({
    queryKey: ['admin', 'roomTypes'],
    queryFn: async () => {
      const q = query(collection(db, 'roomTypes'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoomType[];
    }
  });
};

export const useCreateRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'roomTypes'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roomTypes'] });
    }
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<RoomType> & { id: string }) => {
      await updateDoc(doc(db, 'roomTypes', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roomTypes'] });
    }
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'roomTypes', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roomTypes'] });
    }
  });
};
