import { useNavigate } from 'react-router-dom';
import { ChevronRight, Activity } from 'lucide-react';
import type { Incident } from '../types';
import { RiskBadge } from './RiskBadge';
import { RiskScoreBar } from './RiskScoreBar';

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  incidents: Incident[];
}

export function IncidentTable({ incidents }: Props) {
  const navigate = useNavigate();

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-shield-muted">
        <Activity className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No incidents detected</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-shield-border text-left">
            {['Incident', 'Risk Score', 'Level', 'Signals', 'Created', 'Status'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-shield-muted"
              >
                {h}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-shield-border/50">
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              onClick={() => navigate(`/incident/${incident.id}`)}
              className="hover:bg-shield-card/60 cursor-pointer transition-colors group"
            >
              <td className="px-4 py-4">
                <div className="font-medium text-shield-text group-hover:text-blue-400 transition-colors">
                  {incident.title}
                </div>
                <div className="text-xs text-shield-muted font-mono mt-0.5">{incident.id}</div>
              </td>
              <td className="px-4 py-4 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-shield-text tabular-nums w-8">
                    {incident.riskScore}
                  </span>
                  <div className="flex-1">
                    <RiskScoreBar
                      score={incident.riskScore}
                      riskLevel={incident.riskLevel}
                      showLabel={false}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <RiskBadge level={incident.riskLevel} size="sm" />
              </td>
              <td className="px-4 py-4 text-shield-dim tabular-nums">
                {incident.signals.length}
              </td>
              <td className="px-4 py-4 text-shield-muted text-xs whitespace-nowrap">
                {formatDate(incident.createdAt)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`text-xs rounded-full px-2.5 py-1 font-medium ${
                    incident.status === 'active'
                      ? 'bg-red-900/30 text-red-400 border border-red-800'
                      : incident.status === 'investigating'
                      ? 'bg-amber-900/30 text-amber-400 border border-amber-800'
                      : 'bg-green-900/30 text-green-400 border border-green-800'
                  }`}
                >
                  {incident.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <ChevronRight className="w-4 h-4 text-shield-muted group-hover:text-blue-400 transition-colors" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
