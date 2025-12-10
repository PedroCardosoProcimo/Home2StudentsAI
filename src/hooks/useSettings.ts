import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings } from '@/types';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (!settingsDoc.exists()) {
        // Return default if not found
        return { minimumStayMonths: 1 } as Settings;
      }
      return settingsDoc.data() as Settings;
    }
  });
};
