import type { Contract } from '@/shared/types';

/**
 * Contract with computed UI fields
 */
export interface ContractWithStatus extends Contract {
  daysRemaining: number;
  isExpiringSoon: boolean; // True if expires within 30 days
  isExpired: boolean; // True if contract has passed end date
}

/**
 * Enrich contract with computed fields for UI display
 * @param contract The contract to enrich
 * @returns Contract with additional computed fields
 */
export function enrichContractData(contract: Contract): ContractWithStatus {
  const now = new Date();
  const endDate = contract.endDate.toDate(); // Firestore Timestamp to Date

  const daysRemaining = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    ...contract,
    daysRemaining,
    isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0,
    isExpired: daysRemaining < 0,
  };
}
