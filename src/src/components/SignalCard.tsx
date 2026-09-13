import { Mail, Link, LogIn, Monitor, Shield } from 'lucide-react';
import type { NormalizedSignal, SignalSource } from '../types';
import { SeverityBadge } from './SeverityBadge';

const SOURCE_CONFIG: Record<
  SignalSource,
  { icon: typeof Mail; label: string; color: string }
> = {
  email: { icon: Mail, label: 'Email', color: 'text-purple-400 bg-purple-900/20' },
  url: { icon: Link, label: 'URL', color: 'text-blue-400 bg-blue-900/20' },
  auth: { icon: LogIn, label: 'Auth', color: 'text-amber-400 bg-amber-900/20' },
  endpoint: { icon: Monitor, label: 'Endpoint', color: 'text-red-400 bg-red-900/20' },
  'threat-intel': { icon: Shield, label: 'Threat Intel', color: 'text-green-400 bg-green-900/20' },
};

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  signal: NormalizedSignal;
}

export function SignalCard({ signal }: Props) {
  const cfg = SOURCE_CONFIG[signal.source];
  const Icon = cfg.icon;

  const indicators = Object.entries(signal.indicators)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);

  return (
    <div className="rounded-lg border border-shield-border bg-shield-card/60 p-4">
      <div className="flex items-start gap-3">
        <div className={`rounded-md p-2 flex-shrink-0 ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-shield-dim">
              {cfg.label}
            </span>
            <SeverityBadge severity={signal.severity} />
            <span className="text-xs text-shield-muted ml-auto">{formatTimestamp(signal.timestamp)}</span>
          </div>
          <div className="text-sm font-semibold text-shield-text mb-1">{signal.title}</div>
          <div className="text-xs text-shield-dim leading-relaxed mb-2">{signal.description}</div>
          {indicators.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {indicators.map((ind) => (
                <span
                  key={ind}
                  className="text-xs bg-shield-border/60 text-shield-dim rounded px-2 py-0.5 font-mono"
                >
                  {ind}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
