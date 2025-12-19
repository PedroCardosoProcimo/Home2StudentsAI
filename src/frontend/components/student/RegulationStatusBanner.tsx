import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Timestamp } from 'firebase/firestore';

interface RegulationStatusBannerProps {
  hasAccepted: boolean;
  acceptedAt?: Timestamp;
  version: string;
  residenceName: string;
}

export function RegulationStatusBanner({
  hasAccepted,
  acceptedAt,
  version,
  residenceName,
}: RegulationStatusBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card p-6 rounded-lg border space-y-4">
      {/* Residence Name */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MapPin className="h-5 w-5 text-primary" />
        {residenceName}
      </div>

      {/* Status Section */}
      {hasAccepted ? (
        // ACCEPTED STATE - Green banner
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Regulation Accepted</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Version {version} • Accepted on {formatDateTime(acceptedAt!)}
          </p>
        </div>
      ) : (
        // PENDING STATE - Amber/yellow warning banner
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Acceptance Required</span>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            You must accept the current regulation to continue using the
            platform.
          </p>
          <Button
            variant="default"
            className="mt-3"
            onClick={() => navigate('/student/accept-regulation')}
          >
            Accept Regulation →
          </Button>
        </div>
      )}
    </div>
  );
}

// Utility function for date/time formatting
function formatDateTime(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
