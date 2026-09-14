/**
 * AI Security Shield MVP — Entry Point
 *
 * Usage:
 *   node index.js [alerts-file]
 *
 * Defaults to alerts.json in the workspace root when no file is given.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { correlate } = require('./src/correlate');
const { renderDashboard } = require('./src/dashboard');

const alertsFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'alerts.json');

const raw = fs.readFileSync(alertsFile, 'utf8');
const alerts = JSON.parse(raw);

const incidents = correlate(alerts);
renderDashboard(incidents);
