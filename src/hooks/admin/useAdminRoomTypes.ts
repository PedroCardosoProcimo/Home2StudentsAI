import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RoomType } from '@/types';
import { calculateMinimumPrice } from '@/lib/residenceUtils';

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
      
      // Recalculate starting price for the residence
      if (data.residenceId) {
        const roomTypesRef = collection(db, 'roomTypes');
        const roomTypesQuery = query(roomTypesRef, where('residenceId', '==', data.residenceId));
        const snapshot = await getDocs(roomTypesQuery);
        const roomTypes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RoomType[];
        
        const minPrice = calculateMinimumPrice(roomTypes);
        await updateDoc(doc(db, 'residences', data.residenceId), {
          startingPrice: minPrice,
          updatedAt: Timestamp.now()
        });
      }
      
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roomTypes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'residences'] });
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<RoomType> & { id: string }) => {
      // Get the room type to find residenceId before updating
      const roomTypeDoc = await getDoc(doc(db, 'roomTypes', id));
      let residenceId: string | undefined;
      
      if (roomTypeDoc.exists()) {
        const roomType = roomTypeDoc.data() as RoomType;
        residenceId = roomType.residenceId || data.residenceId;
      } else {
        residenceId = data.residenceId;
      }
      
      await updateDoc(doc(db, 'roomTypes', id), {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      // Recalculate starting price for the residence
      if (residenceId) {
        const roomTypesRef = collection(db, 'roomTypes');
        const roomTypesQuery = query(roomTypesRef, where('residenceId', '==', residenceId));
        const snapshot = await getDocs(roomTypesQuery);
        const roomTypes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RoomType[];
        
        const minPrice = calculateMinimumPrice(roomTypes);
        await updateDoc(doc(db, 'residences', residenceId), {
          startingPrice: minPrice,
          updatedAt: Timestamp.now()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roomTypes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'residences'] });
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get the room type to find residenceId before deleting
      const roomTypeDoc = await getDoc(doc(db, 'roomTypes', id));
      let residenceId: string | undefined;
      
      if (roomTypeDoc.exists()) {
        const roomType = roomTypeDoc.data() as RoomType;
        residenceId = roomType.residenceId;
      }
      
      await deleteDoc(doc(db, 'roomTypes', id));
      
      // Recalculate starting price for the residence
      if (residenceId) {
        const roomTypesRef = collection(db, 'roomTypes');
        const roomTypesQuery = query(roomTypesRef, where('residenceId', '==', residenceId));
        const snapshot = await getDocs(roomTypesQuery);
        const roomTypes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RoomType[];
        
        const minPrice = calculateMinimumPrice(roomTypes);
        await updateDoc(doc(db, 'residences', residenceId), {
          startingPrice: minPrice,
          updatedAt: Timestamp.now()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roomTypes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'residences'] });
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });
};
