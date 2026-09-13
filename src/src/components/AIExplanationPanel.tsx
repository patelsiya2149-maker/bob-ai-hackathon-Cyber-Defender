import { Bot, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  summary: string;
  loading: boolean;
  error: string | null;
}

export function AIExplanationPanel({ summary, loading, error }: Props) {
  return (
    <div className="rounded-xl border border-blue-800 bg-blue-950/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-blue-800 bg-blue-950/40">
        <div className="p-1.5 rounded-md bg-blue-900/50">
          <Bot className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-blue-300">AI Security Analysis</div>
          <div className="text-xs text-blue-400/70">Powered by IBM watsonx.ai</div>
        </div>
        {loading && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-blue-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analyzing…
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {loading && !summary && (
          <div className="flex flex-col gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-3 rounded bg-blue-900/30 animate-pulse"
                style={{ width: `${85 - i * 10}%` }}
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {summary && (
          <div className="text-sm text-blue-100 leading-relaxed whitespace-pre-wrap">{summary}</div>
        )}
      </div>
    </div>
  );
}
