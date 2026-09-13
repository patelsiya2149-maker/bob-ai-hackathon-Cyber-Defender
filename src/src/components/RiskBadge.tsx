import type { RiskLevel } from '../types';

const CONFIG: Record<RiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: {
    bg: 'bg-red-900/30',
    text: 'text-red-400',
    border: 'border-red-700',
    dot: 'bg-red-500',
  },
  HIGH: {
    bg: 'bg-amber-900/30',
    text: 'text-amber-400',
    border: 'border-amber-700',
    dot: 'bg-amber-500',
  },
  MEDIUM: {
    bg: 'bg-yellow-900/30',
    text: 'text-yellow-400',
    border: 'border-yellow-700',
    dot: 'bg-yellow-500',
  },
  LOW: {
    bg: 'bg-green-900/30',
    text: 'text-green-400',
    border: 'border-green-700',
    dot: 'bg-green-500',
  },
};

interface Props {
  level: RiskLevel;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, showDot = true, size = 'md' }: Props) {
  const c = CONFIG[level];
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${px} ${c.bg} ${c.text} ${c.border}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {level}
    </span>
  );
}
