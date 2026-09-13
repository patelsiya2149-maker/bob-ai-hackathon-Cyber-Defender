# Architecture

## Overview

AI Security Shield is a pure client-side React application. All security logic runs in the browser using static simulated data. No backend, no database, and no cloud services are required for the demo.

```
src/
├── src/
│   ├── data/                  ← Static JSON (signals, techniques)
│   ├── types/                 ← TypeScript interfaces
│   ├── engine/                ← Pure functions: normalize, correlate, score, classify, AI summary
│   ├── hooks/                 ← React context/hooks (pipeline, AI summary cache)
│   ├── components/            ← UI components
│   └── pages/                 ← Dashboard, IncidentDetail
```

## Data Flow

```
signals.json (12 simulated security signals)
    │
    ▼
normalizer.ts        ← converts each raw signal to NormalizedSignal (common format)
    │
    ▼
correlator.ts        ← Union-Find groups signals by shared indicators + time proximity
    │                   produces CorrelatedGroup[]
    ▼
riskScorer.ts        ← 5-factor weighted formula → ScoreBreakdown (0–100) + RiskLevel
    │
    ▼
techniqueClassifier.ts ← rule-based MITRE ATT&CK technique tagging per signal type
    │
    ▼
incidentBuilder.ts   ← assembles full Incident object with title, recommended action
    │
    ▼
SecurityEngineProvider (React Context)
    │
    ├── Dashboard page  ← stat cards, charts, incident table
    │
    └── IncidentDetail page
            │
            ├── SecurityShieldWarning   ← fires for HIGH/CRITICAL
            ├── AIExplanationPanel      ← calls aiSummary.ts (watsonx.ai or fallback)
            ├── RecommendedActionBox
            ├── RiskScoreBar + breakdown
            ├── TechniqueBadge list
            ├── SignalTimeline
            └── SignalCard list
```

## Component Responsibility

| Component / Module | Responsibility |
|---|---|
| `normalizer.ts` | Type-safe conversion of any raw signal to NormalizedSignal |
| `correlator.ts` | Union-Find grouping; shared indicator matching; time proximity check |
| `riskScorer.ts` | Deterministic 0–100 scoring formula with per-factor explanation strings |
| `techniqueClassifier.ts` | Rule-based MITRE ATT&CK technique tagging |
| `incidentBuilder.ts` | Assembles final Incident from group + score + techniques |
| `aiSummary.ts` | Calls IBM watsonx.ai; deterministic fallback summary if no API key |
| `useSecurityEngine.ts` | React context; runs pipeline once on app start; provides incidents + stats |
| `useIncidentSummary.ts` | Lazy-loads and caches AI summary per incident ID |
| `SecurityShieldWarning` | The signature warning banner for HIGH/CRITICAL incidents |
| `Dashboard` | Main stats view; incident table; charts |
| `IncidentDetail` | Full incident deep-dive; all correlated signals; AI summary |

## IBM watsonx.ai Integration

The app calls the watsonx.ai text generation endpoint using the Granite-13B-Instruct model.

- **Endpoint:** `POST /ml/v1/text/generation?version=2023-05-29`
- **Auth:** IAM API Key → Bearer Token exchange
- **Model:** `ibm/granite-13b-instruct-v2`
- **Prompt:** Structured context (signals, score, techniques) → BLUF summary request
- **Fallback:** If no API key, a deterministic template-string summary is generated from incident data

## Security Considerations

- No user data is collected or transmitted
- No real threat feeds or external data sources
- IBM watsonx.ai API key is stored in `.env.local` (gitignored)
- The application performs purely defensive analysis on simulated data
