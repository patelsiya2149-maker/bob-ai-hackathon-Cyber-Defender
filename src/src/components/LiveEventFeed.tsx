import { useEffect, useRef } from 'react';
import { Mail, Link, LogIn, Monitor, Shield, Activity } from 'lucide-react';
import type { FeedEntry, SignalSource } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { RiskBadge } from './RiskBadge';

const SOURCE_ICONS: Record<SignalSource, typeof Mail> = {
  email: Mail,
  url: Link,
  auth: LogIn,
  endpoint: Monitor,
  'threat-intel': Shield,
};

const SOURCE_COLORS: Record<SignalSource, string> = {
  email: 'text-purple-400 bg-purple-900/20',
  url: 'text-blue-400 bg-blue-900/20',
  auth: 'text-amber-400 bg-amber-900/20',
  endpoint: 'text-red-400 bg-red-900/20',
  'threat-intel': 'text-green-400 bg-green-900/20',
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface Props {
  entries: FeedEntry[];
  status: 'idle' | 'running' | 'paused' | 'complete';
}

export function LiveEventFeed({ entries, status }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on new entry (newest is first)
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [entries.length]);

  const isEmpty = entries.length === 0;

  return (
    <div className="rounded-xl border border-shield-border bg-shield-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-shield-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-shield-dim" />
          <span className="text-sm font-semibold text-shield-text">Live Event Feed</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-shield-muted">
          {status === 'running' && (
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Receiving telemetry
            </span>
          )}
          {status === 'paused' && <span className="text-amber-400">Paused</span>}
          {status === 'complete' && <span className="text-blue-400">Stream ended</span>}
          {entries.length > 0 && (
            <span className="text-shield-muted">{entries.length} event{entries.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Feed list */}
      <div ref={listRef} className="overflow-y-auto max-h-72 divide-y divide-shield-border/50">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-shield-muted">
            <Activity className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">
              {status === 'idle' ? 'Click "Start Monitoring" to begin the live event stream.' : 'Waiting for events…'}
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const Icon = SOURCE_ICONS[entry.signalSource];
            const iconColor = SOURCE_COLORS[entry.signalSource];

            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-shield-card/40 transition-colors"
              >
                {/* Source icon */}
                <div className={`rounded-md p-1.5 flex-shrink-0 mt-0.5 ${iconColor}`}>
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium text-shield-text truncate max-w-xs">
                      {entry.signalTitle}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-shield-muted">
                    <SeverityBadge severity={entry.signalSeverity} />
                    <span>→</span>
                    <span className="font-mono text-shield-dim">{entry.incidentId}</span>
                    <span>{entry.isNewIncident ? '🆕 New incident' : '🔗 Correlated'}</span>
                  </div>
                </div>

                {/* Right: risk + time */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <RiskBadge level={entry.riskLevel} size="sm" showDot={false} />
                  <span className="text-xs text-shield-muted font-mono">{formatTime(entry.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
