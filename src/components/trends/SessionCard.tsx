import { Clock, Zap } from 'lucide-react'
import type { Session, SessionLog } from '@/types'

const MOTIVATION_EMOJIS = ['', '😫', '😕', '😐', '😊', '🔥']

interface SessionCardProps {
  session: Session
  logs: SessionLog[]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) {
    const s = secs % 60
    return s > 0 ? `${mins}m ${s}s` : `${mins}m`
  }
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function SessionCard({ session, logs }: SessionCardProps) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header: date, time range, duration */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white text-sm font-semibold">
            {formatDate(session.start_time)}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {formatTime(session.start_time)} → {formatTime(session.end_time)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400 text-xs">
            <Clock size={12} />
            {formatDuration(session.duration_seconds)}
          </span>
          <span className="flex items-center gap-1 text-slate-400 text-xs">
            <Zap size={12} />
            {MOTIVATION_EMOJIS[session.overall_motivation]} {session.overall_motivation}/5
          </span>
        </div>
      </div>

      {/* Area logs */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-slate-700 pt-3">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-0.5">
              <span className="text-indigo-400 text-xs font-medium">{log.area_name}</span>
              {log.content ? (
                <p className="text-slate-300 text-sm">{log.content}</p>
              ) : (
                <p className="text-slate-600 text-sm italic">No notes</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Overall notes / struggle note */}
      {session.overall_notes && (
        <div className="border-t border-slate-700 pt-3">
          <p className="text-slate-500 text-xs font-medium mb-1">
            {session.overall_motivation <= 2 ? 'Struggle note' : 'Notes'}
          </p>
          <p className="text-slate-300 text-sm">{session.overall_notes}</p>
        </div>
      )}
    </div>
  )
}
