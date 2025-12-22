import { useState, useMemo, useEffect } from 'react';
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

export default function EnergyConsumption() {
  const navigate = useNavigate();
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch residences
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();

  // Fetch consumption records
  const { data: consumptionRecords = [], isLoading } = useQuery({
    queryKey: ['energy-consumption', selectedResidenceId, selectedPeriod],
    queryFn: async () => {
      if (!selectedResidenceId) return [];
      const records = await getConsumptionByResidence(selectedResidenceId, {
        month: selectedPeriod.month,
        year: selectedPeriod.year,
      });
      
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

  // Filter by search query (case insensitive)
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return consumptionRecords;

    const query = searchQuery.toLowerCase().trim();
    return consumptionRecords.filter(
      (record) =>
        record.roomNumber.toLowerCase().includes(query) ||
        record.studentName?.toLowerCase().includes(query) ||
        record.studentEmail?.toLowerCase().includes(query)
    );
  }, [consumptionRecords, searchQuery]);

  // Calculate summary
  const summary = useMemo(
    () => calculateSummary(filteredRecords),
    [filteredRecords]
  );

  const getStatusBadge = (record: typeof consumptionRecords[0]) => {
    if (!record.studentId) {
      return (
        <Badge variant="secondary" className="gap-1">
          ℹ️ Sem contrato
        </Badge>
      );
    }

    if (record.exceedsLimit) {
      return (
        <Badge variant="destructive" className="gap-1">
          ⚠️ +{record.excessKwh} kWh
        </Badge>
      );
    }

    return (
      <Badge variant="success" className="gap-1">
        ✅ Dentro do limite
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Consumo de Energia</h1>
        <Button onClick={() => navigate('/admin/energy/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Registar Consumo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Select value={selectedResidenceId} onValueChange={setSelectedResidenceId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecionar residência" />
              </SelectTrigger>
              <SelectContent>
                {residences.map((residence) => (
                  <SelectItem key={residence.id} value={residence.id}>
                    {residence.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por quarto ou estudante..."
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
            Registos de Consumo -{' '}
            {formatBillingPeriodDisplay(selectedPeriod.month, selectedPeriod.year)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">A carregar...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {selectedResidenceId
                ? 'Nenhum registo encontrado para este período'
                : 'Selecione uma residência para ver os consumos'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Quarto</th>
                      <th className="text-left py-3 px-4">Estudante</th>
                      <th className="text-left py-3 px-4">Período</th>
                      <th className="text-right py-3 px-4">kWh</th>
                      <th className="text-right py-3 px-4">Limite</th>
                      <th className="text-left py-3 px-4">Estado</th>
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
                  <span className="text-muted-foreground">Total de registos: </span>
                  <span className="font-semibold">{summary.totalRecords}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Excederam limite: </span>
                  <span className="font-semibold text-destructive">
                    {summary.exceededCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Notificações pendentes: </span>
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
