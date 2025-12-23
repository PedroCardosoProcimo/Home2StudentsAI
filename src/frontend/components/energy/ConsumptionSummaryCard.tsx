import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Zap, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface ConsumptionSummaryCardProps {
  monthlyLimit: number | null;
  averageConsumption: number;
  exceededCount: number;
  totalRecords: number;
}

/**
 * Summary card displaying key energy consumption metrics
 * Shows monthly limit, average consumption, and exceeded periods count
 */
export function ConsumptionSummaryCard({
  monthlyLimit,
  averageConsumption,
  exceededCount,
  totalRecords,
}: ConsumptionSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Resumo de Consumo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Monthly Limit */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Limite Mensal</span>
            </div>
            <div className="text-2xl font-bold">
              {monthlyLimit !== null ? (
                <>
                  {monthlyLimit} <span className="text-base font-normal">kWh</span>
                </>
              ) : (
                <span className="text-base font-normal text-muted-foreground">
                  Sem limite definido
                </span>
              )}
            </div>
          </div>

          {/* Average Consumption */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Consumo Médio</span>
            </div>
            <div className="text-2xl font-bold">
              {averageConsumption} <span className="text-base font-normal">kWh</span>
            </div>
          </div>

          {/* Times Exceeded */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Limite Excedido</span>
            </div>
            <div className="text-2xl font-bold">
              {exceededCount}{' '}
              <span className="text-base font-normal">
                de {totalRecords} {totalRecords === 1 ? 'mês' : 'meses'}
              </span>
            </div>
            {exceededCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Reveja os períodos em destaque abaixo
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
