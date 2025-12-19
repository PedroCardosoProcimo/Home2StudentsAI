import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadContractPdf,
  deleteContractPdf,
  getContractPdfUrl,
  type UploadContractPdfParams,
} from '@/backend/services/storage/contracts';

/**
 * Hook to upload a contract PDF
 * Invalidates contract queries on success
 */
export const useUploadContractPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadContractPdfParams) => uploadContractPdf(params),
    onSuccess: (_, variables) => {
      // Invalidate contract queries to refetch with new PDF URL
      queryClient.invalidateQueries({ queryKey: ['contract', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] });
    },
  });
};

/**
 * Hook to delete a contract PDF
 * Invalidates contract queries on success
 */
export const useDeleteContractPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => deleteContractPdf(contractId),
    onSuccess: (_, contractId) => {
      // Invalidate contract queries to refetch without PDF
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] });
    },
  });
};

/**
 * Hook to get contract PDF URL
 * Useful for refreshing expired URLs
 */
export const useGetContractPdfUrl = () => {
  return useMutation({
    mutationFn: (contractId: string) => getContractPdfUrl(contractId),
  });
};
