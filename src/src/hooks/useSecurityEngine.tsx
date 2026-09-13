import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { SIGNALS } from '../data';
import { normalizeAll } from '../engine/normalizer';
import { correlateSignals } from '../engine/correlator';
import { scoreGroup, getRiskLevel } from '../engine/riskScorer';
import { classifyTechniques } from '../engine/techniqueClassifier';
import { buildIncident, resetIncidentCounter } from '../engine/incidentBuilder';
import type { Incident, DashboardStats, RiskLevel, SignalSource } from '../types';

interface SecurityEngineContextValue {
  incidents: Incident[];
  stats: DashboardStats;
}

const SecurityEngineContext = createContext<SecurityEngineContextValue | null>(null);

function runPipeline(): Incident[] {
  resetIncidentCounter();
  const normalized = normalizeAll(SIGNALS);
  const groups = correlateSignals(normalized);

  const incidents: Incident[] = groups.map((group) => {
    const scoreBreakdown = scoreGroup(group);
    const riskLevel = getRiskLevel(scoreBreakdown.total);
    const techniques = classifyTechniques(group);
    return buildIncident(group, scoreBreakdown, techniques, riskLevel);
  });

  // Sort by risk score descending
  return incidents.sort((a, b) => b.riskScore - a.riskScore);
}

function computeStats(incidents: Incident[]): DashboardStats {
  const totalSignals = SIGNALS.length;
  const activeIncidents = incidents.filter((i) => i.status === 'active').length;
  const highCriticalCount = incidents.filter(
    (i) => i.riskLevel === 'HIGH' || i.riskLevel === 'CRITICAL'
  ).length;
  const averageRiskScore =
    incidents.length > 0
      ? Math.round(incidents.reduce((sum, i) => sum + i.riskScore, 0) / incidents.length)
      : 0;

  const riskDistribution = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskLevel[]).map((level) => ({
    level,
    count: incidents.filter((i) => i.riskLevel === level).length,
  }));

  const sourceCounts = new Map<SignalSource, number>();
  for (const sig of normalizeAll(SIGNALS)) {
    sourceCounts.set(sig.source, (sourceCounts.get(sig.source) ?? 0) + 1);
  }
  const signalsBySource = Array.from(sourceCounts.entries()).map(([source, count]) => ({
    source,
    count,
  }));

  return {
    totalSignals,
    activeIncidents,
    highCriticalCount,
    averageRiskScore,
    riskDistribution,
    signalsBySource,
  };
}

export function SecurityEngineProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const incidents = runPipeline();
    const stats = computeStats(incidents);
    return { incidents, stats };
  }, []);

  return (
    <SecurityEngineContext.Provider value={value}>
      {children}
    </SecurityEngineContext.Provider>
  );
}

export function useSecurityEngine(): SecurityEngineContextValue {
  const ctx = useContext(SecurityEngineContext);
  if (!ctx) throw new Error('useSecurityEngine must be used within SecurityEngineProvider');
  return ctx;
}
