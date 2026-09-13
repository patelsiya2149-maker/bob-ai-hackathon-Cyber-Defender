import { Mail, Link, LogIn, Monitor, Shield } from 'lucide-react';
import type { NormalizedSignal, SignalSource } from '../types';
import { SeverityBadge } from './SeverityBadge';

const SOURCE_ICONS: Record<SignalSource, typeof Mail> = {
  email: Mail,
  url: Link,
  auth: LogIn,
  endpoint: Monitor,
  'threat-intel': Shield,
};

const SOURCE_COLORS: Record<SignalSource, string> = {
  email: 'border-purple-700 bg-purple-900/20 text-purple-400',
  url: 'border-blue-700 bg-blue-900/20 text-blue-400',
  auth: 'border-amber-700 bg-amber-900/20 text-amber-400',
  endpoint: 'border-red-700 bg-red-900/20 text-red-400',
  'threat-intel': 'border-green-700 bg-green-900/20 text-green-400',
};

function formatTime(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  });
}

function relativeTime(ts: string, baseTs: string): string {
  const diff = new Date(ts).getTime() - new Date(baseTs).getTime();
  const mins = Math.round(diff / 60000);
  if (mins === 0) return 'T+0';
  if (mins > 0) return `T+${mins}m`;
  return `T${mins}m`;
}

interface Props {
  signals: NormalizedSignal[];
}

export function SignalTimeline({ signals }: Props) {
  const sorted = [...signals].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const baseTs = sorted[0]?.timestamp ?? '';

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-shield-border" />

      <div className="space-y-4">
        {sorted.map((signal, idx) => {
          const Icon = SOURCE_ICONS[signal.source];
          const color = SOURCE_COLORS[signal.source];

          return (
            <div key={signal.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div
                className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-shield-muted">{relativeTime(signal.timestamp, baseTs)}</span>
                  <span className="text-xs text-shield-muted">{formatTime(signal.timestamp)}</span>
                  <SeverityBadge severity={signal.severity} />
                  {idx === 0 && (
                    <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-700 rounded px-1.5 py-0.5">
                      First Signal
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-shield-text">{signal.title}</div>
                <div className="text-xs text-shield-dim mt-0.5 leading-relaxed">{signal.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
