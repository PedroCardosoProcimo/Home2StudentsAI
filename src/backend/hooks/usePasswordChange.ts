import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeStudentPassword } from '@/backend/services/passwordChange';

/**
 * React Query mutation hook for changing student password
 *
 * Handles:
 * - Re-authentication with current password
 * - Updating Firebase Auth password
 * - Clearing needsPasswordChange flag in Firestore
 * - Invalidating student data query cache
 */
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      currentPassword,
      newPassword,
    }: {
      studentId: string;
      currentPassword: string;
      newPassword: string;
    }) => {
      await changeStudentPassword(studentId, currentPassword, newPassword);
    },
    onSuccess: (_, variables) => {
      // Invalidate student data query to refetch with updated needsPasswordChange flag
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
    },
  });
};
