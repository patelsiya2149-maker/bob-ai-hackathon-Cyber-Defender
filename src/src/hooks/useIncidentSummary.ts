import { useState, useEffect, useRef } from 'react';
import type { Incident } from '../types';
import { generateAISummary } from '../engine/aiSummary';

// Cache AI summaries in memory so we don't regenerate them on every navigation
const summaryCache = new Map<string, string>();

export function useIncidentSummary(incident: Incident) {
  const [summary, setSummary] = useState<string>(summaryCache.get(incident.id) ?? '');
  const [loading, setLoading] = useState(!summaryCache.has(incident.id));
  const [error, setError] = useState<string | null>(null);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (summaryCache.has(incident.id)) {
      setSummary(summaryCache.get(incident.id)!);
      setLoading(false);
      return;
    }

    if (generatingRef.current) return;
    generatingRef.current = true;

    setLoading(true);
    setError(null);

    generateAISummary(incident)
      .then((text) => {
        summaryCache.set(incident.id, text);
        setSummary(text);
      })
      .catch((err) => {
        console.error('[AI Summary] Error:', err);
        setError('Unable to generate summary. Please try again.');
      })
      .finally(() => {
        setLoading(false);
        generatingRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident.id]);

  return { summary, loading, error };
}
