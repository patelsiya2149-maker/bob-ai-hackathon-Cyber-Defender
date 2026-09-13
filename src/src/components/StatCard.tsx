import { type ReactNode } from 'react';

interface Props {
  value: string | number;
  label: string;
  icon: ReactNode;
  accent?: 'red' | 'amber' | 'blue' | 'green';
  subtitle?: string;
}

const ACCENT: Record<string, string> = {
  red: 'text-red-400 bg-red-900/20',
  amber: 'text-amber-400 bg-amber-900/20',
  blue: 'text-blue-400 bg-blue-900/20',
  green: 'text-green-400 bg-green-900/20',
};

export function StatCard({ value, label, icon, accent = 'blue', subtitle }: Props) {
  const accentClass = ACCENT[accent];
  return (
    <div className="rounded-xl border border-shield-border bg-shield-card p-5 flex items-start gap-4">
      <div className={`rounded-lg p-2.5 ${accentClass}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-shield-text tabular-nums">{value}</div>
        <div className="text-sm text-shield-dim mt-0.5">{label}</div>
        {subtitle && <div className="text-xs text-shield-muted mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
