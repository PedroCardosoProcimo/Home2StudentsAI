import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegulationAuditLogs } from '@/hooks/useRegulationAuditLog';
import { Loader2 } from 'lucide-react';
import type { RegulationAuditAction } from '@/types';

interface RegulationAuditLogProps {
  residenceId: string;
}

const actionConfig: Record<
  RegulationAuditAction,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  CREATED: { label: 'Created', variant: 'default' },
  ACTIVATED: { label: 'Activated', variant: 'default' },
  DEACTIVATED: { label: 'Deactivated', variant: 'secondary' },
  DELETED: { label: 'Deleted', variant: 'destructive' },
};

export function RegulationAuditLog({ residenceId }: RegulationAuditLogProps) {
  const [limit] = useState(50); // Show last 50 entries

  const { data: auditLogs, isLoading, error } = useRegulationAuditLogs(residenceId, { limit });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Audit Logs</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load audit logs'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Track all changes made to regulations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No audit log entries yet. Actions will appear here once regulations are created or modified.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>
          Showing last {auditLogs.length} {auditLogs.length === 1 ? 'entry' : 'entries'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {log.timestamp
                      ? format(log.timestamp.toDate(), 'MMM d, yyyy HH:mm:ss')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionConfig[log.action].variant}>
                      {actionConfig[log.action].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.metadata?.version || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{log.performedByEmail}</span>
                      {log.performedByName && (
                        <span className="text-xs text-muted-foreground">
                          {log.performedByName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.action === 'CREATED' && log.metadata?.fileName && (
                      <span>File: {log.metadata.fileName}</span>
                    )}
                    {log.action === 'ACTIVATED' && log.metadata?.previousActiveId && (
                      <span>Previous regulation deactivated</span>
                    )}
                    {log.action === 'DELETED' && log.metadata?.fileName && (
                      <span>Deleted: {log.metadata.fileName}</span>
                    )}
                    {log.metadata?.fileSize && (
                      <span className="ml-2">
                        ({(log.metadata.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
