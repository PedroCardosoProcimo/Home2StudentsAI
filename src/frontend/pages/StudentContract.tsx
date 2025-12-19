import { useMyContract } from '@/backend/hooks/useMyContract';
import { ContractHeader } from '@/frontend/components/student/ContractHeader';
import { ContractDetailCard } from '@/frontend/components/student/ContractDetailCard';
import { ContractSkeleton } from '@/frontend/components/student/ContractSkeleton';
import { EmptyState } from '@/frontend/components/ui/empty-state';
import { Button } from '@/frontend/components/ui/button';
import { Calendar, Euro, Zap, Mail, Phone, FileText, Download } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const StudentContract = () => {
  const { data: contract, isLoading, error } = useMyContract();

  // Loading State
  if (isLoading) {
    return <ContractSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load contract</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  // No Contract State
  if (!contract) {
    return (
      <EmptyState
        icon={FileText}
        title="No Active Contract"
        description="You don't have an active contract at the moment. Please contact the residence administration if you believe this is an error."
      />
    );
  }

  // Main Contract Display
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-bold">My Contract</h2>
        <p className="text-muted-foreground mt-1">View your contract details</p>
      </div>

      {/* Contract Header with Warning */}
      <ContractHeader
        residenceName={contract.residenceName}
        roomTypeName={contract.roomTypeName}
        roomNumber={contract.roomNumber}
        isExpiringSoon={contract.isExpiringSoon}
        daysRemaining={contract.daysRemaining}
      />

      {/* Contract Details Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Contract Details</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ContractDetailCard
            icon={<Calendar className="h-5 w-5" />}
            label="Start Date"
            value={formatDate(contract.startDate)}
          />
          <ContractDetailCard
            icon={<Calendar className="h-5 w-5" />}
            label="End Date"
            value={formatDate(contract.endDate)}
          />
          <ContractDetailCard
            icon={<Euro className="h-5 w-5" />}
            label="Monthly Value"
            value={formatCurrency(contract.monthlyValue)}
          />
          <ContractDetailCard
            icon={<Zap className="h-5 w-5" />}
            label="kWh Limit/Month"
            value={`${contract.monthlyKwhLimit} kWh`}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
        <div className="bg-card p-6 rounded-lg border space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{contract.contactEmail}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{contract.contactPhone}</span>
          </div>
        </div>
      </div>

      {/* Signed Contract PDF */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Signed Contract</h3>
        <div className="bg-card p-6 rounded-lg border">
          {contract.contractFileUrl ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">signed-contract.pdf</p>
                  <p className="text-sm text-muted-foreground">
                    Signed contract document
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(contract.contractFileUrl, '_blank')}
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Contract
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Contract document not yet available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please contact administration if you need a copy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility functions
function formatDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default StudentContract;
