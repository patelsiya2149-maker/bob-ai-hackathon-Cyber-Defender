// ─── Risk Levels ─────────────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SignalSource = 'email' | 'url' | 'auth' | 'endpoint' | 'threat-intel';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'active' | 'investigating' | 'resolved';

// ─── Raw Signal Shapes (one per source type) ─────────────────────────────────

export interface RawEmailSignal {
  id: string;
  timestamp: string;
  source: 'email';
  severity: Severity;
  title: string;
  description: string;
  sender: string;
  recipient: string;
  subject: string;
  domain: string;
  indicators: string[];
}

export interface RawURLSignal {
  id: string;
  timestamp: string;
  source: 'url';
  severity: Severity;
  title: string;
  description: string;
  url: string;
  domain: string;
  ip?: string;
  user?: string;
  device?: string;
  indicators: string[];
}

export interface RawAuthSignal {
  id: string;
  timestamp: string;
  source: 'auth';
  severity: Severity;
  title: string;
  description: string;
  user: string;
  ip: string;
  device?: string;
  country?: string;
  reason: string;
  indicators: string[];
}

export interface RawEndpointSignal {
  id: string;
  timestamp: string;
  source: 'endpoint';
  severity: Severity;
  title: string;
  description: string;
  device: string;
  user?: string;
  process?: string;
  commandLine?: string;
  indicators: string[];
}

export interface RawThreatIntelSignal {
  id: string;
  timestamp: string;
  source: 'threat-intel';
  severity: Severity;
  title: string;
  description: string;
  ip?: string;
  domain?: string;
  hash?: string;
  feedName: string;
  confidence: number;
  indicators: string[];
}

export type RawSignal =
  | RawEmailSignal
  | RawURLSignal
  | RawAuthSignal
  | RawEndpointSignal
  | RawThreatIntelSignal;

// ─── Normalized Signal (common internal format) ───────────────────────────────

export interface SignalIndicators {
  user?: string;
  device?: string;
  ip?: string;
  domain?: string;
  url?: string;
  emailSender?: string;
  hash?: string;
}

export interface NormalizedSignal {
  id: string;
  timestamp: string;
  source: SignalSource;
  severity: Severity;
  title: string;
  description: string;
  indicators: SignalIndicators;
  raw: RawSignal;
}

// ─── Correlated Group ─────────────────────────────────────────────────────────

export interface CorrelatedGroup {
  signals: NormalizedSignal[];
  correlationReasons: string[];
}

// ─── Score Breakdown ─────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  severityScore: number;
  signalCountScore: number;
  threatIntelScore: number;
  confidenceScore: number;
  timeProximityScore: number;
  total: number;
  explanations: string[];
}

// ─── Technique Tag ────────────────────────────────────────────────────────────

export interface TechniqueTag {
  id: string;
  name: string;
  tactic: string;
  description: string;
}

// ─── Full Incident ────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  title: string;
  createdAt: string;
  signals: NormalizedSignal[];
  riskScore: number;
  riskLevel: RiskLevel;
  scoreBreakdown: ScoreBreakdown;
  correlationReasons: string[];
  techniques: TechniqueTag[];
  status: IncidentStatus;
  aiSummary: string;
  recommendedAction: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalSignals: number;
  activeIncidents: number;
  highCriticalCount: number;
  averageRiskScore: number;
  riskDistribution: { level: RiskLevel; count: number }[];
  signalsBySource: { source: SignalSource; count: number }[];
}
