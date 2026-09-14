import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import { useSecurityEngine } from '../hooks/useSecurityEngine';

export function NavBar() {
  const location = useLocation();
  const { incidents, stats } = useSecurityEngine();
  const criticalCount = incidents.filter((i) => i.riskLevel === 'CRITICAL').length;

  return (
    <header className="sticky top-0 z-50 border-b border-shield-border bg-shield-bg/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-blue-900/30 border border-blue-800 group-hover:border-blue-600 transition-colors">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-shield-text leading-none">AI Security Shield</div>
            <div className="text-xs text-shield-muted leading-none mt-0.5">Cyber Defender</div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 ml-4">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              location.pathname === '/'
                ? 'bg-shield-card text-shield-text'
                : 'text-shield-dim hover:text-shield-text hover:bg-shield-card/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </nav>

        {/* Right stats — only shown when there is actual data */}
        <div className="ml-auto flex items-center gap-4">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-900/20 border border-red-800 rounded-full px-3 py-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              {criticalCount} Critical
            </div>
          )}
          {stats.totalSignals > 0 && (
            <div className="text-xs text-shield-muted">
              <span className="text-shield-dim font-medium">{stats.totalSignals}</span> signals ·{' '}
              <span className="text-shield-dim font-medium">{stats.activeIncidents}</span> incidents
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
