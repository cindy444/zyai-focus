# zyai-focus

A mobile-first Momentum Tracker PWA for logging focus sessions across multiple life areas.

## Features

- **One-Tap Focus Timer** — Start/stop with a single tap. Timer persists across browser close via localStorage.
- **Multi-Area Logging** — Select from 9 focus areas (System Design, Financial, Reading, etc.) and log what you accomplished in each.
- **Motivation Tracking** — Rate your motivation 1–5. Low scores prompt a "Why was today a struggle?" reflection.
- **Trends Dashboard** — View total time per area over the last 30 days with tap-to-filter session history.
- **Backup Export** — Download all data as a JSON file from Settings.
- **PWA** — Installable on iOS/Android home screen for a native app feel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand (with `persist` middleware → localStorage) |
| Backend | Supabase (optional — app works fully offline) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

Open http://localhost:5173

## Supabase Setup (Optional)

The app works fully without Supabase using local storage. To enable cloud sync:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in Supabase SQL Editor: `supabase/migrations/001_initial_schema.sql`
3. Create `.env.local`:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
   ```
4. Restart the dev server

## Build & Deploy

```bash
pnpm run build    # Production build → dist/
pnpm run preview  # Preview locally (test PWA install)
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages). For Vercel:

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
4. Every push to `main` auto-deploys

## Project Structure

```
src/
├── store/sessionStore.ts       — Zustand store (persisted to localStorage)
├── hooks/
│   ├── useTimer.ts             — Focus timer with localStorage persistence
│   └── useSession.ts           — Save sessions + export backup
├── components/
│   ├── layout/                 — AppShell, BottomNav
│   ├── timer/                  — TimerScreen, FocusButton, ElapsedDisplay
│   ├── session/                — CompletionModal, AreaSelector, MotivationSlider
│   ├── trends/                 — AreaBarChart, SessionCard
│   └── settings/               — SettingsScreen (backup + storage mode)
├── pages/                      — Home, Trends, Settings
├── lib/supabaseClient.ts       — Supabase client (null when env vars absent)
└── types/index.ts              — Shared TypeScript types
```
