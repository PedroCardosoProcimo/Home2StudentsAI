import { useQuery } from '@tanstack/react-query';
import { getAuditLogsByResidence, getAuditLogsByRegulation } from '@/services/auditLog';
import type { AuditLogFilters } from '@/types';

/**
 * Hook to fetch audit logs for a specific residence
 * @param residenceId The residence ID
 * @param filters Optional filters for date range, actions, and limit
 */
export const useRegulationAuditLogs = (
  residenceId: string,
  filters?: AuditLogFilters
) => {
  return useQuery({
    queryKey: ['regulation-audit-logs', residenceId, filters],
    queryFn: () => getAuditLogsByResidence(residenceId, filters),
    enabled: !!residenceId,
  });
};

/**
 * Hook to fetch audit logs for a specific regulation
 * @param regulationId The regulation ID
 */
export const useRegulationAuditLogsByRegulation = (regulationId: string) => {
  return useQuery({
    queryKey: ['regulation-audit-logs', 'regulation', regulationId],
    queryFn: () => getAuditLogsByRegulation(regulationId),
    enabled: !!regulationId,
  });
};
