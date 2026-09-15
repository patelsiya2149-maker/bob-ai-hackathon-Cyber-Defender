# AI Security Shield

**An intelligent, AI-powered cybersecurity warning layer that automatically detects suspicious digital interactions, correlates security signals, and warns users before threats escalate.**

---

## Team: Cyber Defender
**Track:** AI
Team Lead : SHREEYA

| No. | Name | Role | Email-ID |
|---|---|---|---|
| Member 1 | SIYA | Development / Frontend / Backend / Integration | 26cs095@charusat.edu.in | 
| Member 2 | SHREEYA | Cybersecurity Logic / Signal Data / Correlation / Risk Scoring | 26dce083@charusat.edu.in |
| Member 3 | PRAGATI | Documentation / Architecture / Demo / Presentation | 26dce108@charusat.edu.in |


---

## Problem Statement

Users encounter suspicious emails, malicious links, authentication anomalies, and endpoint compromises every day. Existing security tools generate fragmented, siloed alerts that require security analysts to manually correlate them — by which time an attack chain may already be in progress.

**AI Security Shield** acts as an intelligent warning layer. It collects security signals, understands their context, identifies suspicious patterns across signals, assigns a transparent risk score, explains *why* something is risky, and fires an immediate, prominent Security Shield Warning before threats escalate.

---

## Solution

AI Security Shield ingests simulated security signals, runs them through a multi-stage analysis pipeline, and produces correlated incidents with AI-powered explanations:

```
Security Signals (Email → URL → Auth → Endpoint → Threat Intel)
    ↓ Normalization
    ↓ Correlation (shared user/device/IP/domain + time proximity)
    ↓ Risk Scoring (5-factor transparent formula, 0–100)
    ↓ Technique Classification (MITRE ATT&CK references)
    ↓ AI Investigation Summary (IBM watsonx.ai or built-in fallback)
    ↓ Security Shield Warning (HIGH / CRITICAL incidents)
```

### Key Features

1. **Security Signal Ingestion** — Simulated email, URL, authentication, endpoint, and threat-intelligence signals
2. **Intelligent Correlation** — Union-Find algorithm groups related signals by shared indicators (user, device, IP, domain) and time proximity
3. **Transparent Risk Scoring** — 5-factor formula (severity, signal count, threat intel, confidence, time proximity) with human-readable explanations
4. **MITRE ATT&CK Classification** — Automatic technique tagging per signal type
5. **AI Investigation Summary** — IBM watsonx.ai Granite model generates concise BLUF summaries; reliable built-in fallback if API key not configured
6. **Security Shield Warning** — Prominent, unmissable warning banner for HIGH/CRITICAL incidents
7. **SOC Dashboard** — Dark-theme security operations center UI with live stats, risk charts, and incident table
8. **Incident Detail View** — Full correlated signal timeline, risk breakdown, technique tags, AI summary, and recommended action

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| AI/ML | IBM watsonx.ai (Granite-13B) — optional; full fallback included |
| Data | Static JSON (simulated security signals) |
| Backend | None required |

---

## Repository Structure.
```text
bob-ai-hackathon-Cyber-Defender/
│
├── .github/
│   └── workflows/
│       └── validate-submission.yml
│
├── src/
│   │
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── IncidentDetail.tsx
│   │   ├── SecurityWarning.tsx
│   │   ├── RiskChart.tsx
│   │   ├── IncidentTable.tsx
│   │   ├── SignalCard.tsx
│   │   ├── RiskScore.tsx
│   │   ├── MitreTags.tsx
│   │   └── BLUFSummary.tsx
│   │
│   ├── data/
│   │   └── signals.json
│   │
│   ├── engine/
│   │   ├── normalizer.ts
│   │   ├── correlator.ts
│   │   ├── riskScorer.ts
│   │   ├── techniqueClassifier.ts
│   │   ├── incidentBuilder.ts
│   │   └── aiSummary.ts
│   │
│   ├── services/
│   │   └── bobClient.ts
│   │
│   ├── hooks/
│   │   └── useSecurityEngine.ts
│   │
│   ├── types/
│   │   └── security.ts
│   │
│   ├── assets/
│   │   └── ...
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── docs/
│   │
│   ├── architecture.md
│   ├── problem-statement.md
│   ├── proposed-solution.md
│   ├── technical-implementation.md
│   ├── risk-scoring.md
│   ├── signal-correlation.md
│   ├── mitre-attack.md
│   ├── ai-integration.md
│   ├── user-flow.md
│   ├── testing.md
│   ├── limitations.md
│   └── future-scope.md
│
├── demo/
│   │
│   ├── demo-video.mp4
│   ├── demo-script.md
│   ├── user-flow.md
│   └── screenshots/
│       ├── 01-dashboard.png
│       ├── 02-security-warning.png
│       ├── 03-incident-detail.png
│       ├── 04-risk-score.png
│       ├── 05-mitre-techniques.png
│       └── 06-bluf-summary.png
│
├── presentation/
│   ├── AI-Security-Shield.pptx
│   └── AI-Security-Shield.pdf
│
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── ai-security-shield-plan.md
└── submission.yaml
```

## How to Run

# Setup Guide

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18.0+ | [nodejs.org](https://nodejs.org) |
| npm | 9.0+ | Included with Node.js |
| Git | Any | For cloning |
| Browser | Chrome / Firefox / Edge | Any modern browser |

No database, no Docker, no cloud account required for the demo.

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/[team]/bob-ai-hackathon-Cyber-Defender.git
cd bob-ai-hackathon-Cyber-Defender

# 2. Navigate to the source directory
cd src

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open your browser at **http://localhost:5173**

The application loads immediately with the prebuilt demo scenario.

## Optional: IBM watsonx.ai AI Summaries

By default, AI summaries are generated using the built-in fallback engine — no API key needed.

To enable IBM watsonx.ai real AI summaries:

```bash
# In the src/ directory, create .env.local
cp .env.example .env.local
```

Edit `src/.env.local`:

```
VITE_BOB_API_KEY=your_ibm_cloud_api_key_here
VITE_BOB_PROJECT_ID=your_watsonx_project_id_here
VITE_BOB_URL=https://us-south.ml.cloud.ibm.com
```

Then restart the dev server:

```bash
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder contains the built application, which can be served by any static file host.

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm: command not found` | Install Node.js 18+ from nodejs.org |
| `vite: command not found` | Run `npm install` first |
| Port 5173 already in use | Vite will automatically use the next available port |
| AI summary shows fallback text | This is correct — add API keys to enable live AI summaries |
| Blank page after build | Check browser console; ensure `dist/` is served from web root |

## Running the Demo

1. Open **http://localhost:5173**
2. The Dashboard shows 12 security signals and multiple incidents
3. Click the **CRITICAL** incident at the top of the incident table
4. The Security Shield Warning banner fires immediately
5. Scroll down to see the 5 correlated signals in the attack timeline
6. The AI Security Analysis panel shows the incident summary
7. The Recommended Action box shows defensive steps
8. Click **Back to Dashboard** to return

The full demo walkthrough takes approximately 2 minutes.


### Installation

```bash
cd src
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

### Optional: IBM watsonx.ai Integration

To enable real AI-generated summaries:

1. Copy `src/.env.example` to `src/.env.local`
2. Fill in your `VITE_BOB_API_KEY` and `VITE_BOB_PROJECT_ID`
3. Restart the dev server

The application works fully without an API key using the built-in AI fallback summary.

---

## Demo Scenario

The prebuilt demo scenario shows a coordinated attack against `alice@company.com`:

1. **Phishing Email** — suspicious email from `phishing-corp.ru`
2. **Malicious URL Click** — Alice clicks the embedded link
3. **Login Anomaly** — login from Tor exit node IP `185.220.101.45`
4. **Endpoint Compromise** — base64-encoded PowerShell executed on `ALICE-WIN11`
5. **Threat Intelligence Match** — IP confirmed in AlienVault OTX / Abuse.ch feeds

**Result:** AI Security Shield correlates all 5 signals → Risk Score: 100/100 → CRITICAL → Security Shield Warning fires → AI generates investigation summary → Recommended action displayed.

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full architecture diagram.

---

## Demo Links
| Artifact | Link |
|---|---|
Live Demo | [`demo/live-demo-url.txt`](demo/live-demo-url.txt) |
Demo Video | [`demo/demo-video-link.txt`](demo/demo-video-link.txt) |
Presentation | [`presentation/AI SECURITY SHIELD.PDF`](presentation/) |
Screenshots | [`demo/screenshots/`](demo/screenshots/) |
---

## Known Limitations

- Uses simulated/sample security data only — not connected to real threat feeds
- IBM watsonx.ai integration requires API credentials; fallback summary used otherwise
- No persistent storage — state resets on page refresh
- Single-user, single-session UI (no multi-tenancy)

---

## What We're Most Proud Of

The **Security Shield Warning** — a visually striking, contextually accurate, zero-false-positive warning banner that fires only on HIGH/CRITICAL correlated incidents and explains exactly *why* the risk is elevated with actionable recommended defensive steps. Built in one day by a three-person team.
