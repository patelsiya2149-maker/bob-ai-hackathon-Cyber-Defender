import type { TechniqueTag } from '../types';

const TACTIC_COLORS: Record<string, string> = {
  'Initial Access': 'text-purple-300 bg-purple-900/30 border-purple-700',
  'Execution': 'text-blue-300 bg-blue-900/30 border-blue-700',
  'Credential Access': 'text-amber-300 bg-amber-900/30 border-amber-700',
  'Command and Control': 'text-red-300 bg-red-900/30 border-red-700',
  'Exfiltration': 'text-pink-300 bg-pink-900/30 border-pink-700',
  'Collection': 'text-cyan-300 bg-cyan-900/30 border-cyan-700',
  'Threat Intelligence': 'text-green-300 bg-green-900/30 border-green-700',
};

interface Props {
  technique: TechniqueTag;
}

export function TechniqueBadge({ technique }: Props) {
  const color = TACTIC_COLORS[technique.tactic] ?? 'text-gray-300 bg-gray-800/30 border-gray-600';
  return (
    <span
      className={`inline-flex flex-col rounded border px-2.5 py-1.5 text-xs ${color}`}
      title={technique.description}
    >
      <span className="font-mono font-bold">{technique.id}</span>
      <span className="font-medium">{technique.name}</span>
      <span className="opacity-70">{technique.tactic}</span>
    </span>
  );
}
