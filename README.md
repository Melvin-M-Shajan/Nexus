# ⬡ NEXUS — AI Engineer Roadmap 2026

Your personal **mission control** for becoming an AI Engineer. A single-page, offline-first roadmap tracker with a futuristic "neural interface" UI and a built-in Gemini AI mentor.

- **Two paths:** FREE (YouTube / open-source) and UDEMY (paid courses). Switch anytime — progress is saved **separately per path**.
- **Zero backend.** Everything lives in your browser via `localStorage`.
- **One command and it runs.**

## Tech stack

- React 19 + Vite
- TailwindCSS v4 (`@tailwindcss/vite`) + custom CSS variables
- Zustand (state) · React Router v7 · Recharts · Lucide React · @dnd-kit
- Google Gemini API (streaming) — you provide your own key

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview the build
```

## Features

- **Dashboard** — animated stat counters, phase progress rings, 12-week activity heatmap, AI daily briefing, recent todos, milestones.
- **Roadmap** — 6 phases (1, 2, 3, 4A, 4B, 5) for both paths, with resources, must-learn / skip lists, project checklists, notes, and per-phase AI help.
- **Resources** — every resource in one filterable library with progress tracking.
- **Timeline** — Gantt-style schedule with pace selector, start date, today marker, and milestones.
- **Interview Prep** — 45+ real AI-Engineer interview questions across 8 categories with confident/reviewing tracking.
- **LeetCode** — a focused ~25-problem set mapped to AI relevance, with status tracking and AI hints.
- **Cheat Sheet** — searchable, copy-paste-ready references with print-friendly CSS.
- **To-Do List** — Kanban board (drag & drop) + list mode, filters, quick-add (`T`), markdown export.
- **Cost Tracker** — API cost estimator (free) / course purchase tracker (udemy) + ROI projector.
- **AI Assistant** — context-aware Gemini chat with streaming, per-section quick actions, and chat history.
- **Extras** — Command palette (`⌘K` / `Ctrl+K`), onboarding flow, toasts, PWA manifest + service worker, AMOLED theme, JSON import/export, error boundaries.

## Configuring the AI mentor

The AI features use the **Google Gemini API**. Add your key in **Settings → AI Assistant Setup**
(or during onboarding). Get a free key at <https://aistudio.google.com/app/apikey>.

> **No secret is committed or shipped.** The key is stored locally (base64) in *your* browser
> and is only ever sent to Google's API. Each user supplies their own key.
> If you see a "quota exceeded" error, the key has no remaining free-tier quota — replace it
> with your own in Settings.

For local-only convenience you can copy `.env.example` to `.env.local` (gitignored) and set
`VITE_GEMINI_API_KEY` so you don't have to paste the key each time. Never set this in production.

The model is set in `src/hooks/useGemini.js` (`GEMINI_MODEL`) — change it there to swap models.

## Deploying to Vercel (share with managers & friends)

The app is a static Vite SPA and ships **zero secrets** — safe for public hosting. Everything except the AI chat works without any API key.

### Option A — Fastest (no GitHub, ~3 minutes)

1. Open a terminal in this folder (`nexus-roadmap`).
2. Log in once (opens your browser):
   ```bash
   npx vercel login
   ```
3. Deploy to production:
   ```bash
   npm run deploy
   ```
4. Vercel prints a live URL like `https://nexus-roadmap-xxxx.vercel.app` — share that link.

Re-deploy after changes: run `npm run deploy` again from this folder.

### Option B — GitHub + Vercel dashboard

1. Push this project to GitHub (create a repo, then `git init`, `git add .`, `git commit`, `git push`).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** your repo.
3. Set **Root Directory** to `nexus-roadmap` if the repo root is the parent `final` folder; skip this if the repo *is* `nexus-roadmap`.
4. Framework: **Vite** · Build: `npm run build` · Output: `dist`.
5. **Do not add environment variables** — each user adds their own Gemini key in Settings.
6. Click **Deploy**.

[`vercel.json`](vercel.json) is already included and provides:

- **SPA rewrite** so deep links (e.g. `/roadmap`) and refresh work with React Router.
- **Security headers** — Content-Security-Policy (self + Google Fonts + Gemini API only),
  `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
  and HSTS.
- **Caching** — hashed `/assets/*` are immutable; `index.html`, `sw.js`, and `manifest.json`
  are no-cache so updates ship immediately.

> **Note on the previously-shared key:** any Gemini key that was pasted during development is no
> longer in the source and is auto-purged from browsers on load. If such a key was ever pushed to a
> remote, **rotate it** in Google AI Studio to be safe.

## Project structure

```
src/
├── main.jsx · App.jsx · index.css
├── data/        freePathData · udemyPathData · sharedData (interview / leetcode / cheatsheet)
├── store/       useStore.js (Zustand, localStorage-backed)
├── hooks/       useGemini · useProgress · useLocalStorage · useCopy
└── components/
    ├── layout/  Sidebar · TopBar · MobileNav · CommandPalette · navConfig
    ├── ui/      GlassCard · ProgressRing · PhaseCard · PathToggle · GeminiChat · AIContext · …
    └── sections/ Dashboard · Roadmap · ResourceDeepDive · Timeline · InterviewPrep ·
                  LeetCode · CheatSheet · TodoList · CostCalculator · Settings
```

All progress is namespaced in `localStorage` under `nexus_free_*` and `nexus_udemy_*` keys.
