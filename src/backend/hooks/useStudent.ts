import { useQuery } from '@tanstack/react-query';
import { getStudentWithUser } from '@/backend/services/students';

/**
 * Hook to fetch current student data with user info (hybrid approach)
 * Returns combined student + user data (email, name, needsPasswordChange, phone, etc.)
 * @param studentId - The student's ID (Firebase Auth UID)
 */
export const useCurrentStudent = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: () => getStudentWithUser(studentId!),
    enabled: !!studentId, // Only run query if studentId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes - student data doesn't change often
  });
};
