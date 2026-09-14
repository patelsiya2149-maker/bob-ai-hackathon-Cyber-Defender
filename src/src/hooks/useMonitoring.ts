import { useState, useCallback, useRef, useEffect } from 'react';
import type { FeedEntry, Incident } from '../types';
import { useSecurityEngine } from './useSecurityEngine';
import { EVENT_STREAM, STREAM_LENGTH } from '../engine/eventStream';

export type MonitoringStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface MonitoringState {
  status: MonitoringStatus;
  eventsProcessed: number;
  totalEvents: number;
  feedEntries: FeedEntry[];
  latestCriticalIncident: Incident | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  loadDemo: () => void;
}

let feedIdCounter = 0;

export function useMonitoring(): MonitoringState {
  const { addSignal, resetToEmpty, resetToDemo, incidents } = useSecurityEngine();

  // Always hold the latest addSignal in a ref so the timer closure never goes stale
  const addSignalRef = useRef(addSignal);
  useEffect(() => { addSignalRef.current = addSignal; }, [addSignal]);

  const [status, setStatus] = useState<MonitoringStatus>('idle');
  const [eventsProcessed, setEventsProcessed] = useState(0);
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);

  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<MonitoringStatus>('idle');

  useEffect(() => { statusRef.current = status; }, [status]);

  function clearTimer() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  // scheduleNext doesn't depend on addSignal directly — uses the ref instead
  const scheduleNext = useCallback(() => {
    const idx = indexRef.current;
    if (idx >= EVENT_STREAM.length) {
      setStatus('complete');
      statusRef.current = 'complete';
      return;
    }

    const event = EVENT_STREAM[idx];
    timeoutRef.current = setTimeout(() => {
      if (statusRef.current !== 'running') return;

      // Use the ref so we always have the latest addSignal closure
      const result = addSignalRef.current(event.signal);

      const entry: FeedEntry = {
        id: `feed-${++feedIdCounter}`,
        timestamp: new Date().toISOString(),
        signalTitle: result.signal.title,
        signalSource: result.signal.source,
        signalSeverity: result.signal.severity,
        incidentId: result.incident.id,
        riskScore: result.incident.riskScore,
        riskLevel: result.incident.riskLevel,
        isNewIncident: result.isNewIncident,
      };

      setFeedEntries((prev) => [entry, ...prev].slice(0, 50));
      setEventsProcessed((n) => n + 1);
      indexRef.current = idx + 1;

      // Schedule next immediately (it reads its own delay)
      scheduleNext();
    }, event.delayMs);
  // scheduleNext is intentionally stable — no deps needed, reads everything via refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    clearTimer();
    resetToEmpty();
    indexRef.current = 0;
    feedIdCounter = 0;
    setFeedEntries([]);
    setEventsProcessed(0);
    setStatus('running');
    statusRef.current = 'running';
    timeoutRef.current = setTimeout(scheduleNext, 150);
  }, [resetToEmpty, scheduleNext]);

  const pause = useCallback(() => {
    clearTimer();
    setStatus('paused');
    statusRef.current = 'paused';
  }, []);

  const resume = useCallback(() => {
    setStatus('running');
    statusRef.current = 'running';
    scheduleNext();
  }, [scheduleNext]);

  const reset = useCallback(() => {
    clearTimer();
    resetToEmpty();
    indexRef.current = 0;
    setFeedEntries([]);
    setEventsProcessed(0);
    setStatus('idle');
    statusRef.current = 'idle';
  }, [resetToEmpty]);

  const loadDemo = useCallback(() => {
    clearTimer();
    resetToDemo();
    indexRef.current = 0;
    setFeedEntries([]);
    setEventsProcessed(0);
    setStatus('idle');
    statusRef.current = 'idle';
  }, [resetToDemo]);

  // Cleanup timers on unmount
  useEffect(() => () => clearTimer(), []);

  const latestCriticalIncident =
    incidents.find((i) => i.riskLevel === 'CRITICAL') ??
    incidents.find((i) => i.riskLevel === 'HIGH') ??
    null;

  return {
    status,
    eventsProcessed,
    totalEvents: STREAM_LENGTH,
    feedEntries,
    latestCriticalIncident,
    start,
    pause,
    resume,
    reset,
    loadDemo,
  };
}
