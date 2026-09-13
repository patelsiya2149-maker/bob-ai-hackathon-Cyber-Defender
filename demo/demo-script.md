# Demo Script

## AI Security Shield — Demo Walkthrough

**Duration:** ~3 minutes  
**What to show:** A coordinated 5-signal cyber attack against user `alice@company.com` — automatically detected, correlated, scored, and warned by AI Security Shield.

---

## Step 1 — Open the Dashboard (~30 seconds)

Open browser at **http://localhost:5173**

**Say:**
> "This is the AI Security Shield SOC dashboard. It has ingested 12 security signals from across our organization — emails, URL clicks, authentication events, endpoint alerts, and threat intelligence feeds. The system has automatically correlated these into separate incidents. Let's look at the most critical one."

**Point to:**
- The 4 stat cards (12 total signals, active incidents, high/critical count, average risk score)
- The CRITICAL incident at the top of the incident table with a red badge

---

## Step 2 — Click the CRITICAL Incident (~15 seconds)

Click the row showing **Multi-Signal Incident — alice@company.com** with `CRITICAL` badge.

**Say:**
> "I'm clicking on this CRITICAL incident. Watch what happens."

---

## Step 3 — Security Shield Warning Fires (~30 seconds)

The Incident Detail page loads with the Security Shield Warning banner at the top.

**Say:**
> "The AI Security Shield immediately fires this warning. CRITICAL THREAT DETECTED. Risk Score: 100 out of 100. The Shield has already identified why — a phishing email, a malicious URL click, an anomalous login, suspicious PowerShell execution, and a confirmed threat intelligence match. All targeting the same user — Alice."

**Point to:**
- The pulsing shield icon
- The `100/100` risk score bar
- The 'Why This Is Flagged' bullet list
- The 'Recommended Immediate Action' box

---

## Step 4 — AI Investigation Summary (~30 seconds)

Scroll down slightly to the AI Security Analysis panel.

**Say:**
> "IBM watsonx.ai has analyzed this incident and generated this investigation summary. It explains the attack chain in plain language — from the initial phishing email through to the endpoint compromise. This is a BLUF — Bottom Line Up Front — so the analyst gets the most critical information immediately."

**Point to:**
- The IBM watsonx.ai badge
- The summary text

---

## Step 5 — Attack Timeline (~30 seconds)

Scroll to the Attack Timeline section.

**Say:**
> "Here is the attack timeline. Five correlated signals, all within 41 minutes of each other. T+0: phishing email arrives. T+13 minutes: Alice clicks the malicious link. T+27 minutes: a successful login from a Tor exit node — no MFA. T+39 minutes: a base64-encoded PowerShell command executes on Alice's workstation. T+41 minutes: threat intelligence confirms the source IP is known-malicious, linked to credential theft campaigns."

**Point to:**
- The timeline items in order
- The relative time markers (T+0, T+13m, etc.)

---

## Step 6 — Technique Tags (~15 seconds)

Scroll to the Attack Techniques section.

**Say:**
> "The Shield has automatically classified the attack techniques using MITRE ATT&CK references. Phishing — initial access. PowerShell execution. Valid accounts — credential access. Threat intelligence indicator of compromise. This tells the analyst exactly what playbook to follow."

---

## Step 7 — Return to Dashboard (~15 seconds)

Click **Back to Dashboard**.

**Say:**
> "The AI Security Shield has transformed 5 unrelated security alerts into a single correlated, scored, explained, and actioned incident — automatically, in milliseconds, with no manual analyst work required. That's AI Security Shield."

---

## Key Talking Points

- **No infrastructure required** — runs entirely in the browser
- **Correlation is the innovation** — 5 unrelated alerts become 1 actionable incident
- **Transparent scoring** — every point is explained; no black box
- **AI explanation makes it actionable** — not just a number, but a story + recommended action
- **Works without API key** — demo is reliable; IBM watsonx.ai enhances but does not gate it
