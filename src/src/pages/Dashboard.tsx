import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Activity, AlertTriangle, TrendingUp,
  Play, BookOpen, ShieldAlert, Zap, GitMerge, Brain,
} from 'lucide-react';
import { useSecurityEngine } from '../hooks/useSecurityEngine';
import { useMonitoring } from '../hooks/useMonitoring';
import { StatCard } from '../components/StatCard';
import { IncidentTable } from '../components/IncidentTable';
import { RiskDistributionChart, SignalSourceChart } from '../components/Charts';
import { AnalyzeEventPanel } from '../components/AnalyzeEventPanel';
import { MonitoringControls } from '../components/MonitoringControls';
import { LiveEventFeed } from '../components/LiveEventFeed';
import { SecurityShieldWarning } from '../components/SecurityShieldWarning';

// ─── Landing page shown when status === 'idle' ────────────────────────────────

function LandingPage({ onStart, onLoadDemo }: { onStart: () => void; onLoadDemo: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 space-y-12">

      {/* Hero */}
      <div className="space-y-6 max-w-2xl">
        {/* Shield icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-900/30 border-2 border-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-blue-400" />
            </div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-600/40 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-extrabold text-shield-text tracking-tight">
            AI Security Shield
          </h1>
          <p className="mt-3 text-lg text-shield-dim max-w-xl mx-auto leading-relaxed">
            Intelligent threat detection and correlation. Automatically collects security signals,
            correlates related events, scores risk, and warns you before threats escalate.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-green-700 hover:bg-green-600 text-white text-base font-bold transition-colors shadow-lg shadow-green-900/30 min-w-[200px]"
          >
            <Play className="w-5 h-5" />
            Start Monitoring
          </button>
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-3 px-8 py-4 rounded-xl border border-shield-border hover:bg-shield-card text-shield-dim hover:text-shield-text text-base font-medium transition-colors min-w-[200px]"
          >
            <BookOpen className="w-5 h-5" />
            Load Demo Scenario
          </button>
        </div>

        <p className="text-xs text-shield-muted">
          Simulation only — no real systems, credentials, or networks accessed
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
        {[
          {
            icon: <Zap className="w-5 h-5 text-blue-400" />,
            bg: 'bg-blue-900/20 border-blue-800',
            title: 'Live Signal Ingestion',
            desc: 'Simulated email, URL, auth, endpoint, and threat-intel events arrive in real time',
          },
          {
            icon: <GitMerge className="w-5 h-5 text-purple-400" />,
            bg: 'bg-purple-900/20 border-purple-800',
            title: 'Intelligent Correlation',
            desc: 'Related signals are automatically grouped into incidents by shared indicators',
          },
          {
            icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
            bg: 'bg-amber-900/20 border-amber-800',
            title: 'Transparent Risk Scoring',
            desc: '5-factor 0–100 risk score with plain-English explanation of every point',
          },
          {
            icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
            bg: 'bg-red-900/20 border-red-800',
            title: 'Security Shield Warning',
            desc: 'Automatic HIGH/CRITICAL alert with evidence and recommended defensive action',
          },
          {
            icon: <Brain className="w-5 h-5 text-cyan-400" />,
            bg: 'bg-cyan-900/20 border-cyan-800',
            title: 'AI Investigation Summary',
            desc: 'IBM watsonx.ai generates a concise BLUF analysis for every incident',
          },
          {
            icon: <Activity className="w-5 h-5 text-green-400" />,
            bg: 'bg-green-900/20 border-green-800',
            title: 'MITRE ATT&CK Mapping',
            desc: 'Attack techniques automatically classified from T1566, T1078, T1059 and more',
          },
          {
            icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
            bg: 'bg-blue-900/20 border-blue-800',
            title: 'Preloaded Demo Scenario',
            desc: '5-signal attack chain: phishing → URL → login anomaly → endpoint → threat intel',
          },
          {
            icon: <Zap className="w-5 h-5 text-amber-400" />,
            bg: 'bg-amber-900/20 border-amber-800',
            title: 'Manual Event Analysis',
            desc: 'Paste any simulated event type and run it through the detection engine instantly',
          },
        ].map((f) => (
          <div
            key={f.title}
            className={`rounded-xl border p-4 text-left space-y-2 ${f.bg}`}
          >
            <div className="flex items-center gap-2">
              {f.icon}
              <span className="text-sm font-semibold text-shield-text">{f.title}</span>
            </div>
            <p className="text-xs text-shield-dim leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-shield-muted mb-4">
          How it works
        </p>
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-shield-dim">
          {[
            'Security Signals',
            '→',
            'Normalize',
            '→',
            'Correlate',
            '→',
            'Risk Score',
            '→',
            'Classify',
            '→',
            'AI Summary',
            '→',
            'Shield Warning',
          ].map((step, i) => (
            <span
              key={i}
              className={step === '→'
                ? 'text-shield-muted text-lg'
                : 'px-3 py-1 rounded-full bg-shield-card border border-shield-border text-shield-dim text-xs font-medium'
              }
            >
              {step}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Live dashboard shown when monitoring is active / complete ────────────────

function LiveDashboard({
  monitoring,
  onNavigateToIncident,
}: {
  monitoring: ReturnType<typeof useMonitoring>;
  onNavigateToIncident: (id: string) => void;
}) {
  const { incidents, stats } = useSecurityEngine();

  const topIncident = incidents[0] ?? null;
  const showShieldWarning =
    topIncident !== null &&
    (topIncident.riskLevel === 'HIGH' || topIncident.riskLevel === 'CRITICAL') &&
    monitoring.eventsProcessed > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-shield-text flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            Security Dashboard
          </h1>
          <p className="text-sm text-shield-dim mt-1">
            Real-time overview of security signals, incidents, and threat intelligence.
          </p>
        </div>
      </div>

      {/* Monitoring Controls */}
      <MonitoringControls
        monitoring={monitoring}
        onNavigateToIncident={onNavigateToIncident}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={stats.totalSignals}
          label="Total Signals"
          icon={<Activity className="w-5 h-5" />}
          accent="blue"
          subtitle="All detected security events"
        />
        <StatCard
          value={stats.activeIncidents}
          label="Active Incidents"
          icon={<ShieldCheck className="w-5 h-5" />}
          accent="amber"
          subtitle="Requiring attention"
        />
        <StatCard
          value={stats.highCriticalCount}
          label="High / Critical"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="red"
          subtitle="Immediate action needed"
        />
        <StatCard
          value={stats.totalSignals > 0 ? `${stats.averageRiskScore}/100` : '—'}
          label="Avg Risk Score"
          icon={<TrendingUp className="w-5 h-5" />}
          accent={stats.averageRiskScore >= 76 ? 'red' : stats.averageRiskScore >= 51 ? 'amber' : 'blue'}
          subtitle="Across all incidents"
        />
      </div>

      {/* Auto Security Shield Warning */}
      {showShieldWarning && topIncident && (
        <div>
          <p className="text-xs text-shield-muted mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            AI Security Shield automatically detected a high-risk incident
          </p>
          <SecurityShieldWarning incident={topIncident} />
        </div>
      )}

      {/* Charts */}
      {stats.totalSignals > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RiskDistributionChart stats={stats} />
          <SignalSourceChart stats={stats} />
        </div>
      )}

      {/* Live Event Feed */}
      <LiveEventFeed entries={monitoring.feedEntries} status={monitoring.status} />

      {/* Manual Analyze Panel */}
      <AnalyzeEventPanel onNavigateToIncident={onNavigateToIncident} />

      {/* Incident Table */}
      <div className="rounded-xl border border-shield-border bg-shield-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-shield-border">
          <div>
            <h2 className="text-base font-semibold text-shield-text">Security Incidents</h2>
            <p className="text-xs text-shield-dim mt-0.5">
              {incidents.length > 0
                ? `${incidents.length} incident${incidents.length !== 1 ? 's' : ''} — sorted by risk score`
                : 'Waiting for first incident…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {monitoring.status === 'running' && (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400">Live</span>
              </>
            )}
            {monitoring.status !== 'running' && incidents.length > 0 && (
              <>
                <span className="w-2 h-2 rounded-full bg-shield-muted" />
                <span className="text-xs text-shield-dim">Monitoring paused</span>
              </>
            )}
          </div>
        </div>
        {incidents.length > 0 ? (
          <IncidentTable incidents={incidents} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-shield-muted">
            <Activity className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm">First incident will appear shortly…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root Dashboard ───────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const monitoring = useMonitoring();

  const isIdle = monitoring.status === 'idle';

  if (isIdle) {
    return (
      <LandingPage
        onStart={monitoring.start}
        onLoadDemo={monitoring.loadDemo}
      />
    );
  }

  return (
    <LiveDashboard
      monitoring={monitoring}
      onNavigateToIncident={(id) => navigate(`/incident/${id}`)}
    />
  );
}
