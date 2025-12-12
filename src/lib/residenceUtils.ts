import { RoomType } from '@/types';

/**
 * Calculates the minimum price from a list of room types.
 * Returns null if there are no room types.
 */
export const calculateMinimumPrice = (roomTypes: Array<{ basePrice: number }>): number | null => {
  if (roomTypes.length === 0) {
    return null;
  }
  
  const prices = roomTypes.map(rt => rt.basePrice);
  return Math.min(...prices);
};

