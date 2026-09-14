/**
 * Incident Dashboard — CLI Renderer
 *
 * Renders a formatted incident dashboard to stdout, showing all correlated
 * incidents, their alerts, MITRE ATT&CK mappings, and BLUF summaries.
 */

'use strict';

const { buildBluf } = require('./bluf');

const SEVERITY_COLOR = {
  critical: '\x1b[31m', // red
  high: '\x1b[33m',     // yellow
  medium: '\x1b[36m',   // cyan
  low: '\x1b[37m',      // white
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function colorize(severity, text) {
  const color = SEVERITY_COLOR[severity] ?? '';
  return `${color}${text}${RESET}`;
}

/**
 * Print the full incident dashboard to stdout.
 *
 * @param {Array<object>} incidents  Output of correlate().
 */
function renderDashboard(incidents) {
  const divider = '═'.repeat(70);
  const subDivider = '─'.repeat(70);

  console.log(`\n${BOLD}╔${'═'.repeat(68)}╗${RESET}`);
  console.log(
    `${BOLD}║${'  AI SECURITY SHIELD — INCIDENT DASHBOARD'.padEnd(68)}║${RESET}`
  );
  console.log(`${BOLD}╚${'═'.repeat(68)}╝${RESET}\n`);

  console.log(
    `${BOLD}Total incidents: ${incidents.length}${RESET}   ` +
    `Critical: ${incidents.filter((i) => i.severity === 'critical').length}  ` +
    `High: ${incidents.filter((i) => i.severity === 'high').length}  ` +
    `Medium: ${incidents.filter((i) => i.severity === 'medium').length}  ` +
    `Low: ${incidents.filter((i) => i.severity === 'low').length}`
  );
  console.log(divider + '\n');

  for (const incident of incidents) {
    // ── Incident header ──────────────────────────────────────────────────
    const sevLabel = colorize(
      incident.severity,
      `[${incident.severity.toUpperCase()}]`
    );
    console.log(
      `${BOLD}Incident ${incident.id}${RESET}  ${sevLabel}  ` +
      `User: ${incident.user}` +
      (incident.device ? `  Device: ${incident.device}` : '')
    );
    console.log(subDivider);

    // ── Alerts table ─────────────────────────────────────────────────────
    console.log(`${BOLD}Alerts (${incident.alerts.length}):${RESET}`);
    for (const alert of incident.alerts) {
      const sev = colorize(alert.severity, alert.severity.toUpperCase().padEnd(8));
      console.log(
        `  ${DIM}${alert.timestamp}${RESET}  ${alert.id}  ${sev}  ` +
        `${alert.type}  ${alert.indicator ?? ''}`
      );
    }

    // ── MITRE ATT&CK mappings ────────────────────────────────────────────
    console.log(`\n${BOLD}MITRE ATT&CK:${RESET}`);
    if (incident.mitre.length === 0) {
      console.log(`  ${DIM}(no techniques mapped)${RESET}`);
    } else {
      for (const mapping of incident.mitre) {
        console.log(
          `  ${BOLD}${mapping.techniqueId}${RESET} — ${mapping.techniqueName}`
        );
        console.log(
          `    ${DIM}Evidence: ${mapping.evidence.join(', ')}${RESET}`
        );
      }
    }

    // ── BLUF summary ─────────────────────────────────────────────────────
    console.log(`\n${BOLD}BLUF Summary:${RESET}`);
    const bluf = buildBluf(incident);
    // Indent BLUF lines for visual nesting under the incident block.
    bluf.split('\n').forEach((line) => console.log(`  ${line}`));

    console.log('\n' + divider + '\n');
  }
}

module.exports = { renderDashboard };
