import type { Severity } from '../types';

const CONFIG: Record<Severity, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-900/40', text: 'text-red-300' },
  high: { bg: 'bg-amber-900/40', text: 'text-amber-300' },
  medium: { bg: 'bg-yellow-900/40', text: 'text-yellow-300' },
  low: { bg: 'bg-green-900/40', text: 'text-green-300' },
};

interface Props {
  severity: Severity;
}

export function SeverityBadge({ severity }: Props) {
  const c = CONFIG[severity];
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${c.bg} ${c.text}`}
    >
      {severity}
    </span>
  );
}
