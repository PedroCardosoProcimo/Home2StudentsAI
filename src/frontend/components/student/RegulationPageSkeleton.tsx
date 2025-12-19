import { Skeleton } from '@/frontend/components/ui/skeleton';

export function RegulationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Title Skeleton */}
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Status Banner Skeleton */}
      <div className="bg-card p-6 rounded-lg border space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Regulation Section Skeleton */}
      <div>
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
