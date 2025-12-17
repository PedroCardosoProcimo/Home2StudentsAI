import { RoomType } from '@/shared/types';

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

/**
 * Calculates the minimum stay from a list of room types.
 * Returns 1 if there are no room types.
 */
export const calculateMinimumStay = (roomTypes: Array<{ minStay: number }>): number => {
  if (roomTypes.length === 0) {
    return 1;
  }
  
  const minStays = roomTypes.map(rt => rt.minStay);
  return Math.min(...minStays);
};

