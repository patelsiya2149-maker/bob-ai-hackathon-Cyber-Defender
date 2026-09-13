import { ShieldCheck, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { useSecurityEngine } from '../hooks/useSecurityEngine';
import { StatCard } from '../components/StatCard';
import { IncidentTable } from '../components/IncidentTable';
import { RiskDistributionChart, SignalSourceChart } from '../components/Charts';

export function Dashboard() {
  const { incidents, stats } = useSecurityEngine();

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
          value={`${stats.averageRiskScore}/100`}
          label="Avg Risk Score"
          icon={<TrendingUp className="w-5 h-5" />}
          accent={stats.averageRiskScore >= 76 ? 'red' : stats.averageRiskScore >= 51 ? 'amber' : 'blue'}
          subtitle="Across all incidents"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskDistributionChart stats={stats} />
        <SignalSourceChart stats={stats} />
      </div>

      {/* Incident Table */}
      <div className="rounded-xl border border-shield-border bg-shield-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-shield-border">
          <div>
            <h2 className="text-base font-semibold text-shield-text">Security Incidents</h2>
            <p className="text-xs text-shield-dim mt-0.5">
              {incidents.length} incident{incidents.length !== 1 ? 's' : ''} — sorted by risk score
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-shield-dim">Live monitoring</span>
          </div>
        </div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
