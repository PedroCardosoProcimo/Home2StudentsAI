import { getActiveContractByStudent } from './contracts';
import { getActiveRegulation } from './regulations';
import { getAcceptanceRecord } from './regulationAcceptance';
import { getStudentWithUser } from './students';
import { getResidenceById } from './residences';
import { MyRegulationStatus } from '@/shared/types';

/**
 * Get the current regulation and acceptance status for a student
 * @param studentId - The student's user ID
 * @returns Combined regulation status or null if no residence/regulation
 */
export async function getMyRegulationStatus(
  studentId: string
): Promise<MyRegulationStatus | null> {
  // Step 1: Try to get residenceId from contract first, then from student record
  const contract = await getActiveContractByStudent(studentId);

  let residenceId: string | null = contract?.residenceId || null;
  let residenceName: string = contract?.residenceName || '';

  // If no contract, try getting residenceId from student record
  if (!residenceId) {
    const student = await getStudentWithUser(studentId);
    if (!student?.residenceId) {
      // No contract and no residenceId in student record
      return null;
    }

    residenceId = student.residenceId;

    // Fetch residence name
    const residence = await getResidenceById(residenceId);
    residenceName = residence?.name || 'Unknown Residence';
  }

  // Step 2: Get the active regulation for the residence
  const regulation = await getActiveRegulation(residenceId);

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
    residenceName, // From contract or residence lookup
  };
}
