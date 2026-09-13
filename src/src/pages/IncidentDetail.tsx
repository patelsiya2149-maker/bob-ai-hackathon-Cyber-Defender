import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Link2 } from 'lucide-react';
import type { Incident } from '../types';
import { useSecurityEngine } from '../hooks/useSecurityEngine';
import { useIncidentSummary } from '../hooks/useIncidentSummary';
import { SecurityShieldWarning } from '../components/SecurityShieldWarning';
import { AIExplanationPanel } from '../components/AIExplanationPanel';
import { RecommendedActionBox } from '../components/RecommendedActionBox';
import { RiskScoreBar } from '../components/RiskScoreBar';
import { RiskBadge } from '../components/RiskBadge';
import { TechniqueBadge } from '../components/TechniqueBadge';
import { SignalCard } from '../components/SignalCard';
import { SignalTimeline } from '../components/SignalTimeline';

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IncidentFound({ incident }: { incident: Incident }) {
  const navigate = useNavigate();
  const { summary, loading, error } = useIncidentSummary(incident);

  return (
    <div className="space-y-8">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-shield-dim hover:text-shield-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-shield-text leading-tight">{incident.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-shield-muted">
              <span className="font-mono text-shield-dim">{incident.id}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(incident.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {incident.signals.length} correlated signal{incident.signals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={incident.riskLevel} />
            <span
              className={`text-xs rounded-full px-2.5 py-1 font-medium border ${
                incident.status === 'active'
                  ? 'bg-red-900/30 text-red-400 border-red-800'
                  : 'bg-amber-900/30 text-amber-400 border-amber-800'
              }`}
            >
              {incident.status}
            </span>
          </div>
        </div>
      </div>

      {/* Security Shield Warning — the money shot */}
      <SecurityShieldWarning incident={incident} />

      {/* AI Explanation — prominent, before raw data */}
      <AIExplanationPanel summary={summary} loading={loading} error={error} />

      {/* Recommended Action */}
      <RecommendedActionBox action={incident.recommendedAction} />

      {/* Risk Score Breakdown */}
      <div className="rounded-xl border border-shield-border bg-shield-card p-6">
        <h2 className="text-base font-semibold text-shield-text mb-5">Risk Score Breakdown</h2>
        <div className="mb-5">
          <RiskScoreBar score={incident.riskScore} riskLevel={incident.riskLevel} showLabel />
        </div>
        <ul className="space-y-2.5">
          {incident.scoreBreakdown.explanations.map((exp, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-shield-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
              {exp}
            </li>
          ))}
        </ul>
      </div>

      {/* Techniques */}
      {incident.techniques.length > 0 && (
        <div className="rounded-xl border border-shield-border bg-shield-card p-6">
          <h2 className="text-base font-semibold text-shield-text mb-4">
            Attack Techniques Identified
          </h2>
          <div className="flex flex-wrap gap-3">
            {incident.techniques.map((t) => (
              <TechniqueBadge key={t.id} technique={t} />
            ))}
          </div>
        </div>
      )}

      {/* Correlation Reasons */}
      {incident.correlationReasons.length > 0 && (
        <div className="rounded-xl border border-shield-border bg-shield-card p-6">
          <h2 className="text-base font-semibold text-shield-text mb-4">Correlation Evidence</h2>
          <ul className="space-y-2">
            {incident.correlationReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-shield-dim">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Signal Timeline */}
      <div className="rounded-xl border border-shield-border bg-shield-card p-6">
        <h2 className="text-base font-semibold text-shield-text mb-6">Attack Timeline</h2>
        <SignalTimeline signals={incident.signals} />
      </div>

      {/* Individual Signal Cards */}
      <div className="rounded-xl border border-shield-border bg-shield-card p-6">
        <h2 className="text-base font-semibold text-shield-text mb-5">
          Correlated Signals ({incident.signals.length})
        </h2>
        <div className="space-y-3">
          {incident.signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function IncidentContent({ incidentId }: { incidentId: string }) {
  const { incidents } = useSecurityEngine();
  const navigate = useNavigate();
  const incident = incidents.find((i) => i.id === incidentId);

  if (!incident) {
    return (
      <div className="text-center py-24">
        <p className="text-shield-muted text-lg">Incident not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-blue-400 hover:underline"
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  return <IncidentFound incident={incident} />;
}

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="text-center py-24 text-shield-muted">
        Invalid incident ID.
      </div>
    );
  }

  return <IncidentContent incidentId={id} />;
}
