import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { useSecurityEngine } from '../hooks/useSecurityEngine';
import { useMonitoring } from '../hooks/useMonitoring';
import { StatCard } from '../components/StatCard';
import { IncidentTable } from '../components/IncidentTable';
import { RiskDistributionChart, SignalSourceChart } from '../components/Charts';
import { AnalyzeEventPanel } from '../components/AnalyzeEventPanel';
import { MonitoringControls } from '../components/MonitoringControls';
import { LiveEventFeed } from '../components/LiveEventFeed';
import { SecurityShieldWarning } from '../components/SecurityShieldWarning';

export function Dashboard() {
  const navigate = useNavigate();
  const { incidents, stats } = useSecurityEngine();
  const monitoring = useMonitoring();

  // Show the Shield Warning inline on the dashboard when monitoring surfaces a HIGH/CRITICAL incident
  const topIncident = incidents[0] ?? null;
  const showShieldWarning =
    topIncident !== null &&
    (topIncident.riskLevel === 'HIGH' || topIncident.riskLevel === 'CRITICAL') &&
    (monitoring.status === 'running' || monitoring.status === 'paused' || monitoring.status === 'complete') &&
    monitoring.eventsProcessed > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-shield-text flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          Security Dashboard
        </h1>
        <p className="text-sm text-shield-dim mt-1">
          Real-time overview of security signals, incidents, and threat intelligence.
        </p>
      </div>

      {/* ── Monitoring Controls — top of page ─────────────────────────────── */}
      <MonitoringControls
        monitoring={monitoring}
        onNavigateToIncident={(id) => navigate(`/incident/${id}`)}
      />

      {/* Stat cards — update reactively as signals arrive */}
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

      {/* ── Auto Security Shield Warning ───────────────────────────────────── */}
      {showShieldWarning && topIncident && (
        <div>
          <p className="text-xs text-shield-muted mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            AI Security Shield automatically detected a high-risk incident during monitoring
          </p>
          <SecurityShieldWarning incident={topIncident} />
        </div>
      )}

      {/* Charts — update as signals arrive */}
      {stats.totalSignals > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RiskDistributionChart stats={stats} />
          <SignalSourceChart stats={stats} />
        </div>
      )}

      {/* ── Live Event Feed ────────────────────────────────────────────────── */}
      <LiveEventFeed entries={monitoring.feedEntries} status={monitoring.status} />

      {/* ── Manual Analyze Event Panel ─────────────────────────────────────── */}
      <AnalyzeEventPanel onNavigateToIncident={(id) => navigate(`/incident/${id}`)} />

      {/* Incident Table */}
      <div className="rounded-xl border border-shield-border bg-shield-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-shield-border">
          <div>
            <h2 className="text-base font-semibold text-shield-text">Security Incidents</h2>
            <p className="text-xs text-shield-dim mt-0.5">
              {incidents.length > 0
                ? `${incidents.length} incident${incidents.length !== 1 ? 's' : ''} — sorted by risk score`
                : 'No incidents yet — start monitoring or load the demo scenario'}
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
                <span className="text-xs text-shield-dim">Monitoring stopped</span>
              </>
            )}
          </div>
        </div>
        {incidents.length > 0 ? (
          <IncidentTable incidents={incidents} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-shield-muted">
            <Activity className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Click <strong className="text-shield-dim">Start Monitoring</strong> or <strong className="text-shield-dim">Load Demo Scenario</strong> to see incidents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
