/// <reference types="vite/client" />
import type { Incident } from '../types';

// ─── Fallback Summary Generator ───────────────────────────────────────────────
// Generates a structured plain-text summary without any external API call.
// This is the primary summary engine and also serves as the fallback.

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateFallbackSummary(incident: Incident): string {
  const { signals, riskScore, riskLevel, techniques, correlationReasons, recommendedAction } = incident;

  const sourceTypes = [...new Set(signals.map((s) => s.source))];
  const user = signals.find((s) => s.indicators.user)?.indicators.user;
  const device = signals.find((s) => s.indicators.device)?.indicators.device;
  const ip = signals.find((s) => s.indicators.ip)?.indicators.ip;
  const domain = signals.find((s) => s.indicators.domain)?.indicators.domain;
  const hasThreatIntel = signals.some((s) => s.source === 'threat-intel');

  const entityParts: string[] = [];
  if (user) entityParts.push(`user ${user}`);
  if (device) entityParts.push(`device ${device}`);
  const entityStr = entityParts.length > 0 ? entityParts.join(' and ') : 'an unknown entity';

  const sourceSummary = sourceTypes
    .map((s) => {
      switch (s) {
        case 'email': return 'a suspicious phishing email';
        case 'url': return 'a malicious URL click';
        case 'auth': return 'an authentication anomaly';
        case 'endpoint': return 'suspicious endpoint activity';
        case 'threat-intel': return 'a threat intelligence match';
        default: return 'an unknown signal';
      }
    })
    .join(', ');

  const techniqueSummary =
    techniques.length > 0
      ? `Techniques identified: ${techniques.map((t) => `${t.name} (${t.id})`).join(', ')}.`
      : '';

  const threatIntelLine = hasThreatIntel
    ? ` The source IP${ip ? ` ${ip}` : ''} matches known threat intelligence feeds, confirming malicious infrastructure.`
    : '';

  const correlationLine =
    correlationReasons.length > 0
      ? ` These signals are correlated by: ${correlationReasons.slice(0, 3).join('; ')}.`
      : '';

  const domainLine = domain ? ` The domain ${domain} is associated with multiple malicious signals.` : '';

  const summary =
    `⚠ SECURITY INCIDENT SUMMARY\n\n` +
    `WHAT HAPPENED: A coordinated sequence of ${signals.length} security signal${signals.length > 1 ? 's' : ''} was detected targeting ${entityStr}. ` +
    `The attack chain includes ${sourceSummary}.${domainLine}${threatIntelLine}\n\n` +
    `WHY IT IS SUSPICIOUS: ${correlationLine} ` +
    `The signals form a logical attack progression — from initial phishing through credential theft to active endpoint compromise. ` +
    `Risk Score: ${riskScore}/100 (${riskLevel}).${techniqueSummary ? ' ' + techniqueSummary : ''}\n\n` +
    `CONFIDENCE: ${riskScore >= 76 ? 'High' : riskScore >= 51 ? 'Medium-High' : 'Medium'} — ` +
    `based on ${signals.length} correlated signal${signals.length > 1 ? 's' : ''} with ` +
    `${[user && 'matching user', device && 'matching device', ip && 'matching IP'].filter(Boolean).join(', ')} indicators.\n\n` +
    `RECOMMENDED ACTION: ${recommendedAction}`;

  return summary;
}

// ─── IBM watsonx.ai / Bob API Client ─────────────────────────────────────────
// If VITE_BOB_API_KEY and VITE_BOB_PROJECT_ID are set, calls the real API.
// Otherwise, returns the fallback summary immediately.

const BOB_API_KEY = import.meta.env.VITE_BOB_API_KEY as string | undefined;
const BOB_PROJECT_ID = import.meta.env.VITE_BOB_PROJECT_ID as string | undefined;
const BOB_URL = (import.meta.env.VITE_BOB_URL as string | undefined) ?? 'https://us-south.ml.cloud.ibm.com';

function buildPrompt(incident: Incident): string {
  const signals = incident.signals
    .map((s, i) => `  ${i + 1}. [${s.source.toUpperCase()}] ${s.title} (severity: ${s.severity})`)
    .join('\n');

  const techniques = incident.techniques.map((t) => `${t.name} (${t.id})`).join(', ') || 'None identified';

  return `You are an expert cybersecurity analyst AI assistant. Analyze the following security incident and provide a concise, clear investigation summary for a security operations center (SOC) analyst.

Incident ID: ${incident.id}
Risk Score: ${incident.riskScore}/100 (${incident.riskLevel})
Correlated Signals (${incident.signals.length} total):
${signals}

Techniques Identified: ${techniques}
Correlation Reasons: ${incident.correlationReasons.join('; ')}

Write a 4-5 sentence BLUF (Bottom Line Up Front) investigation summary covering:
1. What happened (the attack chain in plain language)
2. Why it is suspicious (specific evidence)
3. Risk assessment
4. Single most important recommended action

Write for a security analyst. Be direct and specific. Do not repeat the incident ID.`;
}

export async function generateAISummary(incident: Incident): Promise<string> {
  // Use fallback if no API key configured
  if (!BOB_API_KEY || !BOB_PROJECT_ID) {
    return generateFallbackSummary(incident);
  }

  try {
    // Get IAM token first
    const tokenRes = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(BOB_API_KEY)}`,
    });

    if (!tokenRes.ok) {
      console.warn('[AI Shield] IAM token fetch failed, using fallback summary.');
      return generateFallbackSummary(incident);
    }

    const tokenData = await tokenRes.json() as { access_token: string };
    const accessToken = tokenData.access_token;

    // Call watsonx.ai text generation
    const response = await fetch(`${BOB_URL}/ml/v1/text/generation?version=2023-05-29`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        model_id: 'ibm/granite-13b-instruct-v2',
        input: buildPrompt(incident),
        parameters: {
          max_new_tokens: 400,
          min_new_tokens: 80,
          temperature: 0.3,
          repetition_penalty: 1.1,
        },
        project_id: BOB_PROJECT_ID,
      }),
    });

    if (!response.ok) {
      console.warn('[AI Shield] watsonx.ai call failed, using fallback summary.');
      return generateFallbackSummary(incident);
    }

    const data = await response.json() as { results: { generated_text: string }[] };
    const text = data?.results?.[0]?.generated_text?.trim();

    if (!text || text.length < 40) {
      return generateFallbackSummary(incident);
    }

    return text;
  } catch (err) {
    console.warn('[AI Shield] Error calling watsonx.ai, using fallback summary:', err);
    return generateFallbackSummary(incident);
  }
}
