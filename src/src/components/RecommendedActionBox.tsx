import { ShieldAlert } from 'lucide-react';

interface Props {
  action: string;
}

export function RecommendedActionBox({ action }: Props) {
  return (
    <div className="rounded-xl border border-amber-700 bg-amber-950/30 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-700 bg-amber-950/40">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-300">Recommended Defensive Action</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-amber-100 leading-relaxed">{action}</p>
      </div>
    </div>
  );
}
