import { getActiveRegulation } from './regulations';
import { getActiveContractByStudent } from './contracts';
import { getStudentsByResidence } from './students';
import { getResidenceById } from './residences';
import type {
  AcceptanceStatusSummary,
  StudentAcceptanceStatus,
} from '@/shared/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/backend/lib/firebase';

/**
 * Get acceptance status summary for a specific residence
 * Shows which students have accepted the current active regulation
 *
 * @param residenceId The residence ID
 * @returns Complete summary of acceptance status
 */
export const getAcceptanceStatusByResidence = async (
  residenceId: string
): Promise<AcceptanceStatusSummary> => {
  // Get residence info
  const residence = await getResidenceById(residenceId);

  if (!residence) {
    throw new Error('Residence not found');
  }

  // Get active regulation for the residence
  const activeRegulation = await getActiveRegulation(residenceId);

  // If no active regulation, return empty summary
  if (!activeRegulation) {
    return {
      residenceId,
      residenceName: residence.name,
      currentRegulationVersion: null,
      currentRegulationId: null,
      totalStudents: 0,
      acceptedCount: 0,
      pendingCount: 0,
      acceptanceRate: 0,
      students: [],
      hasActiveRegulation: false,
    };
  }

  // Get all students for the residence
  const students = await getStudentsByResidence(residenceId);

  // If no students, return summary with regulation info but no students
  if (students.length === 0) {
    return {
      residenceId,
      residenceName: residence.name,
      currentRegulationVersion: activeRegulation.version,
      currentRegulationId: activeRegulation.id,
      totalStudents: 0,
      acceptedCount: 0,
      pendingCount: 0,
      acceptanceRate: 0,
      students: [],
      hasActiveRegulation: true,
    };
  }

  // Get all acceptance records for the active regulation
  const acceptancesQuery = query(
    collection(db, 'regulation_acceptances'),
    where('regulationId', '==', activeRegulation.id)
  );
  const acceptancesSnapshot = await getDocs(acceptancesQuery);

  // Create lookup map: studentId -> acceptance record
  const acceptanceMap = new Map();
  acceptancesSnapshot.forEach((doc) => {
    const data = doc.data();
    acceptanceMap.set(data.studentId, {
      id: doc.id,
      ...data,
    });
  });

  // Build status for each student
  const studentStatuses: StudentAcceptanceStatus[] = [];

  for (const student of students) {
    // Check if student has accepted this regulation
    const acceptance = acceptanceMap.get(student.id);

    // Try to get active contract for this student (optional)
    const contract = await getActiveContractByStudent(student.id);

    const studentStatus: StudentAcceptanceStatus = {
      // Student info
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,

      // Contract info (optional - may not exist yet)
      contractId: contract?.id,
      roomNumber: contract?.roomTypeName || 'N/A',
      contractStartDate: contract?.startDate,
      contractEndDate: contract?.endDate,

      // Acceptance status
      status: acceptance ? 'accepted' : 'pending',
      acceptedRegulationId: acceptance?.regulationId,
      acceptedRegulationVersion: acceptance?.regulationVersion,
      acceptedAt: acceptance?.acceptedAt,

      // Current regulation info
      currentRegulationId: activeRegulation.id,
      currentRegulationVersion: activeRegulation.version,
    };

    studentStatuses.push(studentStatus);
  }

  // Calculate summary statistics
  const totalStudents = studentStatuses.length;
  const acceptedCount = studentStatuses.filter(
    (s) => s.status === 'accepted'
  ).length;
  const pendingCount = totalStudents - acceptedCount;
  const acceptanceRate =
    totalStudents > 0 ? (acceptedCount / totalStudents) * 100 : 0;

  return {
    residenceId,
    residenceName: residence.name,
    currentRegulationVersion: activeRegulation.version,
    currentRegulationId: activeRegulation.id,
    totalStudents,
    acceptedCount,
    pendingCount,
    acceptanceRate,
    students: studentStatuses,
    hasActiveRegulation: true,
  };
};
