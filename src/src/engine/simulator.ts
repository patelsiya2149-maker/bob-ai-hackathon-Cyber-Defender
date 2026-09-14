import type {
  RawSignal,
  RawEmailSignal,
  RawURLSignal,
  RawAuthSignal,
  RawEndpointSignal,
} from '../types';

// ─── Safe simulation helpers ──────────────────────────────────────────────────
// All IPs are from RFC 5737 documentation ranges (192.0.2.x, 198.51.100.x)
// All domains are clearly fake (.example, .test, or obviously fictional)
// No real credentials, no real infrastructure, no offensive capability.

let simCounter = 100;
function nextId(): string {
  return `sim-${String(++simCounter).padStart(3, '0')}`;
}

function now(): string {
  return new Date().toISOString();
}

// ── Email fields ──────────────────────────────────────────────────────────────
export interface EmailInput {
  senderEmail: string;   // e.g. "alert@suspicious-domain.example"
  recipientEmail: string; // e.g. "user@company.com"
  subject: string;
  body: string;
}

export function buildEmailSignal(input: EmailInput): RawEmailSignal {
  const senderDomain = input.senderEmail.split('@')[1] ?? 'unknown.example';
  const isUrgent = /urgent|suspend|verify|password|account|click|confirm/i.test(
    input.subject + ' ' + input.body
  );
  const hasLink = /http|www\.|\.com|\.ru|\.xyz/i.test(input.body);
  const severity = isUrgent && hasLink ? 'high' : isUrgent || hasLink ? 'medium' : 'low';

  return {
    id: nextId(),
    timestamp: now(),
    source: 'email',
    severity,
    title: `Suspicious Email: "${input.subject.slice(0, 60)}"`,
    description: `Email received from ${input.senderEmail} to ${input.recipientEmail}. ` +
      `Subject: "${input.subject}". ` +
      (isUrgent ? 'Contains urgency/action lure language. ' : '') +
      (hasLink ? 'Contains embedded link or URL reference. ' : '') +
      `Sender domain "${senderDomain}" flagged for analysis.`,
    sender: input.senderEmail,
    recipient: input.recipientEmail,
    subject: input.subject,
    domain: senderDomain,
    indicators: [
      input.senderEmail,
      senderDomain,
      input.recipientEmail,
      ...(isUrgent ? ['urgency lure'] : []),
      ...(hasLink ? ['embedded link'] : []),
    ],
  };
}

// ── URL fields ────────────────────────────────────────────────────────────────
export interface URLInput {
  url: string;
  user?: string;
  device?: string;
}

export function buildURLSignal(input: URLInput): RawURLSignal {
  let domain = 'unknown.example';
  try {
    const u = new URL(input.url.startsWith('http') ? input.url : `http://${input.url}`);
    domain = u.hostname;
  } catch {
    domain = input.url.split('/')[0];
  }

  const isSuspiciousDomain = /\d{4,}|login|verify|account|secure|update|reset|phish/i.test(domain);
  const isHttp = input.url.startsWith('http://') && !input.url.startsWith('https://');
  const hasQueryToken = /token=|id=|session=|key=/i.test(input.url);
  const severity =
    isSuspiciousDomain && hasQueryToken ? 'critical'
    : isSuspiciousDomain || isHttp ? 'high'
    : 'medium';

  return {
    id: nextId(),
    timestamp: now(),
    source: 'url',
    severity,
    title: `Suspicious URL Accessed: ${domain}`,
    description: `URL "${input.url}" was accessed` +
      (input.user ? ` by user ${input.user}` : '') +
      (input.device ? ` on device ${input.device}` : '') +
      `. Domain "${domain}" flagged: ` +
      (isSuspiciousDomain ? 'matches suspicious domain pattern. ' : '') +
      (isHttp ? 'Non-HTTPS connection. ' : '') +
      (hasQueryToken ? 'URL contains credential/session token parameters.' : ''),
    url: input.url,
    domain,
    ip: undefined,
    user: input.user || undefined,
    device: input.device || undefined,
    indicators: [
      domain,
      input.url,
      ...(input.user ? [input.user] : []),
      ...(input.device ? [input.device] : []),
      ...(isSuspiciousDomain ? ['suspicious domain pattern'] : []),
      ...(hasQueryToken ? ['session token in URL'] : []),
    ],
  };
}

// ── Auth/Login fields ─────────────────────────────────────────────────────────
export interface AuthInput {
  username: string;
  sourceIp: string;
  device?: string;
  reason: string;   // e.g. "Login from new country", "Failed MFA"
}

export function buildAuthSignal(input: AuthInput): RawAuthSignal {
  const isDocumentationIp = /^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(input.sourceIp);
  const isSuspiciousReason = /tor|vpn|proxy|mfa|fail|unusual|unknown|anomal|new country|new device/i.test(
    input.reason
  );
  const severity = isSuspiciousReason ? 'high' : 'medium';

  return {
    id: nextId(),
    timestamp: now(),
    source: 'auth',
    severity,
    title: `Authentication Anomaly: ${input.username}`,
    description: `Authentication event for user "${input.username}" from IP ${input.sourceIp}` +
      (input.device ? ` on device "${input.device}"` : '') +
      `. Anomaly reason: ${input.reason}.` +
      (isDocumentationIp ? ' Source IP is in a test/documentation range.' : ''),
    user: input.username,
    ip: input.sourceIp,
    device: input.device || undefined,
    country: 'Unknown',
    reason: input.reason,
    indicators: [
      input.username,
      input.sourceIp,
      ...(input.device ? [input.device] : []),
      input.reason,
    ],
  };
}

// ── Endpoint fields ───────────────────────────────────────────────────────────
export interface EndpointInput {
  deviceName: string;
  user?: string;
  processName: string;
  commandLine?: string;
}

export function buildEndpointSignal(input: EndpointInput): RawEndpointSignal {
  const isSuspiciousProcess = /powershell|cmd|wscript|cscript|mshta|rundll|regsvr|nc\.exe|ncat|python|curl|wget/i.test(
    input.processName
  );
  const hasEncodedCmd = /\-enc|\-encoded|base64|frombase64/i.test(input.commandLine ?? '');
  const hasNetworkCmd = /invoke-web|downloadstring|iex|bypass|hidden|noprofile/i.test(
    input.commandLine ?? ''
  );
  const severity =
    hasEncodedCmd || hasNetworkCmd ? 'critical'
    : isSuspiciousProcess ? 'high'
    : 'medium';

  return {
    id: nextId(),
    timestamp: now(),
    source: 'endpoint',
    severity,
    title: `Suspicious Process on ${input.deviceName}: ${input.processName}`,
    description: `Process "${input.processName}" was executed on device "${input.deviceName}"` +
      (input.user ? ` by user "${input.user}"` : '') +
      (input.commandLine ? ` with command: "${input.commandLine.slice(0, 120)}"` : '') +
      '. ' +
      (isSuspiciousProcess ? 'Process name matches known high-risk interpreter. ' : '') +
      (hasEncodedCmd ? 'Encoded command detected — typical of obfuscation. ' : '') +
      (hasNetworkCmd ? 'Command contains network download/execution pattern.' : ''),
    device: input.deviceName,
    user: input.user || undefined,
    process: input.processName,
    commandLine: input.commandLine || undefined,
    indicators: [
      input.deviceName,
      input.processName,
      ...(input.user ? [input.user] : []),
      ...(hasEncodedCmd ? ['encoded command'] : []),
      ...(hasNetworkCmd ? ['network execution pattern'] : []),
    ],
  };
}

// ─── Union builder ─────────────────────────────────────────────────────────────
export type EventType = 'email' | 'url' | 'auth' | 'endpoint';

export type EventInput =
  | { type: 'email'; data: EmailInput }
  | { type: 'url'; data: URLInput }
  | { type: 'auth'; data: AuthInput }
  | { type: 'endpoint'; data: EndpointInput };

export function buildSignalFromInput(input: EventInput): RawSignal {
  switch (input.type) {
    case 'email':    return buildEmailSignal(input.data);
    case 'url':      return buildURLSignal(input.data);
    case 'auth':     return buildAuthSignal(input.data);
    case 'endpoint': return buildEndpointSignal(input.data);
  }
}
