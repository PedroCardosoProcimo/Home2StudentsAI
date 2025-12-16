import { useState } from 'react';
import { Download, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useDeleteRegulation, useSetActiveRegulation } from '@/hooks/useRegulations';
import type { Regulation } from '@/types';
import { cn } from '@/lib/utils';

interface RegulationCardProps {
  regulation: Regulation;
}

export function RegulationCard({ regulation }: RegulationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const deleteRegulation = useDeleteRegulation();
  const setActiveRegulation = useSetActiveRegulation();

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (timestamp: any): string => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Handle download
  const handleDownload = () => {
    window.open(regulation.fileUrl, '_blank');
  };

  // Handle set as active
  const handleSetActive = async () => {
    try {
      await setActiveRegulation.mutateAsync({
        regulationId: regulation.id,
      });
      toast({
        title: 'Success',
        description: `Regulation ${regulation.version} is now active`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set regulation as active',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteRegulation.mutateAsync({
        regulationId: regulation.id,
        filePath: regulation.filePath,
      });
      toast({
        title: 'Success',
        description: 'Regulation deleted successfully',
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete regulation',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div
        className={cn(
          'rounded-lg border bg-card p-6 transition-colors',
          regulation.isActive && 'border-primary bg-primary/5'
        )}
      >
        <div className="flex items-start justify-between">
          {/* Left side - Info */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
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

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Published: {formatDate(regulation.publishedAt)}</p>
              <p>File size: {formatFileSize(regulation.fileSize)}</p>
              <p className="text-xs truncate">{regulation.fileName}</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Download button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {/* Set as Active button */}
            {!regulation.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetActive}
                disabled={setActiveRegulation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Set as Active
              </Button>
            )}

            {/* Delete button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={regulation.isActive || deleteRegulation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                {regulation.isActive && (
                  <TooltipContent>
                    <p>Cannot delete the active regulation</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Regulation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete regulation version{' '}
              <strong>{regulation.version}</strong>? This action cannot be
              undone. The PDF file will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
