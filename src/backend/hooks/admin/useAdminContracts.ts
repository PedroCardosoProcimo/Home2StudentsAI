import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContractFilters } from '@/shared/types';
import {
  getContracts,
  terminateContract,
  createContract,
  updateContract,
} from '@/backend/services/contracts';

/**
 * Hook to fetch contracts with optional filters
 */
export const useAdminContracts = (filters: ContractFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'contracts', filters],
    queryFn: () => getContracts(filters),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

/**
 * Hook to terminate a contract
 */
export const useTerminateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => {
      return terminateContract(id, reason);
    },
    onSuccess: () => {
      // Invalidate all contract queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] });
    },
  });
};

/**
 * Hook to create a new contract
 */
export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] });
    },
  });
};

/**
 * Hook to update an existing contract
 */
export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: Parameters<typeof updateContract>[1] & { id: string }) => {
      return updateContract(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] });
    },
  });
};
