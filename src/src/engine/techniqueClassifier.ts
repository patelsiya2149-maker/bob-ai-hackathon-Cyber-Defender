import type { CorrelatedGroup, TechniqueTag } from '../types';
import { TECHNIQUES } from '../data';

function findTechnique(id: string): TechniqueTag | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

export function classifyTechniques(group: CorrelatedGroup): TechniqueTag[] {
  const matched = new Set<string>();

  for (const signal of group.signals) {
    switch (signal.source) {
      case 'email':
        matched.add('T1566');
        if (signal.severity === 'high' || signal.severity === 'critical') {
          matched.add('T1566.002');
        }
        break;

      case 'url':
        matched.add('T1204.002');
        break;

      case 'auth':
        matched.add('T1078');
        if (
          signal.description.toLowerCase().includes('brute') ||
          signal.description.toLowerCase().includes('failed')
        ) {
          matched.add('T1110');
        }
        break;

      case 'endpoint':
        matched.add('T1059');
        if (
          signal.description.toLowerCase().includes('powershell') ||
          (signal.raw.source === 'endpoint' &&
            'commandLine' in signal.raw &&
            signal.raw.commandLine?.toLowerCase().includes('powershell'))
        ) {
          matched.add('T1059.001');
        }
        break;

      case 'threat-intel':
        matched.add('T1020');
        break;
    }
  }

  return Array.from(matched)
    .map(findTechnique)
    .filter((t): t is TechniqueTag => t !== undefined);
}
