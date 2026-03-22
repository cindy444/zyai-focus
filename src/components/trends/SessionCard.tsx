import { useState, useRef, useEffect } from 'react'
import { Clock, Zap, Pencil, Check, X } from 'lucide-react'
import type { Session, SessionLog } from '@/types'
import { useSessionStore } from '@/store/sessionStore'

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

function EstimationBadge({ actual, estimated }: { actual: number; estimated: number }) {
  const diffSecs = actual - estimated
  const diffMins = Math.round(diffSecs / 60)
  if (Math.abs(diffSecs) < 60) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 font-medium">
        On target
      </span>
    )
  }
  if (diffSecs > 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-400 font-medium">
        +{diffMins}m over
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-400 font-medium">
      {Math.abs(diffMins)}m under
    </span>
  )
}

function EditableText({
  value,
  placeholder,
  onSave,
}: {
  value: string
  placeholder: string
  onSave: (text: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [editing])

  function handleSave() {
    onSave(draft.trim())
    setEditing(false)
  }

  function handleCancel() {
    setDraft(value)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium"
          >
            <Check size={12} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
          >
            <X size={12} /> Cancel
          </button>
          <span className="text-slate-600 text-xs ml-auto">⌘↵ to save · Esc to cancel</span>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-2">
      <p className={`text-sm flex-1 ${value ? 'text-slate-300' : 'text-slate-600 italic'}`}>
        {value || placeholder}
      </p>
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300 shrink-0 mt-0.5"
        aria-label="Edit"
      >
        <Pencil size={12} />
      </button>
    </div>
  )
}

export default function SessionCard({ session, logs }: SessionCardProps) {
  const { updateSessionLog, updateSessionNotes } = useSessionStore()

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

      {/* Estimated vs actual */}
      {session.estimated_seconds != null && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Est. {formatDuration(session.estimated_seconds)}</span>
          <span>→</span>
          <span className="text-slate-400">Actual {formatDuration(session.duration_seconds)}</span>
          <EstimationBadge actual={session.duration_seconds} estimated={session.estimated_seconds} />
        </div>
      )}

      {/* Area logs */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-700 pt-3">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1">
              <span className="text-indigo-400 text-xs font-medium">{log.area_name}</span>
              <EditableText
                value={log.content}
                placeholder="No notes — tap pencil to add"
                onSave={(text) => updateSessionLog(log.id, text)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Overall notes / struggle note */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-slate-500 text-xs font-medium mb-1">
          {session.overall_motivation <= 2 ? 'Struggle note' : 'Notes'}
        </p>
        <EditableText
          value={session.overall_notes}
          placeholder="No notes — tap pencil to add"
          onSave={(text) => updateSessionNotes(session.id, text)}
        />
      </div>
    </div>
  )
}
