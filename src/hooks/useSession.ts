import { useState, useCallback } from 'react'
import { supabase, hasSupabase } from '@/lib/supabaseClient'
import { useSessionStore } from '@/store/sessionStore'
import type { CompletionFormState, Session, SessionLog, BackupPayload } from '@/types'

export interface SaveSessionArgs {
  startTime: Date
  endTime: Date
  form: CompletionFormState
}

export interface UseSessionReturn {
  saving: boolean
  error: string | null
  saveSession: (args: SaveSessionArgs) => Promise<void>
  exportBackup: () => void
}

export function useSession(): UseSessionReturn {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addSession, addSessionLogs } = useSessionStore()

  const saveSession = useCallback(
    async ({ startTime, endTime, form }: SaveSessionArgs) => {
      setSaving(true)
      setError(null)

      try {
        const durationSeconds = Math.max(
          1,
          Math.round((endTime.getTime() - startTime.getTime()) / 1000)
        )

        const overallNotes =
          form.motivationLevel <= 2 ? form.struggleNote : form.overallNotes

        const session: Session = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds,
          overall_motivation: form.motivationLevel,
          overall_notes: overallNotes,
        }

        const logs: SessionLog[] = form.selectedAreas.map((area) => ({
          id: crypto.randomUUID(),
          session_id: session.id,
          area_name: area,
          content: form.areaLogs[area] ?? '',
        }))

        // 1. Always write to Zustand store (instant + persisted via middleware)
        addSession(session)
        addSessionLogs(logs)

        // 2. If Supabase is configured, also sync to DB
        if (hasSupabase && supabase) {
          const { error: sessionErr } = await supabase
            .from('sessions')
            .insert(session)
          if (sessionErr) throw sessionErr

          if (logs.length > 0) {
            const { error: logsErr } = await supabase
              .from('session_logs')
              .insert(logs)
            if (logsErr) throw logsErr
          }
        }

        // 3. Clear timer localStorage key
        localStorage.removeItem('zyai_focus_start_time')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save session'
        setError(msg)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [addSession, addSessionLogs]
  )

  const exportBackup = useCallback(() => {
    const { sessions, sessionLogs } = useSessionStore.getState()

    const payload: BackupPayload = {
      exportedAt: new Date().toISOString(),
      sessions,
      session_logs: sessionLogs,
      daily_check_ins: [],
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `momentum_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return { saving, error, saveSession, exportBackup }
}
