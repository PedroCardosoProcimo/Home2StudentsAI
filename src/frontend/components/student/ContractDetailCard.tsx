import React from 'react';

interface ContractDetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function ContractDetailCard({
  icon,
  label,
  value,
}: ContractDetailCardProps) {
  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
