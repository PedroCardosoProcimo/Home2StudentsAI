import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/components/ui/select';
import { formatBillingPeriodDisplay } from '@/backend/services/energyConsumption';

interface PeriodSelectorProps {
  value: { month: number; year: number };
  onChange: (period: { month: number; year: number }) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: formatBillingPeriodDisplay(d.getMonth() + 1, d.getFullYear()),
        value: `${d.getFullYear()}-${d.getMonth() + 1}`,
      });
    }

    return result;
  }, []);

  return (
    <Select
      value={`${value.year}-${value.month}`}
      onValueChange={(val) => {
        const [year, month] = val.split('-').map(Number);
        onChange({ month, year });
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periods.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
