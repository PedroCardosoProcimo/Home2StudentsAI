import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Residence } from '@/types';

export const useAdminResidences = () => {
  return useQuery({
    queryKey: ['admin', 'residences'],
    queryFn: async () => {
      const q = query(collection(db, 'residences'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Residence[];
    }
  });
};

export const useCreateResidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Residence, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'residences'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'residences'] });
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });
};

export const useUpdateResidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Residence> & { id: string }) => {
      await updateDoc(doc(db, 'residences', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'residences'] });
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });
};

export const useDeleteResidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'residences', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'residences'] });
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });
};
