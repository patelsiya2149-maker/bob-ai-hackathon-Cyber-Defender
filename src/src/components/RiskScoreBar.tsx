import type { RiskLevel } from '../types';

interface Props {
  score: number;
  riskLevel: RiskLevel;
  showLabel?: boolean;
}

const COLORS: Record<RiskLevel, string> = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-amber-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-600',
};

export function RiskScoreBar({ score, riskLevel, showLabel = true }: Props) {
  const color = COLORS[riskLevel];
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-shield-dim">Risk Score</span>
          <span className="text-2xl font-bold text-shield-text tabular-nums">
            {score}
            <span className="text-sm font-normal text-shield-dim ml-1">/ 100</span>
          </span>
        </div>
      )}
      <div className="h-3 w-full rounded-full bg-shield-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
