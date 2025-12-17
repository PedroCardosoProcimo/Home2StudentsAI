import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateRegulationInput, UpdateRegulationInput } from '@/shared/types';
import {
  getRegulationsByResidence,
  getActiveRegulation,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
  setActiveRegulationAtomic,
} from '@/backend/services/regulations';
import { deleteRegulationPDF } from '@/backend/services/storage/regulations';

/**
 * Hook to fetch all regulations for a residence
 * @param residenceId The residence ID
 * @returns Query result with regulations array
 */
export const useRegulationsByResidence = (residenceId: string) => {
  return useQuery({
    queryKey: ['regulations', residenceId],
    queryFn: () => getRegulationsByResidence(residenceId),
    enabled: !!residenceId,
  });
};

/**
 * Hook to fetch only the active regulation for a residence
 * @param residenceId The residence ID
 * @returns Query result with active regulation or null
 */
export const useActiveRegulation = (residenceId: string) => {
  return useQuery({
    queryKey: ['regulations', residenceId, 'active'],
    queryFn: () => getActiveRegulation(residenceId),
    enabled: !!residenceId,
  });
};

/**
 * Hook to fetch a single regulation by ID
 * @param regulationId The regulation ID
 * @returns Query result with regulation or null
 */
export const useRegulationById = (regulationId: string) => {
  return useQuery({
    queryKey: ['regulations', 'detail', regulationId],
    queryFn: () => getRegulationById(regulationId),
    enabled: !!regulationId,
  });
};

/**
 * Hook to create a new regulation
 * Invalidates regulations queries on success
 * @returns Mutation result
 */
export const useCreateRegulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRegulationInput) => createRegulation(data),
    onSuccess: (_, variables) => {
      // Invalidate all regulation queries for this residence
      queryClient.invalidateQueries({
        queryKey: ['regulations', variables.residenceId],
      });
    },
  });
};

/**
 * Hook to update an existing regulation
 * Invalidates regulations queries on success
 * @returns Mutation result
 */
export const useUpdateRegulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegulationInput }) =>
      updateRegulation(id, data),
    onSuccess: (_, variables) => {
      // Invalidate regulation detail query
      queryClient.invalidateQueries({
        queryKey: ['regulations', 'detail', variables.id],
      });
      // Invalidate all regulation list queries (we don't know the residenceId here)
      queryClient.invalidateQueries({
        queryKey: ['regulations'],
      });
    },
  });
};

/**
 * Hook to delete a regulation
 * Also deletes the associated PDF file from storage
 * Invalidates regulations queries on success
 * @returns Mutation result
 */
export const useDeleteRegulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regulationId,
      filePath,
      performedBy,
      performedByEmail,
    }: {
      regulationId: string;
      filePath: string;
      performedBy: string;
      performedByEmail: string;
    }) => {
      // Delete from Firestore first (with audit log)
      await deleteRegulation(regulationId, performedBy, performedByEmail);
      // Then delete the file from storage
      await deleteRegulationPDF(filePath);
    },
    onSuccess: () => {
      // Invalidate all regulation queries
      queryClient.invalidateQueries({
        queryKey: ['regulations'],
      });
    },
  });
};

/**
 * Hook to set a regulation as active
 * Uses atomic transaction to ensure exactly one regulation is active per residence
 * @returns Mutation result
 */
export const useSetActiveRegulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      residenceId,
      regulationId,
      performedBy,
      performedByEmail,
    }: {
      residenceId: string;
      regulationId: string;
      performedBy: string;
      performedByEmail: string;
    }) => setActiveRegulationAtomic(residenceId, regulationId, performedBy, performedByEmail),
    onSuccess: (_, variables) => {
      // Invalidate all regulation queries for this residence
      queryClient.invalidateQueries({
        queryKey: ['regulations', variables.residenceId],
      });
      // Also invalidate all regulations queries (for other views)
      queryClient.invalidateQueries({
        queryKey: ['regulations'],
      });
    },
  });
};
