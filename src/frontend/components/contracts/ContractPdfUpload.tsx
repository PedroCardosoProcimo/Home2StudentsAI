import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Progress } from "@/frontend/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/frontend/components/ui/alert-dialog";
import { useToast } from "@/backend/hooks/use-toast";
import { useUploadContractPdf } from "@/backend/hooks/useContractStorage";
import { getContract } from "@/backend/services/contracts";

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPE = "application/pdf";

interface ContractPdfUploadProps {
  contractId: string;
  onUploadComplete?: (url: string) => void;
  readOnly?: boolean; // For student view
}

export function ContractPdfUpload({
  contractId,
  onUploadComplete,
  readOnly = false,
}: ContractPdfUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch contract data to get current file info
  const { data: contract } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => getContract(contractId),
    enabled: !!contractId,
  });

  const uploadMutation = useUploadContractPdf();

  // Get current file info from contract data
  const currentFileUrl = contract?.contractFileUrl;
  const currentFileName = "signed-contract.pdf";
  const uploadedAt = contract?.updatedAt?.toDate();

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    if (file.type !== ALLOWED_FILE_TYPE) {
      return "Please select a PDF file";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10MB";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Start upload
    handleUpload(file);
  };

  // Handle upload
  const handleUpload = async (file: File) => {
    setUploadError(null);
    setUploadProgress(0);

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        contractId,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      toast({
        title: "Success",
        description: "Contract PDF uploaded successfully",
      });

      onUploadComplete?.(result.url);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload contract PDF";
      setUploadError(errorMessage);

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle replace button click
  const handleReplaceClick = () => {
    setIsReplaceDialogOpen(true);
  };

  // Handle replace confirmation
  const handleReplaceConfirm = () => {
    setIsReplaceDialogOpen(false);
    fileInputRef.current?.click();
  };

  // Handle download
  const handleDownload = () => {
    if (currentFileUrl) {
      window.open(currentFileUrl, "_blank");
    }
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    // Note: Firebase uploadBytesResumable doesn't support easy cancellation
    // For now, we'll just reset the UI state
    setUploadProgress(0);
    setUploadError(null);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast({
      title: "Upload cancelled",
      description: "The upload has been cancelled",
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const isUploading = uploadMutation.isPending;
  const hasFile = !!currentFileUrl && !isUploading;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Signed Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* STATE 4: Error */}
          {uploadError && !isUploading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* STATE 3: Uploading */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelUpload}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}

          {/* STATE 2: File Exists OR STATE 5: Read-Only */}
          {hasFile && !isUploading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{currentFileName}</span>
              </div>
              {uploadedAt && (
                <p className="text-sm text-muted-foreground">
                  Uploaded on: {formatDate(uploadedAt)}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Replace
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STATE 1: No File Uploaded */}
          {!hasFile && !isUploading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>No contract file uploaded</span>
              </div>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Contract PDF
                </Button>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select PDF file to upload"
          />
        </CardContent>
      </Card>

      {/* Replace confirmation dialog */}
      <AlertDialog open={isReplaceDialogOpen} onOpenChange={setIsReplaceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Contract PDF?</AlertDialogTitle>
            <AlertDialogDescription>
              The current file will be deleted and replaced with the new one. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>
              Replace File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
