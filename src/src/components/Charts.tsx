import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DashboardStats } from '../types';

const COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#d97706',
  MEDIUM: '#ca8a04',
  LOW: '#16a34a',
};

interface Props {
  stats: DashboardStats;
}

export function RiskDistributionChart({ stats }: Props) {
  const data = stats.riskDistribution.map((d) => ({
    name: d.level,
    value: d.count,
    fill: COLORS[d.level],
  }));

  return (
    <div className="rounded-xl border border-shield-border bg-shield-card p-5">
      <div className="text-sm font-semibold text-shield-dim mb-4">Risk Distribution</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141d35',
              border: '1px solid #1e2d4a',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Incidents">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SignalSourceChart({ stats }: Props) {
  const data = stats.signalsBySource.map((d) => ({
    name: d.source === 'threat-intel' ? 'TI' : d.source.charAt(0).toUpperCase() + d.source.slice(1),
    value: d.count,
  }));

  return (
    <div className="rounded-xl border border-shield-border bg-shield-card p-5">
      <div className="text-sm font-semibold text-shield-dim mb-4">Signals by Source</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141d35',
              border: '1px solid #1e2d4a',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
