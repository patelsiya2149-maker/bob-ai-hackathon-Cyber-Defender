import { Play, Pause, RotateCcw, BookOpen, Radio, CheckCircle2, CirclePause } from 'lucide-react';
import type { MonitoringState } from '../hooks/useMonitoring';
import { RiskBadge } from './RiskBadge';

interface Props {
  monitoring: MonitoringState;
  onNavigateToIncident: (id: string) => void;
}

export function MonitoringControls({ monitoring, onNavigateToIncident }: Props) {
  const { status, eventsProcessed, totalEvents, latestCriticalIncident, start, pause, resume, reset, loadDemo } = monitoring;

  const progressPct = totalEvents > 0 ? Math.round((eventsProcessed / totalEvents) * 100) : 0;

  const statusConfig = {
    idle:     { label: 'Monitoring Stopped',  dot: 'bg-shield-muted',  text: 'text-shield-muted' },
    running:  { label: 'Monitoring Active',   dot: 'bg-green-500 animate-pulse', text: 'text-green-400' },
    paused:   { label: 'Monitoring Paused',   dot: 'bg-amber-500',    text: 'text-amber-400' },
    complete: { label: 'Stream Complete',     dot: 'bg-blue-500',     text: 'text-blue-400' },
  };
  const cfg = statusConfig[status];

  return (
    <div className="rounded-xl border border-shield-border bg-shield-surface overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-shield-border">
        {/* Left: status + stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
          </div>
          {(status === 'running' || status === 'paused' || status === 'complete') && (
            <span className="text-xs text-shield-muted font-mono">
              {eventsProcessed} / {totalEvents} events
            </span>
          )}
          {status === 'complete' && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Stream complete
            </span>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {status === 'idle' || status === 'complete' ? (
            <button
              onClick={start}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Start Monitoring
            </button>
          ) : status === 'running' ? (
            <button
              onClick={pause}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          ) : /* paused */ (
            <button
              onClick={resume}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Resume
            </button>
          )}

          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-shield-border hover:bg-shield-card text-shield-dim text-sm transition-colors"
            title="Clear all signals and reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={loadDemo}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-shield-border hover:bg-shield-card text-shield-dim text-sm transition-colors"
            title="Load the preloaded demo scenario"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Load Demo Scenario
          </button>
        </div>
      </div>

      {/* Progress bar (only visible when active) */}
      {(status === 'running' || status === 'paused' || status === 'complete') && (
        <div className="px-5 py-3 border-b border-shield-border bg-shield-card/40">
          <div className="flex items-center gap-3">
            {status === 'running' ? (
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse flex-shrink-0" />
            ) : status === 'paused' ? (
              <CirclePause className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            )}
            <div className="flex-1 h-1.5 bg-shield-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === 'complete' ? 'bg-blue-500' : status === 'paused' ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-shield-muted tabular-nums w-8 text-right">{progressPct}%</span>
          </div>
        </div>
      )}

      {/* Highest-risk incident callout */}
      {latestCriticalIncident && (status === 'running' || status === 'paused' || status === 'complete') && (
        <div className="px-5 py-3 flex flex-wrap items-center gap-3 bg-red-950/20 border-b border-red-900/40">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold text-red-300">Highest Risk Incident Detected</span>
          <RiskBadge level={latestCriticalIncident.riskLevel} size="sm" />
          <span className="text-xs text-red-300 font-mono">{latestCriticalIncident.id}</span>
          <span className="text-xs text-shield-muted">·</span>
          <span className="text-xs text-red-300">{latestCriticalIncident.riskScore}/100</span>
          <button
            onClick={() => onNavigateToIncident(latestCriticalIncident.id)}
            className="ml-auto text-xs text-red-400 hover:text-red-300 underline transition-colors"
          >
            View incident →
          </button>
        </div>
      )}
    </div>
  );
}
