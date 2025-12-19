import { getActiveContractByStudent } from './contracts';
import { getActiveRegulation } from './regulations';
import { getAcceptanceRecord } from './regulationAcceptance';
import { MyRegulationStatus } from '@/shared/types';

/**
 * Get the current regulation and acceptance status for a student
 * @param studentId - The student's user ID
 * @returns Combined regulation status or null if no contract/regulation
 */
export async function getMyRegulationStatus(
  studentId: string
): Promise<MyRegulationStatus | null> {
  // Step 1: Get student's active contract to find their residence
  const contract = await getActiveContractByStudent(studentId);

  if (!contract) {
    // No active contract = no regulation to display
    return null;
  }

  // Step 2: Get the active regulation for the residence
  const regulation = await getActiveRegulation(contract.residenceId);

  if (!regulation) {
    // Residence has no active regulation (shouldn't happen, but handle it)
    return null;
  }

  // Step 3: Get acceptance record for THIS SPECIFIC regulation
  const acceptance = await getAcceptanceRecord(studentId, regulation.id);

  // Step 4: Return combined data
  return {
    regulation,
    hasAccepted: !!acceptance, // True if acceptance record exists
    acceptance: acceptance || undefined, // Include acceptance details if exists
    residenceName: contract.residenceName, // For display
  };
}
