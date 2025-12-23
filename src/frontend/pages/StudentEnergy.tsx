import { useMemo } from 'react';
import { useMyConsumption } from '@/backend/hooks/useMyConsumption';
import { calculateStudentConsumptionSummary, formatBillingPeriodDisplay } from '@/backend/services/energyConsumption';
import { ConsumptionSummaryCard } from '@/frontend/components/energy/ConsumptionSummaryCard';
import { ConsumptionRecordCard } from '@/frontend/components/energy/ConsumptionRecordCard';
import { EmptyState } from '@/frontend/components/ui/empty-state';
import { BarChart3 } from 'lucide-react';

/**
 * Student Energy Consumption Page
 * Displays consumption history with limit comparisons and visual indicators
 */
const StudentEnergy = () => {
  const { data: consumptionRecords = [], isLoading, error } = useMyConsumption();

  // Calculate summary statistics
  const summary = useMemo(
    () => calculateStudentConsumptionSummary(consumptionRecords),
    [consumptionRecords]
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Energy Consumption</h2>
          <p className="text-muted-foreground mt-1">Loading history...</p>
        </div>
        <div className="space-y-4">
          {/* Loading skeleton */}
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Energy Consumption</h2>
          <p className="text-muted-foreground mt-1">View your consumption history</p>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive font-medium">
            Error loading consumption data
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try reloading the page
          </p>
        </div>
      </div>
    );
  }

  // Empty State
  if (consumptionRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Energy Consumption</h2>
          <p className="text-muted-foreground mt-1">View your consumption history</p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No Consumption Data"
          description="Your energy consumption records will appear here once they are registered by the administration."
        />
      </div>
    );
  }

  // Main Display with Records
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold">Energy Consumption</h2>
        <p className="text-muted-foreground mt-1">
          Track your consumption and compare it with your monthly limit
        </p>
      </div>

      {/* Summary Card */}
      <ConsumptionSummaryCard
        monthlyLimit={summary.currentLimit}
        averageConsumption={summary.averageKwh}
        exceededCount={summary.exceededCount}
        totalRecords={summary.totalRecords}
      />

      {/* Consumption History */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Consumption History</h3>
        <div className="space-y-3">
          {consumptionRecords.map((record) => (
            <ConsumptionRecordCard
              key={record.id}
              period={formatBillingPeriodDisplay(
                record.billingPeriod.month,
                record.billingPeriod.year
              )}
              consumptionKwh={record.consumptionKwh}
              limitKwh={record.contractMonthlyLimit}
              exceedsLimit={record.exceedsLimit}
              excessKwh={record.excessKwh}
            />
          ))}
        </div>
      </div>

      {/* Footer Note */}
      {summary.exceededCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> You exceeded the energy limit in{' '}
            {summary.exceededCount} {summary.exceededCount === 1 ? 'month' : 'months'}.
            Additional costs will be charged according to your contract.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentEnergy;
