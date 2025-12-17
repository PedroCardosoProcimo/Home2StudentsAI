import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/components/ui/dialog';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import { Checkbox } from '@/frontend/components/ui/checkbox';
import { useToast } from '@/backend/hooks/use-toast';
import { useAdminAuth } from '@/frontend/contexts/AdminAuthContext';
import { useCreateRegulation, useRegulationsByResidence } from '@/backend/hooks/useRegulations';
import { uploadRegulationPDF } from '@/backend/services/storage/regulations';
import { RegulationUpload } from './RegulationUpload';
import { cn } from '@/frontend/lib/utils';

interface RegulationUploadDialogProps {
  residenceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  version?: string;
  file?: string;
}

export function RegulationUploadDialog({
  residenceId,
  open,
  onOpenChange,
}: RegulationUploadDialogProps) {
  const [version, setVersion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [setAsActive, setSetAsActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const { toast } = useToast();
  const { user } = useAdminAuth();
  const createRegulation = useCreateRegulation();
  const { data: existingRegulations } = useRegulationsByResidence(residenceId);

  // Set default "set as active" based on whether regulations exist
  useEffect(() => {
    if (open && existingRegulations) {
      setSetAsActive(existingRegulations.length === 0);
    }
  }, [open, existingRegulations]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setVersion('');
      setSelectedFile(null);
      setSetAsActive(false);
      setIsUploading(false);
      setUploadProgress(0);
      setErrors({});
    }
  }, [open]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!version.trim()) {
      newErrors.version = 'Version is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a PDF file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear file error when a file is selected
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user || !selectedFile) {
      toast({
        title: 'Error',
        description: 'Authentication required',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate a temporary regulation ID for storage path
      const tempRegulationId = `temp_${Date.now()}`;

      // Upload the PDF first
      const uploadResult = await uploadRegulationPDF({
        file: selectedFile,
        residenceId,
        regulationId: tempRegulationId,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      // Create the regulation document in Firestore
      await createRegulation.mutateAsync({
        residenceId,
        version: version.trim(),
        fileName: selectedFile.name,
        fileUrl: uploadResult.url,
        filePath: uploadResult.path,
        fileSize: uploadResult.size,
        isActive: setAsActive,
        publishedAt: new Date(),
        createdBy: user.uid,
        createdByEmail: user.email || '',
      });

      toast({
        title: 'Success',
        description: `Regulation ${version.trim()} uploaded successfully`,
      });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload regulation',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Regulation</DialogTitle>
          <DialogDescription>
            Upload a new regulation document for this residence. Students will be
            able to download and view it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Version input */}
          <div className="space-y-2">
            <Label htmlFor="version">
              Version <span className="text-destructive">*</span>
            </Label>
            <Input
              id="version"
              placeholder="e.g., 1.0, 2.1, 2024.1"
              value={version}
              onChange={(e) => {
                setVersion(e.target.value);
                // Clear error when user types
                if (errors.version) {
                  setErrors((prev) => ({ ...prev, version: undefined }));
                }
              }}
              disabled={isUploading}
              className={cn(errors.version && 'border-destructive')}
            />
            {errors.version && (
              <p className="text-sm text-destructive">{errors.version}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Use a clear version number to help track changes over time
            </p>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>
              Regulation PDF <span className="text-destructive">*</span>
            </Label>
            <RegulationUpload
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              disabled={isUploading}
            />
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file}</p>
            )}
          </div>

          {/* Set as active checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="setAsActive"
              checked={setAsActive}
              onCheckedChange={(checked) => setSetAsActive(checked === true)}
              disabled={isUploading}
            />
            <div className="space-y-1">
              <Label
                htmlFor="setAsActive"
                className="text-sm font-normal cursor-pointer"
              >
                Set as active immediately
              </Label>
              <p className="text-xs text-muted-foreground">
                {existingRegulations && existingRegulations.length === 0
                  ? 'This will be the first regulation for this residence'
                  : 'This will replace the current active regulation'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? 'Uploading...' : 'Upload Regulation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
