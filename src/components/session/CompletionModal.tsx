import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import AreaSelector from './AreaSelector'
import AreaLogInput from './AreaLogInput'
import MotivationSlider from './MotivationSlider'
import type { AreaName, CompletionFormState } from '@/types'

interface CompletionModalProps {
  startTime: Date
  endTime: Date
  saving: boolean
  error: string | null
  onSave: (form: CompletionFormState) => void
  onDiscard: () => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(start: Date, end: Date): string {
  const totalSecs = Math.round((end.getTime() - start.getTime()) / 1000)
  if (totalSecs < 60) return `${totalSecs}s`
  const mins = Math.floor(totalSecs / 60)
  if (mins < 60) {
    const s = totalSecs % 60
    return s > 0 ? `${mins}m ${s}s` : `${mins}m`
  }
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function CompletionModal({
  startTime,
  endTime,
  saving,
  error,
  onSave,
  onDiscard,
}: CompletionModalProps) {
  const [selectedAreas, setSelectedAreas] = useState<AreaName[]>([])
  const [areaLogs, setAreaLogs] = useState<Partial<Record<AreaName, string>>>({})
  const [motivationLevel, setMotivationLevel] = useState(3)
  const [struggleNote, setStruggleNote] = useState('')
  const [overallNotes, setOverallNotes] = useState('')

  function handleAreaLog(area: AreaName, value: string) {
    setAreaLogs((prev) => ({ ...prev, [area]: value }))
  }

  function handleSave() {
    onSave({ selectedAreas, areaLogs, motivationLevel, struggleNote, overallNotes })
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-white font-bold text-lg">Session Complete</h2>
          <p className="text-slate-400 text-sm">
            {formatTime(startTime)} → {formatTime(endTime)} · {formatDuration(startTime, endTime)}
          </p>
        </div>
        <button
          onClick={onDiscard}
          className="text-slate-500 hover:text-slate-300 p-2 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 flex flex-col gap-6">
        <AreaSelector selected={selectedAreas} onChange={setSelectedAreas} />

        {selectedAreas.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-slate-300 font-semibold">What did you accomplish?</p>
            {selectedAreas.map((area) => (
              <AreaLogInput
                key={area}
                area={area}
                value={areaLogs[area] ?? ''}
                onChange={(v) => handleAreaLog(area, v)}
              />
            ))}
          </div>
        )}

        <MotivationSlider value={motivationLevel} onChange={setMotivationLevel} />

        {motivationLevel <= 2 && (
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 text-sm font-medium">
              Why was today a struggle?
            </label>
            <textarea
              value={struggleNote}
              onChange={(e) => setStruggleNote(e.target.value)}
              placeholder="What made it difficult today?"
              rows={3}
              className="bg-slate-800 border border-slate-600 rounded-xl p-3 w-full text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {motivationLevel > 2 && (
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 text-sm font-medium">
              Overall notes (optional)
            </label>
            <textarea
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Any reflections on this session?"
              rows={2}
              className="bg-slate-800 border border-slate-600 rounded-xl p-3 w-full text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 bg-slate-950/95 backdrop-blur border-t border-slate-800 px-4 py-4 flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl py-4 transition-all active:scale-95"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Session'}
        </button>
        <button
          onClick={onDiscard}
          className="text-slate-500 hover:text-slate-300 text-sm text-center py-2 transition-colors"
        >
          Discard session
        </button>
      </div>
    </div>
  )
}
