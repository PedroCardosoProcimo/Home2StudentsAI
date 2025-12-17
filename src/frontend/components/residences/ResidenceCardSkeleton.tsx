import { Skeleton } from "@/frontend/components/ui/skeleton";

export function ResidenceCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 md:p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-10" />
            <Skeleton className="mt-1 h-7 w-24" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
