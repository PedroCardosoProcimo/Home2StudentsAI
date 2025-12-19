import { useState } from 'react';
import { useMyRegulationStatus } from '@/backend/hooks/useMyRegulationStatus';
import { RegulationStatusBanner } from '@/frontend/components/student/RegulationStatusBanner';
import { RegulationPdfViewer } from '@/frontend/components/student/RegulationPdfViewer';
import { RegulationPageSkeleton } from '@/frontend/components/student/RegulationPageSkeleton';
import { EmptyState } from '@/frontend/components/ui/EmptyState';
import { Button } from '@/frontend/components/ui/button';
import { FileText, Eye, Download } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function StudentRegulations() {
  const { data: status, isLoading, error } = useMyRegulationStatus();
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Loading State
  if (isLoading) {
    return <RegulationPageSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load regulation information</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  // No Contract/Regulation State
  if (!status) {
    return (
      <EmptyState
        icon={FileText}
        title="No Regulation Information Available"
        description="Please contact administration if you believe this is an error."
      />
    );
  }

  const { regulation, hasAccepted, acceptance, residenceName } = status;

  // Main Regulation Display
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-bold">Residence Regulation</h2>
        <p className="text-muted-foreground mt-1">
          View your residence regulation and acceptance status
        </p>
      </div>

      {/* Status Banner */}
      <RegulationStatusBanner
        hasAccepted={hasAccepted}
        acceptedAt={acceptance?.acceptedAt}
        version={regulation.version}
        residenceName={residenceName}
      />

      {/* Current Regulation Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Current Regulation</h3>
        <div className="bg-card p-6 rounded-lg border space-y-4">
          {/* Regulation Info */}
          <div className="flex items-start gap-4">
            <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-lg">
                Regulation v{regulation.version}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Published: {formatDate(regulation.publishedAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setShowPdfViewer(true)} variant="default">
              <Eye className="h-4 w-4 mr-2" />
              View Regulation
            </Button>
            <Button
              onClick={() => window.open(regulation.fileUrl, '_blank')}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && (
        <RegulationPdfViewer
          url={regulation.fileUrl}
          version={regulation.version}
          onClose={() => setShowPdfViewer(false)}
        />
      )}
    </div>
  );
}

// Utility function
function formatDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
