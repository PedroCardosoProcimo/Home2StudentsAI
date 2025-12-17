import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/backend/lib/firebase';
import { Settings } from '@/shared/types';

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (!settingsDoc.exists()) {
        return { minimumStayMonths: 1 } as Settings;
      }
      return settingsDoc.data() as Settings;
    }
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Settings, 'updatedAt' | 'updatedBy'>) => {
      await setDoc(doc(db, 'settings', 'general'), {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy: auth.currentUser?.email || 'unknown'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};
