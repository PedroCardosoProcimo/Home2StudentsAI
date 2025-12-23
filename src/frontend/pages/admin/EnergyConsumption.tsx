import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { PeriodSelector } from '@/frontend/components/energy/PeriodSelector';
import {
  getConsumptionByResidence,
  calculateSummary,
  formatBillingPeriodDisplay,
} from '@/backend/services/energyConsumption';
import { useAdminResidences } from '@/backend/hooks/admin/useAdminResidences';
import { findContractForRoom } from '@/backend/services/contracts';
import type { EnergyConsumption } from '@/shared/types/energy';

type PeriodFilter = 'specific' | 'last3' | 'last6' | 'all';

export default function EnergyConsumption() {
  const navigate = useNavigate();
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('specific');
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch residences
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();

  // Fetch consumption records
  const { data: consumptionRecords = [], isLoading } = useQuery({
    queryKey: ['energy-consumption', selectedResidenceId, periodFilter === 'specific' ? selectedPeriod : periodFilter],
    queryFn: async () => {
      if (!selectedResidenceId) return [];
      // For specific period, filter by month/year; otherwise get all and filter on frontend
      const records = await getConsumptionByResidence(
        selectedResidenceId,
        periodFilter === 'specific' ? {
          month: selectedPeriod.month,
          year: selectedPeriod.year,
        } : undefined
      );
      
      // Enrich records with contract info if missing
      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          // If record already has student info, return as is
          if (record.studentId) {
            return record;
          }
          
          // Try to find contract for this room/period
          try {
            const contractInfo = await findContractForRoom(
              record.residenceId,
              record.roomNumber,
              record.billingPeriod.month,
              record.billingPeriod.year
            );
            
            if (contractInfo) {
              // Enrich the record with contract info
              return {
                ...record,
                contractId: contractInfo.contractId,
                studentId: contractInfo.studentId,
                studentName: contractInfo.studentName,
                studentEmail: contractInfo.studentEmail,
                contractMonthlyLimit: contractInfo.monthlyKwhLimit,
                // Recalculate limit comparison
                exceedsLimit: record.consumptionKwh > contractInfo.monthlyKwhLimit,
                excessKwh: record.consumptionKwh > contractInfo.monthlyKwhLimit
                  ? record.consumptionKwh - contractInfo.monthlyKwhLimit
                  : null,
              } as EnergyConsumption;
            }
          } catch (error) {
            console.error('Error enriching consumption record:', error);
          }
          
          return record;
        })
      );
      
      return enrichedRecords;
    },
    enabled: !!selectedResidenceId,
  });

  // Filter by period and search query
  const filteredRecords = useMemo(() => {
    let records = consumptionRecords;

    // Apply time period filter (only for non-specific filters)
    if (periodFilter !== 'specific' && records.length > 0) {
      const now = new Date();
      const cutoffDate = new Date();

      if (periodFilter === 'last3') {
        cutoffDate.setMonth(now.getMonth() - 3);
      } else if (periodFilter === 'last6') {
        cutoffDate.setMonth(now.getMonth() - 6);
      }
      // For 'all', don't filter by date

      if (periodFilter !== 'all') {
        records = records.filter(record => {
          const recordDate = new Date(record.billingPeriod.year, record.billingPeriod.month - 1);
          return recordDate >= cutoffDate;
        });
      }
    }

    // Apply search query filter (case insensitive with accent normalization)
    if (searchQuery.trim()) {
      const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const queryNormalized = normalizeText(searchQuery.trim());
      records = records.filter(
        (record) =>
          normalizeText(record.roomNumber).includes(queryNormalized) ||
          (record.studentName && normalizeText(record.studentName).includes(queryNormalized)) ||
          (record.studentEmail && normalizeText(record.studentEmail).includes(queryNormalized))
      );
    }

    return records;
  }, [consumptionRecords, periodFilter, searchQuery]);

  // Calculate summary
  const summary = useMemo(
    () => calculateSummary(filteredRecords),
    [filteredRecords]
  );

  const getStatusBadge = (record: typeof consumptionRecords[0]) => {
    if (!record.studentId) {
      return (
        <Badge variant="secondary" className="gap-1">
          ℹ️ No contract
        </Badge>
      );
    }

    if (record.exceedsLimit) {
      return (
        <Badge className="gap-1 bg-red-100 text-red-800 border-red-200">
          +{record.excessKwh} kWh
        </Badge>
      );
    }

    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-emerald-200">
        Within limit
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Energy Consumption</h1>
        <Button onClick={() => navigate('/admin/energy/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Register Consumption
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedResidenceId} onValueChange={setSelectedResidenceId}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Select residence" />
              </SelectTrigger>
              <SelectContent>
                {residences.map((residence) => (
                  <SelectItem key={residence.id} value={residence.id}>
                    {residence.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific">Specific Month</SelectItem>
                <SelectItem value="last3">Last 3 Months</SelectItem>
                <SelectItem value="last6">Last 6 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            {periodFilter === 'specific' && (
              <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
            )}

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by room or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Consumption Records
            {periodFilter === 'specific' && ` - ${formatBillingPeriodDisplay(selectedPeriod.month, selectedPeriod.year)}`}
            {periodFilter === 'last3' && ' - Last 3 Months'}
            {periodFilter === 'last6' && ' - Last 6 Months'}
            {periodFilter === 'all' && ' - All Time'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {selectedResidenceId
                ? 'No records found for this period'
                : 'Select a residence to view consumption'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Room</th>
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-right py-3 px-4">kWh</th>
                      <th className="text-right py-3 px-4">Limit</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{record.roomNumber}</td>
                        <td className="py-3 px-4">{record.studentName || '—'}</td>
                        <td className="py-3 px-4">
                          {formatBillingPeriodDisplay(
                            record.billingPeriod.month,
                            record.billingPeriod.year
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {record.consumptionKwh}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {record.contractMonthlyLimit || '—'}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(record)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Total records: </span>
                  <span className="font-semibold">{summary.totalRecords}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Exceeded limit: </span>
                  <span className="font-semibold text-destructive">
                    {summary.exceededCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pending notifications: </span>
                  <span className="font-semibold text-warning">
                    {summary.pendingNotifications}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
