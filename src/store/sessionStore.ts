import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, SessionLog } from '@/types'

interface SessionStore {
  sessions: Session[]
  sessionLogs: SessionLog[]
  addSession: (session: Session) => void
  addSessionLogs: (logs: SessionLog[]) => void
  clearAll: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      sessionLogs: [],
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      addSessionLogs: (logs) =>
        set((state) => ({ sessionLogs: [...state.sessionLogs, ...logs] })),
      clearAll: () => set({ sessions: [], sessionLogs: [] }),
    }),
    { name: 'zyai_store' }
  )
)
