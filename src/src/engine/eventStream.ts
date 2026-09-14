import type { RawSignal } from '../types';

// ─── Scripted event stream ─────────────────────────────────────────────────────
// Two attack chains plus background noise.
// All IPs: RFC 5737 documentation ranges. All domains: clearly fictional.
// No real systems, credentials, malware, or offensive capability.
//
// Chain A — "Bob's account compromise" (correlated: bob@company.com / BOB-WIN10 / 198.51.100.33 / threat-update.example)
// Chain B — "Brute-force on carol" (correlated: carol@company.com / 198.51.100.77)
// Background — unrelated low/medium noise signals

export interface StreamEvent {
  delayMs: number;    // ms after the previous event fires
  signal: RawSignal;
}

// helper – returns a timestamp a few minutes before now (for realism)
function ts(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

let streamIdCounter = 200;
function sid(): string {
  return `stream-${String(++streamIdCounter).padStart(3, '0')}`;
}

// ─── Build the stream ─────────────────────────────────────────────────────────

export const EVENT_STREAM: StreamEvent[] = [
  // ── 0s: Background noise — spam email ──────────────────────────────────────
  {
    delayMs: 0,
    signal: {
      id: sid(), timestamp: ts(18), source: 'email', severity: 'low',
      title: 'Bulk Marketing Email Detected',
      description: 'Mass-marketing email from newsletter@deals-promo.example sent to distribution list. No malicious payload detected. Flagged for volume.',
      sender: 'newsletter@deals-promo.example',
      recipient: 'all-staff@company.com',
      subject: 'This week\'s exclusive offers!',
      domain: 'deals-promo.example',
      indicators: ['deals-promo.example', 'bulk sender', 'high volume'],
    } satisfies import('../types').RawEmailSignal,
  },

  // ── 2.5s: Chain A starts — phishing email to bob ───────────────────────────
  {
    delayMs: 2500,
    signal: {
      id: sid(), timestamp: ts(17), source: 'email', severity: 'high',
      title: 'Phishing Email: Credential Harvest Attempt',
      description: 'Email from security-notice@threat-update.example to bob@company.com. Subject contains urgency lure. Body contains credential-harvesting link. Sender domain registered 2 days ago.',
      sender: 'security-notice@threat-update.example',
      recipient: 'bob@company.com',
      subject: 'URGENT: Your account access expires in 24 hours',
      domain: 'threat-update.example',
      indicators: ['threat-update.example', 'bob@company.com', 'urgency lure', 'credential harvesting link'],
    } satisfies import('../types').RawEmailSignal,
  },

  // ── 5s: Background — failed auth on unrelated user ─────────────────────────
  {
    delayMs: 2500,
    signal: {
      id: sid(), timestamp: ts(16), source: 'auth', severity: 'low',
      title: 'Failed Login: dave@company.com',
      description: 'Single failed login attempt for dave@company.com from known office IP. Likely mistyped password. No pattern detected.',
      user: 'dave@company.com',
      ip: '192.0.2.10',
      country: 'US',
      reason: 'Incorrect password — single attempt from known IP',
      indicators: ['dave@company.com', '192.0.2.10'],
    } satisfies import('../types').RawAuthSignal,
  },

  // ── 7.5s: Chain A — Bob clicks the malicious URL ───────────────────────────
  {
    delayMs: 2500,
    signal: {
      id: sid(), timestamp: ts(14), source: 'url', severity: 'critical',
      title: 'Malicious URL Accessed: threat-update.example',
      description: 'User bob@company.com on device BOB-WIN10 accessed http://threat-update.example/verify?token=ZXhhbXBsZQ&session=bob — a credential-harvesting landing page. Domain matches recent phishing campaign indicators.',
      url: 'http://threat-update.example/verify?token=ZXhhbXBsZQ&session=bob',
      domain: 'threat-update.example',
      ip: '198.51.100.33',
      user: 'bob@company.com',
      device: 'BOB-WIN10',
      indicators: ['threat-update.example', '198.51.100.33', 'bob@company.com', 'BOB-WIN10', 'session token in URL'],
    } satisfies import('../types').RawURLSignal,
  },

  // ── 11s: Chain B starts — brute force against carol ────────────────────────
  {
    delayMs: 3500,
    signal: {
      id: sid(), timestamp: ts(13), source: 'auth', severity: 'medium',
      title: 'Multiple Failed Logins: carol@company.com',
      description: '14 failed login attempts for carol@company.com from IP 198.51.100.77 over 6 minutes. Pattern consistent with automated credential-stuffing.',
      user: 'carol@company.com',
      ip: '198.51.100.77',
      country: 'Unknown',
      reason: 'Automated credential-stuffing — 14 failed attempts in 6 minutes',
      indicators: ['carol@company.com', '198.51.100.77', 'credential stuffing', 'automated attack'],
    } satisfies import('../types').RawAuthSignal,
  },

  // ── 14s: Chain A — Bob logs in from suspicious IP ──────────────────────────
  {
    delayMs: 3000,
    signal: {
      id: sid(), timestamp: ts(11), source: 'auth', severity: 'critical',
      title: 'Login Anomaly: Bob — Suspicious IP',
      description: 'Successful authentication for bob@company.com from IP 198.51.100.33 — flagged as Tor/proxy exit node. Login outside normal hours. No MFA challenge presented. Device BOB-WIN10 geolocation mismatch.',
      user: 'bob@company.com',
      ip: '198.51.100.33',
      device: 'BOB-WIN10',
      country: 'Unknown (proxy)',
      reason: 'Login from proxy/Tor IP, outside normal hours, no MFA',
      indicators: ['bob@company.com', '198.51.100.33', 'BOB-WIN10', 'Tor/proxy', 'no MFA'],
    } satisfies import('../types').RawAuthSignal,
  },

  // ── 18s: Background — low severity URL ─────────────────────────────────────
  {
    delayMs: 4000,
    signal: {
      id: sid(), timestamp: ts(9), source: 'url', severity: 'low',
      title: 'Newly Registered Domain Access',
      description: 'Outbound request to newdomain-tracker.example — registered 4 days ago. No malicious payload detected. Logged for monitoring.',
      url: 'http://newdomain-tracker.example/pixel.gif',
      domain: 'newdomain-tracker.example',
      indicators: ['newdomain-tracker.example', 'newly registered domain'],
    } satisfies import('../types').RawURLSignal,
  },

  // ── 22s: Chain A — endpoint compromise on BOB-WIN10 ────────────────────────
  {
    delayMs: 4000,
    signal: {
      id: sid(), timestamp: ts(7), source: 'endpoint', severity: 'critical',
      title: 'Suspicious PowerShell: BOB-WIN10',
      description: 'Encoded PowerShell command executed on BOB-WIN10 under bob@company.com session. Command pattern matches remote payload download — base64 encoded with -noprofile -hidden flags. Characteristic of post-exploitation frameworks.',
      device: 'BOB-WIN10',
      user: 'bob@company.com',
      process: 'powershell.exe',
      commandLine: 'powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAA= -noprofile -hidden -bypass',
      indicators: ['BOB-WIN10', 'bob@company.com', 'powershell base64', 'encoded command', 'network execution pattern'],
    } satisfies import('../types').RawEndpointSignal,
  },

  // ── 26s: Chain B — threat intel match on carol's attacker ──────────────────
  {
    delayMs: 4000,
    signal: {
      id: sid(), timestamp: ts(6), source: 'threat-intel', severity: 'high',
      title: 'Threat Intel: Credential Stuffing Source IP',
      description: 'IP 198.51.100.77 matched in threat intelligence as a known credential-stuffing attack source. Listed in multiple feeds including Spamhaus and Abuse.ch. Previously linked to account takeover campaigns.',
      ip: '198.51.100.77',
      feedName: 'Spamhaus / Abuse.ch',
      confidence: 82,
      indicators: ['198.51.100.77', 'credential stuffing', 'account takeover'],
    } satisfies import('../types').RawThreatIntelSignal,
  },

  // ── 30s: Chain A — threat intel match on bob's IP ──────────────────────────
  {
    delayMs: 4000,
    signal: {
      id: sid(), timestamp: ts(4), source: 'threat-intel', severity: 'critical',
      title: 'Threat Intel: Known Malicious IP — C2 Infrastructure',
      description: 'IP 198.51.100.33 confirmed in threat intelligence feeds (AlienVault OTX, Abuse.ch, Emerging Threats) as active C2 infrastructure associated with credential theft and post-exploitation campaigns. Confidence: 96%.',
      ip: '198.51.100.33',
      domain: 'threat-update.example',
      feedName: 'AlienVault OTX / Abuse.ch / Emerging Threats',
      confidence: 96,
      indicators: ['198.51.100.33', 'threat-update.example', 'C2 infrastructure', 'credential theft'],
    } satisfies import('../types').RawThreatIntelSignal,
  },

  // ── 34s: Background — DLP violation ────────────────────────────────────────
  {
    delayMs: 4000,
    signal: {
      id: sid(), timestamp: ts(2), source: 'email', severity: 'medium',
      title: 'DLP: Sensitive Document — Outbound Email',
      description: 'DLP policy triggered: outbound email from frank@company.com to personal-email@free-mail.example contains attachment classified as sensitive. Auto-quarantine applied.',
      sender: 'frank@company.com',
      recipient: 'personal-email@free-mail.example',
      subject: 'Q3 financials',
      domain: 'free-mail.example',
      indicators: ['frank@company.com', 'DLP trigger', 'sensitive document', 'personal email'],
    } satisfies import('../types').RawEmailSignal,
  },

  // ── 38s: Chain A — lateral movement attempt ────────────────────────────────
  {
    delayMs: 4000,
    signal: {
      id: sid(), timestamp: ts(1), source: 'endpoint', severity: 'high',
      title: 'Lateral Movement Attempt: BOB-WIN10',
      description: 'Net command executed on BOB-WIN10 attempting to enumerate network shares and user accounts. Process tree shows parent powershell.exe — consistent with post-exploitation lateral movement reconnaissance.',
      device: 'BOB-WIN10',
      user: 'bob@company.com',
      process: 'net.exe',
      commandLine: 'net view /domain && net user /domain && net localgroup administrators',
      indicators: ['BOB-WIN10', 'bob@company.com', 'net.exe', 'lateral movement', 'domain enumeration'],
    } satisfies import('../types').RawEndpointSignal,
  },
];

// Total playback time ≈ 38s at the default delays above
export const STREAM_LENGTH = EVENT_STREAM.length;
