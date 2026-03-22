import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, SessionLog, AreaConfig, AreaPreset, DailyCheckIn } from '@/types'
import { DEFAULT_AREAS } from '@/types'

export function computeStreaks(sessions: Session[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 }

  // Collect unique YYYY-MM-DD dates
  const dateSet = new Set<string>()
  for (const s of sessions) {
    dateSet.add(s.start_time.slice(0, 10))
  }

  const today = new Date()
  function dateStr(d: Date): string {
    return d.toISOString().slice(0, 10)
  }
  function prevDay(d: Date): Date {
    const p = new Date(d)
    p.setDate(p.getDate() - 1)
    return p
  }

  // Current streak: count back from today (or yesterday if today has no session)
  let current = 0
  let cursor = new Date(today)
  // Allow today to count even if it's mid-day
  while (dateSet.has(dateStr(cursor))) {
    current++
    cursor = prevDay(cursor)
  }
  // If today has no session yet, check if yesterday starts a streak
  if (current === 0) {
    cursor = prevDay(today)
    while (dateSet.has(dateStr(cursor))) {
      current++
      cursor = prevDay(cursor)
    }
  }

  // Longest streak: sort all dates and find max consecutive run
  const sortedDates = Array.from(dateSet).sort()
  let longest = 0
  let run = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      run++
    } else {
      longest = Math.max(longest, run)
      run = 1
    }
  }
  longest = Math.max(longest, run)

  return { current, longest }
}

interface SessionStore {
  sessions: Session[]
  sessionLogs: SessionLog[]
  customAreas: AreaConfig[]
  presets: AreaPreset[]
  dailyCheckIns: DailyCheckIn[]
  addSession: (session: Session) => void
  addSessionLogs: (logs: SessionLog[]) => void
  updateSessionLog: (id: string, content: string) => void
  updateSessionNotes: (sessionId: string, notes: string) => void
  setCustomAreas: (areas: AreaConfig[]) => void
  addPreset: (preset: AreaPreset) => void
  deletePreset: (id: string) => void
  addDailyCheckIn: (checkIn: DailyCheckIn) => void
  replaceAll: (sessions: Session[], logs: SessionLog[], checkIns: DailyCheckIn[], areas?: AreaConfig[], presets?: AreaPreset[]) => void
  clearAll: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      sessionLogs: [],
      customAreas: DEFAULT_AREAS,
      presets: [],
      dailyCheckIns: [],
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      addSessionLogs: (logs) =>
        set((state) => ({ sessionLogs: [...state.sessionLogs, ...logs] })),
      updateSessionLog: (id, content) =>
        set((state) => ({
          sessionLogs: state.sessionLogs.map((l) => l.id === id ? { ...l, content } : l),
        })),
      updateSessionNotes: (sessionId, notes) =>
        set((state) => ({
          sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, overall_notes: notes } : s),
        })),
      setCustomAreas: (areas) => set({ customAreas: areas }),
      addPreset: (preset) =>
        set((state) => ({ presets: [...state.presets, preset] })),
      deletePreset: (id) =>
        set((state) => ({ presets: state.presets.filter((p) => p.id !== id) })),
      addDailyCheckIn: (checkIn) =>
        set((state) => ({ dailyCheckIns: [...state.dailyCheckIns, checkIn] })),
      replaceAll: (sessions, logs, checkIns, areas, presets) =>
        set((state) => ({
          sessions,
          sessionLogs: logs,
          dailyCheckIns: checkIns,
          customAreas: areas ?? state.customAreas,
          presets: presets ?? state.presets,
        })),
      clearAll: () => set({ sessions: [], sessionLogs: [], dailyCheckIns: [] }),
    }),
    { name: 'zyai_store' }
  )
)
