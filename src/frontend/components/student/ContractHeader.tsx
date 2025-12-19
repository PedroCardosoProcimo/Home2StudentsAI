import { AlertTriangle, MapPin, BedDouble } from 'lucide-react';
import { Alert, AlertDescription } from '@/frontend/components/ui/alert';

interface ContractHeaderProps {
  residenceName: string;
  roomTypeName: string;
  roomNumber: string;
  isExpiringSoon?: boolean;
  daysRemaining?: number;
}

export function ContractHeader({
  residenceName,
  roomTypeName,
  roomNumber,
  isExpiringSoon,
  daysRemaining,
}: ContractHeaderProps) {
  return (
    <div className="bg-card p-6 rounded-lg border space-y-4">
      {/* Residence & Room Info */}
      <div>
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" />
          {residenceName}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <span className="text-sm">{roomTypeName}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Room {roomNumber}</span>
        </div>
      </div>

      {/* Expiring Soon Warning */}
      {isExpiringSoon && daysRemaining !== undefined && (
        <Alert className="border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Contract expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
