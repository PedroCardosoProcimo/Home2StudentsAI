import { Card, CardContent } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { Progress } from '@/frontend/components/ui/progress';
import { Calendar } from 'lucide-react';
import { cn } from '@/frontend/lib/utils';

interface ConsumptionRecordCardProps {
  period: string;           // e.g., "janeiro de 2025"
  consumptionKwh: number;
  limitKwh: number | null;
  exceedsLimit: boolean;
  excessKwh: number | null; // Only if exceeded
}

/**
 * Card component to display a single energy consumption record
 * Shows consumption vs limit with visual indicators and progress bar
 */
export function ConsumptionRecordCard({
  period,
  consumptionKwh,
  limitKwh,
  exceedsLimit,
  excessKwh,
}: ConsumptionRecordCardProps) {
  // Calculate percentage for progress bar (cap at 100%)
  const percentage = limitKwh
    ? Math.min((consumptionKwh / limitKwh) * 100, 100)
    : 0;

  // Determine card styling based on status
  const cardClassName = cn(
    'transition-colors',
    exceedsLimit
      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
      : 'border-border bg-card'
  );

  return (
    <Card className={cardClassName}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header: Period and Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium capitalize">{period}</span>
            </div>
            {exceedsLimit ? (
              <Badge variant="destructive" className="gap-1">
                ⚠️ +{excessKwh} kWh
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="gap-1 bg-green-600 hover:bg-green-700"
              >
                ✅ Dentro do limite
              </Badge>
            )}
          </div>

          {/* Consumption Display */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold font-mono">
                {consumptionKwh}
              </span>
              <span className="text-sm text-muted-foreground">
                {limitKwh ? `/ ${limitKwh} kWh` : 'kWh'}
              </span>
            </div>

            {/* Progress Bar */}
            {limitKwh && (
              <>
                <Progress
                  value={percentage}
                  className={cn(
                    'h-2',
                    exceedsLimit ? 'bg-amber-200' : 'bg-secondary'
                  )}
                  style={
                    exceedsLimit
                      ? {
                          // Override progress indicator color for exceeded state
                          // @ts-ignore - CSS custom property
                          '--progress-indicator-color': 'rgb(245 158 11)', // amber-500
                        }
                      : undefined
                  }
                />
                <div className="mt-1 text-xs text-muted-foreground text-right">
                  {percentage.toFixed(0)}% do limite
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
