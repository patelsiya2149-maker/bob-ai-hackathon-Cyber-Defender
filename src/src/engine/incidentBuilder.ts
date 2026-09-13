import type { Incident, CorrelatedGroup, ScoreBreakdown, TechniqueTag, RiskLevel } from '../types';

// Module-scoped counter; reset on each pipeline run via the exported factory
let incidentCounter = 0;

export function resetIncidentCounter(): void {
  incidentCounter = 0;
}

function buildTitle(group: CorrelatedGroup): string {
  // Use the most severe signal's title, or compose from user/device
  const sorted = [...group.signals].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
  const topSignal = sorted[0];
  const user = group.signals.find((s) => s.indicators.user)?.indicators.user;
  const device = group.signals.find((s) => s.indicators.device)?.indicators.device;

  if (group.signals.length === 1) return topSignal.title;

  const entity = user ?? device ?? 'Unknown Entity';
  return `Multi-Signal Incident — ${entity}`;
}

function buildRecommendedAction(group: CorrelatedGroup, riskLevel: RiskLevel): string {
  const user = group.signals.find((s) => s.indicators.user)?.indicators.user;
  const device = group.signals.find((s) => s.indicators.device)?.indicators.device;
  const ip = group.signals.find((s) => s.indicators.ip)?.indicators.ip;

  const actions: string[] = [];

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    if (ip) actions.push(`Block IP ${ip} at the firewall immediately.`);
    if (user) actions.push(`Lock account ${user} and force password reset.`);
    if (device) actions.push(`Isolate device ${device} from the network.`);
    actions.push('Escalate to the security team for immediate investigation.');
  } else if (riskLevel === 'MEDIUM') {
    if (user) actions.push(`Review recent activity for ${user}.`);
    if (ip) actions.push(`Monitor and consider blocking IP ${ip}.`);
    actions.push('Investigate the flagged signals and verify with the affected user.');
  } else {
    actions.push('Monitor the activity and review if the pattern continues.');
    actions.push('No immediate action required, but log for audit trail.');
  }

  return actions.join(' ');
}

export function buildIncident(
  group: CorrelatedGroup,
  scoreBreakdown: ScoreBreakdown,
  techniques: TechniqueTag[],
  riskLevel: RiskLevel
): Incident {
  const id = `INC-${String(++incidentCounter).padStart(4, '0')}`;

  // Use the earliest signal timestamp as incident creation time
  const timestamps = group.signals.map((s) => new Date(s.timestamp).getTime());
  const createdAt = new Date(Math.min(...timestamps)).toISOString();

  return {
    id,
    title: buildTitle(group),
    createdAt,
    signals: group.signals,
    riskScore: scoreBreakdown.total,
    riskLevel,
    scoreBreakdown,
    correlationReasons: group.correlationReasons,
    techniques,
    status: 'active',
    aiSummary: '', // Filled later by the AI summary engine
    recommendedAction: buildRecommendedAction(group, riskLevel),
  };
}
