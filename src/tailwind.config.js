/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shield-bg': '#0a0e1a',
        'shield-surface': '#0f1629',
        'shield-card': '#141d35',
        'shield-border': '#1e2d4a',
        'shield-muted': '#4a5568',
        'shield-text': '#e2e8f0',
        'shield-dim': '#94a3b8',
        'shield-accent': '#3b82f6',
        'risk-critical': '#dc2626',
        'risk-high': '#d97706',
        'risk-medium': '#ca8a04',
        'risk-low': '#16a34a',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
