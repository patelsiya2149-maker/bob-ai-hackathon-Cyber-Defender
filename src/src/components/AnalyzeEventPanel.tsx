import { useState, type FormEvent } from 'react';
import {
  FlaskConical, Mail, Link, LogIn, Monitor,
  ChevronDown, Zap, RotateCcw, AlertTriangle,
  CheckCircle2, ArrowRight, TrendingUp,
} from 'lucide-react';
import type { AnalysisResult } from '../types';
import { useSecurityEngine } from '../hooks/useSecurityEngine';
import {
  buildSignalFromInput,
  type EventType,
  type EmailInput,
  type URLInput,
  type AuthInput,
  type EndpointInput,
} from '../engine/simulator';
import { RiskBadge } from './RiskBadge';
import { RiskScoreBar } from './RiskScoreBar';
import { SecurityShieldWarning } from './SecurityShieldWarning';
import { SeverityBadge } from './SeverityBadge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_TYPES: { type: EventType; label: string; icon: typeof Mail; desc: string }[] = [
  { type: 'email',    label: 'Suspicious Email',  icon: Mail,    desc: 'Analyse a suspicious email for phishing indicators' },
  { type: 'url',      label: 'Suspicious URL',     icon: Link,    desc: 'Check a URL for malicious patterns' },
  { type: 'auth',     label: 'Login Anomaly',      icon: LogIn,   desc: 'Report an unusual authentication event' },
  { type: 'endpoint', label: 'Endpoint Activity',  icon: Monitor, desc: 'Investigate suspicious process execution' },
];

// ─── Sub-forms ────────────────────────────────────────────────────────────────

function EmailForm({ value, onChange }: {
  value: EmailInput;
  onChange: (v: EmailInput) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Sender Email" required>
        <input value={value.senderEmail} onChange={e => onChange({ ...value, senderEmail: e.target.value })}
          placeholder="alert@suspicious-domain.example" className={inputCls} />
      </Field>
      <Field label="Recipient Email" required>
        <input value={value.recipientEmail} onChange={e => onChange({ ...value, recipientEmail: e.target.value })}
          placeholder="user@company.com" className={inputCls} />
      </Field>
      <Field label="Subject Line" required className="sm:col-span-2">
        <input value={value.subject} onChange={e => onChange({ ...value, subject: e.target.value })}
          placeholder="URGENT: Your account will be suspended" className={inputCls} />
      </Field>
      <Field label="Email Body (excerpt)" className="sm:col-span-2">
        <textarea rows={3} value={value.body} onChange={e => onChange({ ...value, body: e.target.value })}
          placeholder="Click here to verify your account: http://login.suspicious-domain.example/reset?token=abc"
          className={inputCls + ' resize-none'} />
      </Field>
    </div>
  );
}

function URLFormComp({ value, onChange }: {
  value: URLInput;
  onChange: (v: URLInput) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="URL" required className="sm:col-span-2">
        <input value={value.url} onChange={e => onChange({ ...value, url: e.target.value })}
          placeholder="http://malicious-login.suspicious-domain.example/reset?token=abc123"
          className={inputCls} />
      </Field>
      <Field label="User (optional)">
        <input value={value.user ?? ''} onChange={e => onChange({ ...value, user: e.target.value || undefined })}
          placeholder="user@company.com" className={inputCls} />
      </Field>
      <Field label="Device (optional)">
        <input value={value.device ?? ''} onChange={e => onChange({ ...value, device: e.target.value || undefined })}
          placeholder="WORKSTATION-01" className={inputCls} />
      </Field>
    </div>
  );
}

function AuthForm({ value, onChange }: {
  value: AuthInput;
  onChange: (v: AuthInput) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Username" required>
        <input value={value.username} onChange={e => onChange({ ...value, username: e.target.value })}
          placeholder="user@company.com" className={inputCls} />
      </Field>
      <Field label="Source IP" required>
        <input value={value.sourceIp} onChange={e => onChange({ ...value, sourceIp: e.target.value })}
          placeholder="192.0.2.100" className={inputCls} />
      </Field>
      <Field label="Device (optional)">
        <input value={value.device ?? ''} onChange={e => onChange({ ...value, device: e.target.value || undefined })}
          placeholder="WORKSTATION-01" className={inputCls} />
      </Field>
      <Field label="Anomaly Reason" required>
        <input value={value.reason} onChange={e => onChange({ ...value, reason: e.target.value })}
          placeholder="Login from unknown country, no MFA" className={inputCls} />
      </Field>
    </div>
  );
}

function EndpointForm({ value, onChange }: {
  value: EndpointInput;
  onChange: (v: EndpointInput) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Device Name" required>
        <input value={value.deviceName} onChange={e => onChange({ ...value, deviceName: e.target.value })}
          placeholder="WORKSTATION-01" className={inputCls} />
      </Field>
      <Field label="User (optional)">
        <input value={value.user ?? ''} onChange={e => onChange({ ...value, user: e.target.value || undefined })}
          placeholder="user@company.com" className={inputCls} />
      </Field>
      <Field label="Process Name" required>
        <input value={value.processName} onChange={e => onChange({ ...value, processName: e.target.value })}
          placeholder="powershell.exe" className={inputCls} />
      </Field>
      <Field label="Command Line (optional)">
        <input value={value.commandLine ?? ''} onChange={e => onChange({ ...value, commandLine: e.target.value || undefined })}
          placeholder="powershell.exe -enc JABjAGw..." className={inputCls} />
      </Field>
    </div>
  );
}

// ─── Tiny shared helpers ──────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg bg-shield-bg border border-shield-border text-shield-text text-sm px-3 py-2 ' +
  'placeholder:text-shield-muted focus:outline-none focus:border-blue-600 transition-colors';

function Field({ label, required, children, className = '' }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-shield-dim mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Demo presets ─────────────────────────────────────────────────────────────

const DEMO_PRESETS: Record<EventType, unknown> = {
  email: {
    senderEmail: 'security@verify-account-now.xyz',
    recipientEmail: 'john@company.com',
    subject: 'URGENT: Verify your account or it will be suspended',
    body: 'Your account has been flagged. Click here immediately: http://verify-account-now.xyz/reset?token=abc123',
  } as EmailInput,
  url: {
    url: 'http://secure-login-verify.xyz/account/reset?token=eyJhbGc&session=user123',
    user: 'john@company.com',
    device: 'JOHN-LAPTOP-01',
  } as URLInput,
  auth: {
    username: 'john@company.com',
    sourceIp: '198.51.100.77',
    device: 'JOHN-LAPTOP-01',
    reason: 'Login from Tor exit node, MFA bypassed, unusual hour',
  } as AuthInput,
  endpoint: {
    deviceName: 'JOHN-LAPTOP-01',
    user: 'john@company.com',
    processName: 'powershell.exe',
    commandLine: 'powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA -noprofile -hidden',
  } as EndpointInput,
};

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result, onViewIncident, onDismiss }: {
  result: AnalysisResult;
  onViewIncident: (id: string) => void;
  onDismiss: () => void;
}) {
  const { signal, incident, isNewIncident, previousScore } = result;
  const scoreRose = previousScore !== null && incident.riskScore > previousScore;

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      {/* Summary banner */}
      <div className="rounded-xl border border-blue-800 bg-blue-950/30 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-blue-300 mb-2">Analysis Complete</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <div className="flex items-center gap-2 text-shield-dim">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span>
                  <span className="text-shield-text font-medium">New signal detected: </span>
                  {signal.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-shield-dim">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span>
                  {isNewIncident
                    ? <><span className="text-shield-text font-medium">New incident created: </span>{incident.id}</>
                    : <><span className="text-shield-text font-medium">Correlated with existing incident: </span>{incident.id}</>
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-shield-dim">
                <TrendingUp className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span>
                  <span className="text-shield-text font-medium">Risk score: </span>
                  {incident.riskScore}/100
                  {scoreRose && previousScore !== null && (
                    <span className="text-red-400 ml-1.5">(↑ from {previousScore})</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-shield-dim">
                <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span>
                  <span className="text-shield-text font-medium">Signal severity: </span>
                  <SeverityBadge severity={signal.severity} />
                </span>
              </div>
            </div>

            {/* Risk level + bar */}
            <div className="mt-3 flex items-center gap-3">
              <RiskBadge level={incident.riskLevel} />
              <div className="flex-1">
                <RiskScoreBar score={incident.riskScore} riskLevel={incident.riskLevel} showLabel={false} />
              </div>
              <span className="text-sm font-bold text-shield-text tabular-nums">{incident.riskScore}/100</span>
            </div>

            {/* Recommended action */}
            <div className="mt-3 rounded-lg bg-shield-card border border-shield-border px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-shield-muted mb-1">
                Recommended Action
              </div>
              <p className="text-sm text-shield-dim">{incident.recommendedAction}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Shield Warning for HIGH/CRITICAL */}
      {(incident.riskLevel === 'HIGH' || incident.riskLevel === 'CRITICAL') && (
        <SecurityShieldWarning incident={incident} />
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onViewIncident(incident.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          View Full Incident
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 rounded-lg border border-shield-border hover:bg-shield-card text-shield-dim text-sm transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface Props {
  onNavigateToIncident: (id: string) => void;
}

export function AnalyzeEventPanel({ onNavigateToIncident }: Props) {
  const { addSignal, resetToDemo } = useSecurityEngine();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType>('email');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form states for each event type
  const [emailData, setEmailData] = useState<EmailInput>({
    senderEmail: '', recipientEmail: '', subject: '', body: '',
  });
  const [urlData, setUrlData] = useState<URLInput>({ url: '' });
  const [authData, setAuthData] = useState<AuthInput>({
    username: '', sourceIp: '', reason: '',
  });
  const [endpointData, setEndpointData] = useState<EndpointInput>({
    deviceName: '', processName: '',
  });

  function loadPreset() {
    const preset = DEMO_PRESETS[selectedType];
    if (selectedType === 'email') setEmailData(preset as EmailInput);
    if (selectedType === 'url') setUrlData(preset as URLInput);
    if (selectedType === 'auth') setAuthData(preset as AuthInput);
    if (selectedType === 'endpoint') setEndpointData(preset as EndpointInput);
    setResult(null);
    setValidationError(null);
  }

  function validate(): string | null {
    if (selectedType === 'email') {
      if (!emailData.senderEmail.includes('@')) return 'Enter a valid sender email address.';
      if (!emailData.recipientEmail.includes('@')) return 'Enter a valid recipient email address.';
      if (!emailData.subject.trim()) return 'Subject line is required.';
    }
    if (selectedType === 'url') {
      if (!urlData.url.trim()) return 'URL is required.';
    }
    if (selectedType === 'auth') {
      if (!authData.username.trim()) return 'Username is required.';
      if (!authData.sourceIp.trim()) return 'Source IP is required.';
      if (!authData.reason.trim()) return 'Anomaly reason is required.';
    }
    if (selectedType === 'endpoint') {
      if (!endpointData.deviceName.trim()) return 'Device name is required.';
      if (!endpointData.processName.trim()) return 'Process name is required.';
    }
    return null;
  }

  function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);
    const err = validate();
    if (err) { setValidationError(err); return; }

    setAnalyzing(true);
    setResult(null);

    // Small artificial delay for UX — signals the analysis is "running"
    setTimeout(() => {
      try {
        const input =
          selectedType === 'email'    ? { type: 'email'    as const, data: emailData }
          : selectedType === 'url'   ? { type: 'url'      as const, data: urlData }
          : selectedType === 'auth'  ? { type: 'auth'     as const, data: authData }
          :                            { type: 'endpoint' as const, data: endpointData };

        const raw = buildSignalFromInput(input);
        const analysisResult = addSignal(raw);
        setResult(analysisResult);
      } finally {
        setAnalyzing(false);
      }
    }, 600);
  }

  function handleReset() {
    resetToDemo();
    setResult(null);
    setValidationError(null);
    setEmailData({ senderEmail: '', recipientEmail: '', subject: '', body: '' });
    setUrlData({ url: '' });
    setAuthData({ username: '', sourceIp: '', reason: '' });
    setEndpointData({ deviceName: '', processName: '' });
  }

  const cfg = EVENT_TYPES.find(e => e.type === selectedType)!;
  const Icon = cfg.icon;

  return (
    <div className="rounded-xl border border-shield-border bg-shield-surface overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-shield-card/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-900/30 border border-blue-800">
            <FlaskConical className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-shield-text">Analyze Security Event</div>
            <div className="text-xs text-shield-dim mt-0.5">
              Submit a simulated security event and run it through the detection engine
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-shield-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible body */}
      {isExpanded && (
        <div className="border-t border-shield-border px-5 py-5">
          {/* Demo notice */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-950/30 border border-amber-800/50 px-3 py-2.5 mb-5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80">
              <strong>Demo simulation only.</strong> All analysis runs locally in your browser using simulated data.
              No real emails, credentials, or systems are accessed.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Event type selector */}
            <div>
              <label className="block text-xs font-medium text-shield-dim mb-2">Event Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EVENT_TYPES.map(({ type, label, icon: EIcon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setSelectedType(type); setResult(null); setValidationError(null); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      selectedType === type
                        ? 'border-blue-600 bg-blue-900/30 text-blue-300'
                        : 'border-shield-border hover:border-shield-muted text-shield-dim hover:text-shield-text'
                    }`}
                  >
                    <EIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-shield-muted mt-1.5">{cfg.desc}</p>
            </div>

            {/* Dynamic form */}
            {selectedType === 'email'    && <EmailForm    value={emailData}    onChange={setEmailData} />}
            {selectedType === 'url'      && <URLFormComp  value={urlData}      onChange={setUrlData} />}
            {selectedType === 'auth'     && <AuthForm     value={authData}     onChange={setAuthData} />}
            {selectedType === 'endpoint' && <EndpointForm value={endpointData} onChange={setEndpointData} />}

            {/* Validation error */}
            {validationError && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {validationError}
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={analyzing}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {analyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Analyze Event
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadPreset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-shield-border hover:bg-shield-card text-shield-dim text-sm transition-colors"
              >
                Load Demo Scenario
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-shield-border hover:bg-shield-card text-shield-dim text-sm transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Dashboard
              </button>
            </div>
          </form>

          {/* Result */}
          {result && (
            <ResultCard
              result={result}
              onViewIncident={onNavigateToIncident}
              onDismiss={() => setResult(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
