# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:5173
pnpm build        # TypeScript check + Vite build (generates PWA service worker)
pnpm preview      # Preview the production build locally
```

No test runner is configured. TypeScript is the primary correctness check — `pnpm build` will fail on type errors.

## Architecture

**No router.** Navigation is a single `useState<Tab>` in `App.tsx`. The three tabs (`home`, `trends`, `settings`) are rendered conditionally.

**State layer — two separate stores:**
- `useSessionStore` (Zustand + `persist` middleware → localStorage key `zyai_store`): sessions, session logs, custom areas, presets, daily check-ins. This is the source of truth.
- `useTimer` hook: raw localStorage keys `zyai_focus_start_time` and `zyai_focus_target_seconds`. The timer is intentionally kept *outside* Zustand so a running session survives app restarts before the user has saved anything. **`stop()` does NOT clear localStorage** — that only happens in `useSession.saveSession()` after a successful write.

**Supabase is optional.** `src/lib/supabaseClient.ts` exports `supabase` (null if env vars missing) and `hasSupabase` (boolean). `useSession.saveSession()` always writes to Zustand first, then conditionally syncs to Supabase. The app is fully functional without any env vars set.

**Celebration system.** `CelebrationProvider` wraps the entire app. `CelebrationOverlay` is lazy-loaded and wrapped in an error boundary — Three.js/WebGL errors are swallowed so they can never crash the main app. There are 5 scenes in `src/components/celebration/scenes/`; `trigger()` picks one at random via `sceneIndex`.

**Styling.** Tailwind CSS v4 via `@tailwindcss/vite` plugin. No `tailwind.config.js` — configuration is done in `src/index.css` with `@import "tailwindcss"`.

**Path alias.** `@` maps to `/src` (configured in `vite.config.ts` and picked up by TypeScript via `tsconfig`).

## Key data flow

1. User starts timer → `useTimer.start()` writes ISO timestamp to `localStorage`
2. User stops session → `CompletionModal` collects form state (`CompletionFormState`)
3. User submits → `useSession.saveSession()` builds `Session` + `SessionLog[]`, writes to Zustand, optionally syncs to Supabase, then clears the timer localStorage keys

## Supabase setup (optional)

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Schema migrations are in `supabase/migrations/`. Tables: `sessions`, `session_logs`, `daily_check_ins`.
