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
