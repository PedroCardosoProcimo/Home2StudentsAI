import { format } from 'date-fns';
import { CheckCircle2, Circle, Download, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRegulationsByResidence } from '@/hooks/useRegulations';
import type { Regulation } from '@/types';
import { cn } from '@/lib/utils';

interface RegulationHistoryProps {
  residenceId: string;
}

export function RegulationHistory({ residenceId }: RegulationHistoryProps) {
  const { data: regulations, isLoading } = useRegulationsByResidence(residenceId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <HistoryItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!regulations || regulations.length === 0) {
    return (
      <div className="text-center py-12">
        <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No regulation history available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

      {/* Timeline items */}
      <div className="space-y-8">
        {regulations.map((regulation, index) => (
          <HistoryItem
            key={regulation.id}
            regulation={regulation}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

interface HistoryItemProps {
  regulation: Regulation;
  isFirst: boolean;
}

function HistoryItem({ regulation, isFirst }: HistoryItemProps) {
  // Format date
  const formatDate = (timestamp: any): string => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Format time
  const formatTime = (timestamp: any): string => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle download
  const handleDownload = () => {
    window.open(regulation.fileUrl, '_blank');
  };

  return (
    <div className="relative flex gap-6">
      {/* Timeline node */}
      <div className="flex-shrink-0 relative z-10">
        <div
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            regulation.isActive
              ? 'bg-green-500 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {regulation.isActive ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <Circle className="h-6 w-6" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-8', !isFirst && 'pt-2')}>
        <div
          className={cn(
            'rounded-lg border p-6 bg-card',
            regulation.isActive && 'border-green-500 bg-green-50/50'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">
                  Version {regulation.version}
                </h3>
                {regulation.isActive && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Active
                  </Badge>
                )}
                {!regulation.isActive && (
                  <Badge variant="secondary">Archived</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Uploaded by admin</span>
                </div>
                <span>•</span>
                <span>{formatDate(regulation.publishedAt)}</span>
                <span>•</span>
                <span>{formatTime(regulation.publishedAt)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">File Name</p>
              <p className="font-medium truncate">{regulation.fileName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">File Size</p>
              <p className="font-medium">{formatFileSize(regulation.fileSize)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">
                {regulation.isActive ? 'Currently Active' : 'Archived'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryItemSkeleton() {
  return (
    <div className="relative flex gap-6">
      <div className="flex-shrink-0">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="flex-1">
        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
