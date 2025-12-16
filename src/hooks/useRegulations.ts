import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Regulation, CreateRegulationInput, UpdateRegulationInput } from '@/types';
import {
  getRegulationsByResidence,
  getActiveRegulation,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
} from '@/services/regulations';
import { deleteRegulationPDF } from '@/services/storage/regulations';

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
    }: {
      regulationId: string;
      filePath: string;
    }) => {
      // Delete from Firestore first
      await deleteRegulation(regulationId);
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
 * This is a convenience wrapper around useUpdateRegulation
 * @returns Mutation result
 */
export const useSetActiveRegulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ regulationId }: { regulationId: string }) =>
      updateRegulation(regulationId, { isActive: true }),
    onSuccess: () => {
      // Invalidate all regulation queries to refresh active status
      queryClient.invalidateQueries({
        queryKey: ['regulations'],
      });
    },
  });
};
