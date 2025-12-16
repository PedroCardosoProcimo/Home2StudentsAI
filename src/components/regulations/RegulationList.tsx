import { AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegulationsByResidence } from '@/hooks/useRegulations';
import { RegulationCard } from './RegulationCard';

interface RegulationListProps {
  residenceId: string;
}

export function RegulationList({ residenceId }: RegulationListProps) {
  const { data: regulations, isLoading, isError, error, refetch } = useRegulationsByResidence(residenceId);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <RegulationListSkeleton />
        <RegulationListSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Failed to load regulations.{' '}
            {error instanceof Error ? error.message : 'Please try again.'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!regulations || regulations.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">No regulations uploaded yet</h3>
        <p className="text-muted-foreground">
          Upload your first regulation to get started.
        </p>
      </div>
    );
  }

  // Separate active and archived regulations
  const activeRegulation = regulations.find((r) => r.isActive);
  const archivedRegulations = regulations.filter((r) => !r.isActive);

  return (
    <div className="space-y-6">
      {/* Active regulation */}
      {activeRegulation && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Current Regulation
          </h3>
          <RegulationCard regulation={activeRegulation} />
        </div>
      )}

      {/* Archived regulations */}
      {archivedRegulations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Previous Versions
          </h3>
          <div className="space-y-3">
            {archivedRegulations.map((regulation) => (
              <RegulationCard key={regulation.id} regulation={regulation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading skeleton component
function RegulationListSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}
