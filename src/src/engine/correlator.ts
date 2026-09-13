import type { NormalizedSignal, CorrelatedGroup } from '../types';

// Returns a reason string if two signals share at least one meaningful indicator
function shareIndicator(a: NormalizedSignal, b: NormalizedSignal): string | null {
  const ai = a.indicators;
  const bi = b.indicators;

  if (ai.user && bi.user && ai.user === bi.user) return `Same user: ${ai.user}`;
  if (ai.device && bi.device && ai.device === bi.device) return `Same device: ${ai.device}`;
  if (ai.ip && bi.ip && ai.ip === bi.ip) return `Same IP: ${ai.ip}`;
  if (ai.domain && bi.domain && ai.domain === bi.domain) return `Same domain: ${ai.domain}`;
  if (ai.emailSender && bi.domain && ai.emailSender.includes(bi.domain)) return `Sender domain matches: ${bi.domain}`;
  if (bi.emailSender && ai.domain && bi.emailSender.includes(ai.domain)) return `Sender domain matches: ${ai.domain}`;

  return null;
}

// Returns minutes between two ISO timestamps
function minutesBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60000;
}

// Union-Find helpers
function find(parent: number[], i: number): number {
  if (parent[i] !== i) parent[i] = find(parent, parent[i]);
  return parent[i];
}

function union(parent: number[], i: number, j: number): void {
  parent[find(parent, i)] = find(parent, j);
}

export function correlateSignals(signals: NormalizedSignal[]): CorrelatedGroup[] {
  const n = signals.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  // Collect reasons per pair — keyed by the union root (numeric) after merging
  const pairReasons: Array<{ i: number; j: number; reason: string }> = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const reason = shareIndicator(signals[i], signals[j]);
      if (!reason) continue;

      // Time proximity gate: signals more than 4 hours apart are not correlated
      const mins = minutesBetween(signals[i].timestamp, signals[j].timestamp);
      if (mins > 240) continue;

      union(parent, i, j);
      pairReasons.push({ i, j, reason });
    }
  }

  // Build reason lists per root
  const reasonsByRoot = new Map<number, string[]>();
  for (const { i, reason } of pairReasons) {
    const root = find(parent, i);
    if (!reasonsByRoot.has(root)) reasonsByRoot.set(root, []);
    const list = reasonsByRoot.get(root)!;
    if (!list.includes(reason)) list.push(reason);
  }

  // Group signals by their root
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(parent, i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(i);
  }

  return Array.from(groups.entries()).map(([root, indices]) => {
    const groupSignals = indices.map((i) => signals[i]);
    const rawReasons = [...(reasonsByRoot.get(root) ?? [])];

    // Add time-proximity reason if group has multiple signals
    if (groupSignals.length > 1) {
      const times = groupSignals.map((s) => new Date(s.timestamp).getTime());
      const span = (Math.max(...times) - Math.min(...times)) / 60000;
      if (span <= 60) {
        rawReasons.push(`All signals occurred within ${Math.round(span)} minutes`);
      } else if (span <= 120) {
        rawReasons.push(`Signals spanned ${Math.round(span)} minutes — possible coordinated activity`);
      }
    }

    return {
      signals: groupSignals,
      correlationReasons: rawReasons,
    };
  });
}
