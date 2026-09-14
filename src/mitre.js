/**
 * MITRE ATT&CK Mapping Module
 *
 * A small, curated, and transparent mapping of normalized alert/behavior
 * types to MITRE ATT&CK techniques.  Only the five techniques listed below
 * are recognized; no IDs are invented or inferred at runtime.
 *
 * Technique IDs and names are sourced verbatim from
 * https://attack.mitre.org/ and are never derived dynamically.
 */

'use strict';

/**
 * Curated mapping: alert type → MITRE ATT&CK technique.
 *
 * Keys are the normalized `type` values that appear on alert objects.
 * Values are frozen objects with `id` and `name` exactly as published by
 * MITRE.
 *
 * @type {Readonly<Record<string, {id: string, name: string}>>}
 */
const TECHNIQUE_MAP = Object.freeze({
  suspicious_email: Object.freeze({
    id: 'T1566',
    name: 'Phishing',
  }),
  suspicious_url: Object.freeze({
    id: 'T1566.002',
    name: 'Phishing: Spearphishing Link',
  }),
  failed_login: Object.freeze({
    id: 'T1110',
    name: 'Brute Force',
  }),
  // alert.json uses "multiple_failed_logins" — treat as an alias
  multiple_failed_logins: Object.freeze({
    id: 'T1110',
    name: 'Brute Force',
  }),
  powershell_activity: Object.freeze({
    id: 'T1059.001',
    name: 'Command and Scripting Interpreter: PowerShell',
  }),
  suspicious_account_usage: Object.freeze({
    id: 'T1078',
    name: 'Valid Accounts',
  }),
});

/**
 * Look up the MITRE technique for a single alert type.
 *
 * @param {string} alertType  Normalized alert type string.
 * @returns {{ id: string, name: string } | null}
 *   The matching technique, or `null` if the type is not mapped.
 */
function getTechniqueForType(alertType) {
  return TECHNIQUE_MAP[alertType] ?? null;
}

/**
 * Given an array of alert objects, return the de-duplicated list of MITRE
 * ATT&CK technique mappings together with the alert IDs that caused each
 * mapping.
 *
 * Processing is deterministic: the output order follows the first occurrence
 * of each technique ID in the input array.
 *
 * @param {Array<{id: string, type: string}>} alerts
 * @returns {Array<{techniqueId: string, techniqueName: string, evidence: string[]}>}
 */
function mapAlertsToTechniques(alerts) {
  /** @type {Map<string, {techniqueId: string, techniqueName: string, evidence: string[]}>} */
  const byTechniqueId = new Map();

  for (const alert of alerts) {
    const technique = getTechniqueForType(alert.type);
    if (!technique) continue;

    if (byTechniqueId.has(technique.id)) {
      byTechniqueId.get(technique.id).evidence.push(alert.id);
    } else {
      byTechniqueId.set(technique.id, {
        techniqueId: technique.id,
        techniqueName: technique.name,
        evidence: [alert.id],
      });
    }
  }

  return Array.from(byTechniqueId.values());
}

module.exports = { TECHNIQUE_MAP, getTechniqueForType, mapAlertsToTechniques };
