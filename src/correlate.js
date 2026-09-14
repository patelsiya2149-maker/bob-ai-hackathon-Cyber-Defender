/**
 * Alert Correlation Engine
 *
 * Groups raw alerts into incidents by user+device identity.  Each incident
 * is enriched with MITRE ATT&CK technique mappings via the mitre module.
 */

'use strict';

const { mapAlertsToTechniques } = require('./mitre');

/**
 * Severity ordering used to derive the overall incident severity.
 * Higher index = higher severity.
 */
const SEVERITY_RANK = { low: 0, medium: 1, high: 2, critical: 3 };

/**
 * Derive a stable incident ID from a 1-based index.
 *
 * @param {number} index  1-based position.
 * @returns {string}  e.g. "INC-001"
 */
function incidentId(index) {
  return `INC-${String(index).padStart(3, '0')}`;
}

/**
 * Return the highest severity string from an array of alerts.
 *
 * @param {Array<{severity: string}>} alerts
 * @returns {string}
 */
function highestSeverity(alerts) {
  return alerts.reduce((best, alert) => {
    const rank = SEVERITY_RANK[alert.severity] ?? -1;
    return rank > (SEVERITY_RANK[best] ?? -1) ? alert.severity : best;
  }, 'low');
}

/**
 * Correlate a flat array of alert objects into incidents.
 *
 * Grouping key: (user, device).  Alerts without a user are grouped under
 * the sentinel user "_unknown_".  Each incident is assigned:
 *   - id          — sequential INC-NNN identifier
 *   - user        — the user shared by all alerts in the group
 *   - device      — the device shared by all alerts (or null)
 *   - severity    — highest severity across the group's alerts
 *   - alerts      — the raw alert objects belonging to this incident
 *   - mitre       — de-duplicated MITRE ATT&CK technique mappings
 *
 * @param {Array<object>} alerts  Raw alert objects from the data source.
 * @returns {Array<object>}  Sorted list of correlated incidents.
 */
function correlate(alerts) {
  /** @type {Map<string, object[]>} key → alert list */
  const groups = new Map();

  for (const alert of alerts) {
    const user = alert.user ?? '_unknown_';
    const device = alert.device ?? '_unknown_';
    const key = `${user}|${device}`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(alert);
  }

  const incidents = [];
  let seq = 1;

  for (const [, groupAlerts] of groups) {
    // Sort alerts within the incident by timestamp (ascending).
    const sorted = [...groupAlerts].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const first = sorted[0];
    incidents.push({
      id: incidentId(seq++),
      user: first.user ?? '_unknown_',
      device: first.device ?? null,
      severity: highestSeverity(sorted),
      alerts: sorted,
      mitre: mapAlertsToTechniques(sorted),
    });
  }

  return incidents;
}

module.exports = { correlate };
