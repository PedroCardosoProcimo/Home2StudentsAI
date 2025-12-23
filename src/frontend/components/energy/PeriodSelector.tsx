import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/components/ui/select';
import { formatBillingPeriodDisplay } from '@/backend/services/energyConsumption';

interface PeriodSelectorProps {
  value: { month: number; year: number };
  onChange: (period: { month: number; year: number }) => void;
  /** If true, allows selecting any year and month instead of just the last 12 months */
  allowAnyPeriod?: boolean;
}

export function PeriodSelector({ value, onChange, allowAnyPeriod = false }: PeriodSelectorProps) {
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

  // Generate years from 2020 to current year + 1
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const endYear = currentYear + 1;
    const result = [];
    for (let year = endYear; year >= startYear; year--) {
      result.push(year);
    }
    return result;
  }, []);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  if (allowAnyPeriod) {
    return (
      <div className="flex gap-2">
        <Select
          value={String(value.month)}
          onValueChange={(val) => onChange({ month: Number(val), year: value.year })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(value.year)}
          onValueChange={(val) => onChange({ month: value.month, year: Number(val) })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

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
