import type { CorrelatedGroup, ScoreBreakdown, RiskLevel, Severity } from '../types';

const SEVERITY_SCORES: Record<Severity, number> = {
  critical: 30,
  high: 22,
  medium: 12,
  low: 5,
};

function severityScore(group: CorrelatedGroup): { score: number; explanation: string } {
  const severities = group.signals.map((s) => s.severity);
  const highest = (['critical', 'high', 'medium', 'low'] as Severity[]).find((s) =>
    severities.includes(s)
  )!;
  const score = SEVERITY_SCORES[highest];
  return {
    score,
    explanation: `Highest signal severity is ${highest.toUpperCase()} (+${score} pts).`,
  };
}

function signalCountScore(group: CorrelatedGroup): { score: number; explanation: string } {
  const count = group.signals.length;
  let score: number;
  if (count >= 4) score = 20;
  else if (count === 3) score = 15;
  else if (count === 2) score = 10;
  else score = 5;
  return {
    score,
    explanation: `${count} correlated signal${count > 1 ? 's' : ''} detected (+${score} pts). Multiple correlated signals indicate a coordinated threat.`,
  };
}

function threatIntelScore(group: CorrelatedGroup): { score: number; explanation: string } {
  const hasThreatIntel = group.signals.some((s) => s.source === 'threat-intel');
  const score = hasThreatIntel ? 20 : 0;
  return {
    score,
    explanation: hasThreatIntel
      ? `Threat intelligence match confirmed — indicators found in known-malicious feeds (+${score} pts).`
      : 'No threat intelligence matches found (+0 pts).',
  };
}

function confidenceScore(group: CorrelatedGroup): { score: number; explanation: string } {
  // Count distinct indicator types present across all signals
  const types = new Set<string>();
  for (const sig of group.signals) {
    if (sig.indicators.user) types.add('user');
    if (sig.indicators.device) types.add('device');
    if (sig.indicators.ip) types.add('ip');
    if (sig.indicators.domain) types.add('domain');
    if (sig.indicators.emailSender) types.add('email');
  }
  const distinctTypes = types.size;
  let score: number;
  if (distinctTypes >= 4) score = 15;
  else if (distinctTypes === 3) score = 12;
  else if (distinctTypes === 2) score = 8;
  else score = 5;
  return {
    score,
    explanation: `${distinctTypes} distinct indicator type${distinctTypes > 1 ? 's' : ''} correlated (user, device, IP, domain) — confidence is ${score >= 12 ? 'high' : 'medium'} (+${score} pts).`,
  };
}

function timeProximityScore(group: CorrelatedGroup): { score: number; explanation: string } {
  if (group.signals.length <= 1) return { score: 5, explanation: 'Single signal (+5 pts).' };
  const times = group.signals.map((s) => new Date(s.timestamp).getTime());
  const spanMinutes = (Math.max(...times) - Math.min(...times)) / 60000;
  let score: number;
  let label: string;
  if (spanMinutes <= 30) {
    score = 15;
    label = `all within ${Math.round(spanMinutes)} minutes`;
  } else if (spanMinutes <= 60) {
    score = 10;
    label = `within ${Math.round(spanMinutes)} minutes`;
  } else if (spanMinutes <= 120) {
    score = 5;
    label = `spread over ${Math.round(spanMinutes)} minutes`;
  } else {
    score = 2;
    label = `spread over ${Math.round(spanMinutes / 60)} hours`;
  }
  return {
    score,
    explanation: `Signals ${label} — rapid sequence suggests active attack (+${score} pts).`,
  };
}

export function scoreGroup(group: CorrelatedGroup): ScoreBreakdown {
  const sev = severityScore(group);
  const cnt = signalCountScore(group);
  const ti = threatIntelScore(group);
  const conf = confidenceScore(group);
  const time = timeProximityScore(group);

  const total = Math.min(100, sev.score + cnt.score + ti.score + conf.score + time.score);

  return {
    severityScore: sev.score,
    signalCountScore: cnt.score,
    threatIntelScore: ti.score,
    confidenceScore: conf.score,
    timeProximityScore: time.score,
    total,
    explanations: [sev.explanation, cnt.explanation, ti.explanation, conf.explanation, time.explanation],
  };
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 76) return 'CRITICAL';
  if (score >= 51) return 'HIGH';
  if (score >= 26) return 'MEDIUM';
  return 'LOW';
}
