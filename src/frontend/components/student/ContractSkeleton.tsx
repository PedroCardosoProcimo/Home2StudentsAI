import { Skeleton } from '@/frontend/components/ui/skeleton';

export function ContractSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Title Skeleton */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Header Skeleton */}
      <Skeleton className="h-32 w-full" />

      {/* Details Section */}
      <div>
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <Skeleton className="h-7 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* PDF Section */}
      <div>
        <Skeleton className="h-7 w-40 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
