import { ShieldX, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { Incident } from '../types';
import { RiskScoreBar } from './RiskScoreBar';

interface Props {
  incident: Incident;
}

export function SecurityShieldWarning({ incident }: Props) {
  const { riskLevel, riskScore, correlationReasons, recommendedAction } = incident;

  if (riskLevel !== 'HIGH' && riskLevel !== 'CRITICAL') return null;

  const isCritical = riskLevel === 'CRITICAL';

  const headlineText = isCritical
    ? 'CRITICAL THREAT DETECTED'
    : 'HIGH-RISK INTERACTION DETECTED';

  const borderColor = isCritical ? 'border-red-600' : 'border-amber-600';
  const bgGradient = isCritical
    ? 'bg-gradient-to-b from-red-950/80 to-shield-card'
    : 'bg-gradient-to-b from-amber-950/60 to-shield-card';
  const iconColor = isCritical ? 'text-red-400' : 'text-amber-400';
  const headlineColor = isCritical ? 'text-red-300' : 'text-amber-300';
  const badgeBg = isCritical ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-amber-900/50 border-amber-700 text-amber-300';
  const Icon = isCritical ? ShieldX : ShieldAlert;

  // Show up to top 4 correlation reasons as "why" bullets
  const whyReasons = correlationReasons.slice(0, 4);

  // Add signal type summary as bullet points
  const signalTitles = incident.signals
    .slice(0, 4)
    .map((s) => s.title);

  return (
    <div
      className={`rounded-xl border-2 ${borderColor} ${bgGradient} overflow-hidden mb-8`}
      role="alert"
      aria-label="Security Shield Warning"
    >
      {/* Top bar */}
      <div
        className={`flex items-center gap-2 px-5 py-2.5 border-b ${borderColor} ${isCritical ? 'bg-red-900/40' : 'bg-amber-900/30'}`}
      >
        <span className={`text-xs font-mono font-bold tracking-widest uppercase ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
          ⚠ AI Security Shield — Active Alert
        </span>
        <span className={`ml-auto text-xs border rounded-full px-2 py-0.5 font-semibold ${badgeBg}`}>
          {riskLevel}
        </span>
      </div>

      <div className="p-6">
        {/* Icon + Headline */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`p-3 rounded-full border-2 ${borderColor} ${isCritical ? 'bg-red-900/30' : 'bg-amber-900/30'} flex-shrink-0 ${isCritical ? 'animate-pulse' : ''}`}
          >
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold tracking-wide uppercase ${headlineColor}`}>
              {headlineText}
            </h2>
            <p className="text-sm text-shield-dim mt-1">
              AI Security Shield has detected a correlated threat pattern requiring immediate attention.
            </p>
          </div>
        </div>

        {/* Risk Score Bar */}
        <div className="mb-6">
          <RiskScoreBar score={riskScore} riskLevel={riskLevel} showLabel />
        </div>

        {/* Two columns: Why + Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Why is this risky */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-shield-muted mb-2">
              Why This Is Flagged
            </div>
            <ul className="space-y-1.5">
              {signalTitles.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-shield-dim">
                  <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Correlation reasons */}
          {whyReasons.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-shield-muted mb-2">
                Correlation Evidence
              </div>
              <ul className="space-y-1.5">
                {whyReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-shield-dim">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommended Action */}
        <div className={`rounded-lg border ${borderColor} ${isCritical ? 'bg-red-950/40' : 'bg-amber-950/30'} p-4`}>
          <div className="text-xs font-semibold uppercase tracking-widest text-shield-muted mb-2">
            Recommended Immediate Action
          </div>
          <p className={`text-sm font-medium ${headlineColor} leading-relaxed`}>{recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}
