import { useState } from 'react'
import { X, Loader2, Bookmark, Trash2 } from 'lucide-react'
import AreaSelector from './AreaSelector'
import AreaLogInput from './AreaLogInput'
import MotivationSlider from './MotivationSlider'
import { useSessionStore } from '@/store/sessionStore'
import type { AreaName, CompletionFormState, AreaPreset } from '@/types'

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
  const { presets, addPreset, deletePreset } = useSessionStore()
  const [selectedAreas, setSelectedAreas] = useState<AreaName[]>([])
  const [areaLogs, setAreaLogs] = useState<Partial<Record<AreaName, string>>>({})
  const [motivationLevel, setMotivationLevel] = useState(3)
  const [struggleNote, setStruggleNote] = useState('')
  const [overallNotes, setOverallNotes] = useState('')
  const [savingPreset, setSavingPreset] = useState(false)
  const [presetName, setPresetName] = useState('')

  function handleAreaLog(area: AreaName, value: string) {
    setAreaLogs((prev) => ({ ...prev, [area]: value }))
  }

  function handleSave() {
    onSave({ selectedAreas, areaLogs, motivationLevel, struggleNote, overallNotes })
  }

  function applyPreset(preset: AreaPreset) {
    setSelectedAreas(preset.areas)
    setAreaLogs({})
  }

  function handleSavePreset() {
    if (!presetName.trim() || selectedAreas.length === 0) return
    const preset: AreaPreset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      areas: selectedAreas,
    }
    addPreset(preset)
    setSavingPreset(false)
    setPresetName('')
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

        {/* Presets row */}
        {presets.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-slate-400 text-xs uppercase tracking-widest">Presets</p>
            <div className="flex gap-2 flex-wrap">
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1 bg-slate-800 rounded-full pl-3 pr-1 py-1">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="text-slate-300 hover:text-white text-sm transition-colors"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="text-slate-600 hover:text-red-400 p-0.5 rounded-full transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <AreaSelector selected={selectedAreas} onChange={setSelectedAreas} />

        {/* Save as preset */}
        {selectedAreas.length > 0 && (
          <div>
            {savingPreset ? (
              <div className="flex gap-2">
                <input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSavePreset() }}
                  placeholder="Preset name (e.g. Morning routine)"
                  autoFocus
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button onClick={handleSavePreset} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 rounded-xl transition-colors">Save</button>
                <button onClick={() => { setSavingPreset(false); setPresetName('') }} className="text-slate-400 hover:text-slate-200 text-sm px-2 transition-colors">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setSavingPreset(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 text-xs transition-colors"
              >
                <Bookmark size={12} /> Save as preset
              </button>
            )}
          </div>
        )}

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
