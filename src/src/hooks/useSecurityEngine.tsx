import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { SIGNALS } from '../data';
import { normalizeSignal, normalizeAll } from '../engine/normalizer';
import { correlateSignals } from '../engine/correlator';
import { scoreGroup, getRiskLevel } from '../engine/riskScorer';
import { classifyTechniques } from '../engine/techniqueClassifier';
import { buildIncident, resetIncidentCounter } from '../engine/incidentBuilder';
import type {
  Incident,
  DashboardStats,
  RiskLevel,
  SignalSource,
  RawSignal,
  NormalizedSignal,
  AnalysisResult,
} from '../types';

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function runPipeline(rawSignals: RawSignal[]): Incident[] {
  resetIncidentCounter();
  const normalized = normalizeAll(rawSignals);
  const groups = correlateSignals(normalized);
  const incidents: Incident[] = groups.map((group) => {
    const scoreBreakdown = scoreGroup(group);
    const riskLevel = getRiskLevel(scoreBreakdown.total);
    const techniques = classifyTechniques(group);
    return buildIncident(group, scoreBreakdown, techniques, riskLevel);
  });
  return incidents.sort((a, b) => b.riskScore - a.riskScore);
}

function computeStats(incidents: Incident[], allRawSignals: RawSignal[]): DashboardStats {
  const totalSignals = allRawSignals.length;
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
  for (const sig of normalizeAll(allRawSignals)) {
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

// ─── Context ──────────────────────────────────────────────────────────────────

interface SecurityEngineContextValue {
  incidents: Incident[];
  stats: DashboardStats;
  addSignal: (raw: RawSignal) => AnalysisResult;
  resetToDemo: () => void;
  resetToEmpty: () => void;
}

const SecurityEngineContext = createContext<SecurityEngineContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SecurityEngineProvider({ children }: { children: ReactNode }) {
  const [rawSignals, setRawSignals] = useState<RawSignal[]>(() => [...SIGNALS]);

  const [incidents, setIncidents] = useState<Incident[]>(() => runPipeline([...SIGNALS]));

  const stats = computeStats(incidents, rawSignals);

  const addSignal = useCallback(
    (raw: RawSignal): AnalysisResult => {
      // Normalise the new signal
      const newNormalized: NormalizedSignal = normalizeSignal(raw);

      // Find which incident the new signal would fall into BEFORE adding
      // (to detect score changes)
      const prevIncidentForSignal = incidents.find((inc) =>
        inc.signals.some((s) => {
          const si = s.indicators;
          const ni = newNormalized.indicators;
          return (
            (si.user && ni.user && si.user === ni.user) ||
            (si.device && ni.device && si.device === ni.device) ||
            (si.ip && ni.ip && si.ip === ni.ip) ||
            (si.domain && ni.domain && si.domain === ni.domain)
          );
        })
      );
      const previousScore = prevIncidentForSignal?.riskScore ?? null;

      // Re-run the full pipeline with the new signal appended
      const updatedRaws = [...rawSignals, raw];
      const newIncidents = runPipeline(updatedRaws);

      setRawSignals(updatedRaws);
      setIncidents(newIncidents);

      // Find the incident that contains the new signal
      const resultIncident =
        newIncidents.find((inc) =>
          inc.signals.some((s) => s.id === newNormalized.id)
        ) ?? newIncidents[0];

      const isNewIncident =
        prevIncidentForSignal === undefined ||
        resultIncident.id !== prevIncidentForSignal.id;

      return {
        signal: newNormalized,
        incident: resultIncident,
        isNewIncident,
        previousScore,
      };
    },
    [rawSignals, incidents]
  );

  const resetToDemo = useCallback(() => {
    setRawSignals([...SIGNALS]);
    setIncidents(runPipeline([...SIGNALS]));
  }, []);

  const resetToEmpty = useCallback(() => {
    resetIncidentCounter();
    setRawSignals([]);
    setIncidents([]);
  }, []);

  return (
    <SecurityEngineContext.Provider value={{ incidents, stats, addSignal, resetToDemo, resetToEmpty }}>
      {children}
    </SecurityEngineContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSecurityEngine(): SecurityEngineContextValue {
  const ctx = useContext(SecurityEngineContext);
  if (!ctx) throw new Error('useSecurityEngine must be used within SecurityEngineProvider');
  return ctx;
}
