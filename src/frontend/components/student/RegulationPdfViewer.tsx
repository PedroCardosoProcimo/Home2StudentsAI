import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/frontend/components/ui/dialog';

interface RegulationPdfViewerProps {
  url: string;
  version: string;
  onClose: () => void;
}

export function RegulationPdfViewer({
  url,
  version,
  onClose,
}: RegulationPdfViewerProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Residence Regulation - Version {version}</DialogTitle>
        </DialogHeader>

        {/* PDF Iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={url}
            className="w-full h-full rounded border"
            title={`Regulation PDF v${version}`}
          />
        </div>

        {/* Note for mobile users */}
        <p className="text-xs text-muted-foreground text-center">
          PDF viewer may not work on all mobile devices. Use the download button
          to save the file.
        </p>
      </DialogContent>
    </Dialog>
  );
}
