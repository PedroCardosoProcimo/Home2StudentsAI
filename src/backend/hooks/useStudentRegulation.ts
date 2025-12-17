import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  hasAcceptedRegulation,
  recordRegulationAcceptance,
  getStudentAcceptanceHistory,
  getLatestAcceptanceForResidence,
} from '@/backend/services/regulationAcceptance';
import { getActiveRegulation } from '@/backend/services/regulations';

/**
 * Hook to check if student has accepted the current active regulation
 * Returns regulation, acceptance status, and previous acceptance if exists
 * Used to detect re-acceptance scenarios when regulations are updated
 */
export const useRegulationAcceptanceCheck = (
  studentId: string | undefined,
  residenceId: string | undefined
) => {
  return useQuery({
    queryKey: ['regulation-acceptance', studentId, residenceId],
    queryFn: async () => {
      if (!studentId || !residenceId) {
        return null;
      }

      // Get active regulation for the residence
      const activeRegulation = await getActiveRegulation(residenceId);

      if (!activeRegulation) {
        return null;
      }

      // Check if student has accepted this regulation
      const hasAccepted = await hasAcceptedRegulation(
        studentId,
        activeRegulation.id
      );

      // Get the latest acceptance for this residence (for re-acceptance detection)
      const previousAcceptance = await getLatestAcceptanceForResidence(
        studentId,
        residenceId
      );

      return {
        regulation: activeRegulation,
        hasAccepted,
        previousAcceptance, // Will be non-null if student previously accepted a regulation
        isReAcceptance: previousAcceptance !== null && !hasAccepted,
      };
    },
    enabled: !!studentId && !!residenceId,
    staleTime: 0, // Always fetch fresh acceptance status
  });
};

/**
 * Hook to record regulation acceptance
 * Invalidates the acceptance check query on success
 */
export const useRecordRegulationAcceptance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      regulationId,
      regulationVersion,
      residenceId,
    }: {
      studentId: string;
      regulationId: string;
      regulationVersion: string;
      residenceId: string;
    }) =>
      recordRegulationAcceptance(
        studentId,
        regulationId,
        regulationVersion,
        residenceId
      ),
    onSuccess: (_, variables) => {
      // Invalidate acceptance check query for this student
      queryClient.invalidateQueries({
        queryKey: ['regulation-acceptance', variables.studentId],
      });

      // Also invalidate history query
      queryClient.invalidateQueries({
        queryKey: ['regulation-acceptance', variables.studentId, 'history'],
      });
    },
  });
};

/**
 * Hook to get student's acceptance history
 * Useful for displaying all regulations the student has accepted
 */
export const useStudentAcceptanceHistory = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['regulation-acceptance', studentId, 'history'],
    queryFn: () => getStudentAcceptanceHistory(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
