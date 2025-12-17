import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';
import { Feature, Step } from '@/shared/types';

interface Amenity {
  icon: string;
  name: string;
}

interface ConfigData {
  cities: string[];
  amenities: Amenity[];
  features: Feature[];
  steps: Step[];
}

export const useConfig = () => {
  return useQuery({
    queryKey: ['config'],
    queryFn: async (): Promise<ConfigData> => {
      const docRef = doc(db, 'config', 'general');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Config document not found');
      }

      return docSnap.data() as ConfigData;
    },
    staleTime: Infinity, // Config data rarely changes
  });
};
