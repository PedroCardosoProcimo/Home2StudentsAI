import { useQuery } from '@tanstack/react-query';
import { getStudentById } from '@/backend/services/students';

/**
 * Hook to fetch current student data
 * @param studentId - The student's ID (Firebase Auth UID)
 */
export const useCurrentStudent = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: () => getStudentById(studentId!),
    enabled: !!studentId, // Only run query if studentId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes - student data doesn't change often
  });
};
