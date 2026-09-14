'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  TECHNIQUE_MAP,
  getTechniqueForType,
  mapAlertsToTechniques,
} = require('../src/mitre');

// ─────────────────────────────────────────────────────────────────────────────
// TECHNIQUE_MAP integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('TECHNIQUE_MAP', () => {
  it('contains an entry for suspicious_email → T1566', () => {
    assert.equal(TECHNIQUE_MAP.suspicious_email.id, 'T1566');
    assert.equal(TECHNIQUE_MAP.suspicious_email.name, 'Phishing');
  });

  it('contains an entry for suspicious_url → T1566.002', () => {
    assert.equal(TECHNIQUE_MAP.suspicious_url.id, 'T1566.002');
    assert.equal(
      TECHNIQUE_MAP.suspicious_url.name,
      'Phishing: Spearphishing Link'
    );
  });

  it('contains an entry for failed_login → T1110', () => {
    assert.equal(TECHNIQUE_MAP.failed_login.id, 'T1110');
    assert.equal(TECHNIQUE_MAP.failed_login.name, 'Brute Force');
  });

  it('contains an alias for multiple_failed_logins → T1110', () => {
    assert.equal(TECHNIQUE_MAP.multiple_failed_logins.id, 'T1110');
    assert.equal(TECHNIQUE_MAP.multiple_failed_logins.name, 'Brute Force');
  });

  it('contains an entry for powershell_activity → T1059.001', () => {
    assert.equal(TECHNIQUE_MAP.powershell_activity.id, 'T1059.001');
    assert.equal(
      TECHNIQUE_MAP.powershell_activity.name,
      'Command and Scripting Interpreter: PowerShell'
    );
  });

  it('contains an entry for suspicious_account_usage → T1078', () => {
    assert.equal(TECHNIQUE_MAP.suspicious_account_usage.id, 'T1078');
    assert.equal(TECHNIQUE_MAP.suspicious_account_usage.name, 'Valid Accounts');
  });

  it('does not contain invented technique IDs', () => {
    const knownIds = new Set(['T1566', 'T1566.002', 'T1110', 'T1059.001', 'T1078']);
    for (const entry of Object.values(TECHNIQUE_MAP)) {
      assert.ok(
        knownIds.has(entry.id),
        `Unexpected technique ID "${entry.id}" found in TECHNIQUE_MAP`
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getTechniqueForType
// ─────────────────────────────────────────────────────────────────────────────

describe('getTechniqueForType', () => {
  it('returns the correct technique for suspicious_email', () => {
    const t = getTechniqueForType('suspicious_email');
    assert.equal(t.id, 'T1566');
  });

  it('returns the correct technique for suspicious_url', () => {
    const t = getTechniqueForType('suspicious_url');
    assert.equal(t.id, 'T1566.002');
  });

  it('returns the correct technique for failed_login', () => {
    const t = getTechniqueForType('failed_login');
    assert.equal(t.id, 'T1110');
  });

  it('returns the correct technique for multiple_failed_logins', () => {
    const t = getTechniqueForType('multiple_failed_logins');
    assert.equal(t.id, 'T1110');
  });

  it('returns the correct technique for powershell_activity', () => {
    const t = getTechniqueForType('powershell_activity');
    assert.equal(t.id, 'T1059.001');
  });

  it('returns the correct technique for suspicious_account_usage', () => {
    const t = getTechniqueForType('suspicious_account_usage');
    assert.equal(t.id, 'T1078');
  });

  it('returns null for an unmapped alert type', () => {
    assert.equal(getTechniqueForType('ti_match'), null);
    assert.equal(getTechniqueForType('suspicious_script'), null);
    assert.equal(getTechniqueForType('newsletter'), null);
    assert.equal(getTechniqueForType(''), null);
    assert.equal(getTechniqueForType('unknown_type_xyz'), null);
  });

  it('is case-sensitive — uppercase variant returns null', () => {
    assert.equal(getTechniqueForType('SUSPICIOUS_EMAIL'), null);
    assert.equal(getTechniqueForType('PowerShell_Activity'), null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mapAlertsToTechniques
// ─────────────────────────────────────────────────────────────────────────────

describe('mapAlertsToTechniques', () => {
  it('returns an empty array for an empty alert list', () => {
    assert.deepEqual(mapAlertsToTechniques([]), []);
  });

  it('returns an empty array when no alerts have mapped types', () => {
    const alerts = [
      { id: 'A001', type: 'ti_match' },
      { id: 'A002', type: 'newsletter' },
    ];
    assert.deepEqual(mapAlertsToTechniques(alerts), []);
  });

  it('maps a single suspicious_url alert to T1566.002', () => {
    const alerts = [{ id: 'A001', type: 'suspicious_url' }];
    const result = mapAlertsToTechniques(alerts);
    assert.equal(result.length, 1);
    assert.equal(result[0].techniqueId, 'T1566.002');
    assert.equal(result[0].techniqueName, 'Phishing: Spearphishing Link');
    assert.deepEqual(result[0].evidence, ['A001']);
  });

  it('maps a single powershell_activity alert to T1059.001', () => {
    const alerts = [{ id: 'A006', type: 'powershell_activity' }];
    const result = mapAlertsToTechniques(alerts);
    assert.equal(result.length, 1);
    assert.equal(result[0].techniqueId, 'T1059.001');
    assert.deepEqual(result[0].evidence, ['A006']);
  });

  it('deduplicates techniques when multiple alerts share the same type', () => {
    const alerts = [
      { id: 'A004', type: 'multiple_failed_logins' },
      { id: 'A008', type: 'multiple_failed_logins' },
    ];
    const result = mapAlertsToTechniques(alerts);
    // Both resolve to T1110 — should be one entry with two evidence IDs.
    assert.equal(result.length, 1);
    assert.equal(result[0].techniqueId, 'T1110');
    assert.deepEqual(result[0].evidence, ['A004', 'A008']);
  });

  it('deduplicates across alias types (failed_login and multiple_failed_logins both → T1110)', () => {
    const alerts = [
      { id: 'A001', type: 'failed_login' },
      { id: 'A002', type: 'multiple_failed_logins' },
    ];
    const result = mapAlertsToTechniques(alerts);
    assert.equal(result.length, 1);
    assert.equal(result[0].techniqueId, 'T1110');
    assert.deepEqual(result[0].evidence, ['A001', 'A002']);
  });

  it('produces multiple distinct techniques from a mixed alert set', () => {
    const alerts = [
      { id: 'A001', type: 'suspicious_url' },
      { id: 'A004', type: 'multiple_failed_logins' },
      { id: 'A006', type: 'powershell_activity' },
    ];
    const result = mapAlertsToTechniques(alerts);
    assert.equal(result.length, 3);

    const ids = result.map((r) => r.techniqueId);
    assert.ok(ids.includes('T1566.002'));
    assert.ok(ids.includes('T1110'));
    assert.ok(ids.includes('T1059.001'));
  });

  it('preserves first-occurrence ordering of techniques', () => {
    const alerts = [
      { id: 'A001', type: 'powershell_activity' },
      { id: 'A002', type: 'suspicious_url' },
      { id: 'A003', type: 'powershell_activity' }, // duplicate — merged, not reordered
    ];
    const result = mapAlertsToTechniques(alerts);
    assert.equal(result[0].techniqueId, 'T1059.001'); // powershell appeared first
    assert.equal(result[1].techniqueId, 'T1566.002');
    assert.deepEqual(result[0].evidence, ['A001', 'A003']); // both evidence IDs accumulated
  });

  it('ignores alerts with unmapped types and still maps the others', () => {
    const alerts = [
      { id: 'A001', type: 'ti_match' },       // no mapping
      { id: 'A002', type: 'suspicious_url' },  // mapped
      { id: 'A003', type: 'suspicious_script' }, // no mapping
    ];
    const result = mapAlertsToTechniques(alerts);
    assert.equal(result.length, 1);
    assert.equal(result[0].techniqueId, 'T1566.002');
    assert.deepEqual(result[0].evidence, ['A002']);
  });

  // ── Scenario: Incident INC-001 from the task specification ────────────────
  it('produces the correct mappings for the INC-001 example scenario', () => {
    // Simulates the jsmith incident from alerts.json
    const alerts = [
      { id: 'A001', type: 'suspicious_email' },
      { id: 'A002', type: 'suspicious_url' },
      { id: 'A003', type: 'suspicious_account_usage' },
    ];
    const result = mapAlertsToTechniques(alerts);

    assert.equal(result.length, 3);

    const byId = Object.fromEntries(result.map((r) => [r.techniqueId, r]));

    assert.ok(byId['T1566'], 'T1566 must be present');
    assert.equal(byId['T1566'].techniqueName, 'Phishing');
    assert.deepEqual(byId['T1566'].evidence, ['A001']);

    assert.ok(byId['T1566.002'], 'T1566.002 must be present');
    assert.equal(byId['T1566.002'].techniqueName, 'Phishing: Spearphishing Link');
    assert.deepEqual(byId['T1566.002'].evidence, ['A002']);

    assert.ok(byId['T1078'], 'T1078 must be present');
    assert.equal(byId['T1078'].techniqueName, 'Valid Accounts');
    assert.deepEqual(byId['T1078'].evidence, ['A003']);
  });
});
