/**
 * BLUF (Bottom Line Up Front) Summary Generator
 *
 * Produces a concise, plain-text investigation summary for a single
 * incident.  The MITRE ATT&CK mappings are embedded in the summary so
 * analysts can instantly see threat context alongside the key facts.
 */

'use strict';

const SEVERITY_EMOJI = {
  critical: '[CRITICAL]',
  high: '[HIGH]',
  medium: '[MEDIUM]',
  low: '[LOW]',
};

/**
 * Build a BLUF summary string for the given incident.
 *
 * @param {object} incident  A correlated incident (output of correlate()).
 * @returns {string}
 */
function buildBluf(incident) {
  const lines = [];
  const sev = SEVERITY_EMOJI[incident.severity] ?? `[${incident.severity.toUpperCase()}]`;

  lines.push(`BLUF — ${incident.id}  ${sev}`);
  lines.push('─'.repeat(60));

  // Identity
  lines.push(`User   : ${incident.user}`);
  if (incident.device) lines.push(`Device : ${incident.device}`);

  // Alert count
  lines.push(`Alerts : ${incident.alerts.length} (IDs: ${incident.alerts.map((a) => a.id).join(', ')})`);

  // Time window
  const timestamps = incident.alerts
    .map((a) => new Date(a.timestamp))
    .sort((a, b) => a - b);
  const start = timestamps[0].toISOString();
  const end = timestamps[timestamps.length - 1].toISOString();
  lines.push(`Window : ${start} → ${end}`);

  lines.push('');

  // MITRE ATT&CK techniques
  if (incident.mitre.length > 0) {
    lines.push('MITRE ATT&CK:');
    for (const mapping of incident.mitre) {
      lines.push(`  • ${mapping.techniqueId} — ${mapping.techniqueName}`);
      lines.push(`      Evidence: ${mapping.evidence.join(', ')}`);
    }
  } else {
    lines.push('MITRE ATT&CK: No techniques mapped for this incident.');
  }

  lines.push('');

  // Notable alert descriptions (highest-severity ones first, cap at 3)
  const ranked = [...incident.alerts].sort(
    (a, b) =>
      (SEVERITY_RANK_FOR_BLUF[b.severity] ?? 0) -
      (SEVERITY_RANK_FOR_BLUF[a.severity] ?? 0)
  );
  const notable = ranked.slice(0, 3);
  lines.push('Key Observations:');
  for (const alert of notable) {
    lines.push(`  [${alert.id}] ${alert.description}`);
  }

  return lines.join('\n');
}

const SEVERITY_RANK_FOR_BLUF = { low: 0, medium: 1, high: 2, critical: 3 };

module.exports = { buildBluf };
