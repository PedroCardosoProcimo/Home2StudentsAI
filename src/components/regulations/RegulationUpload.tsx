import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { UploadResult } from '@/services/storage/regulations';

interface RegulationUploadProps {
  onFileSelect: (file: File) => void;
  onUploadComplete?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  isUploading?: boolean;
  uploadProgress?: number; // 0-100
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function RegulationUpload({
  onFileSelect,
  onUploadComplete,
  onError,
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
}: RegulationUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are accepted';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be smaller than 10MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setError('');
    setIsSuccess(false);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle click to browse
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle remove file
  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Show success state when upload completes
  if (isSuccess) {
    return (
      <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Upload successful!
              </p>
              {selectedFile && (
                <p className="text-sm text-green-700">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
          >
            Upload another
          </Button>
        </div>
      </div>
    );
  }

  // Show uploading state
  if (isUploading && selectedFile) {
    return (
      <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show file selected state
  if (selectedFile && !isUploading) {
    return (
      <div
        className={cn(
          'border-2 rounded-lg p-6',
          error ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className={cn(
              'h-8 w-8',
              error ? 'text-destructive' : 'text-primary'
            )} />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <div className="mt-4 flex items-start gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Show default drop zone
  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragging && 'border-primary bg-primary/5',
        !isDragging && 'border-border hover:border-primary/50 hover:bg-muted/50',
        (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
        error && 'border-destructive'
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Upload PDF file"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
        aria-label="File input"
      />
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-base font-medium">
            Drag and drop a PDF here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Maximum file size: 10MB
          </p>
        </div>
        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
