import { useState } from 'react'
import { PlusCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { useSessionStore } from '@/store/sessionStore'
import type { AreaName, CompletionFormState } from '@/types'

const MOTIVATION_LABELS = ['', 'Very low', 'Low', 'Okay', 'Good', 'Great']

export default function ManualLogForm() {
  const { saving, error, saveSession } = useSession()
  const { customAreas } = useSessionStore()

  const today = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(today)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)
  const [selectedAreas, setSelectedAreas] = useState<AreaName[]>([])
  const [areaLogs, setAreaLogs] = useState<Partial<Record<AreaName, string>>>({})
  const [motivation, setMotivation] = useState(3)
  const [overallNotes, setOverallNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const totalMins = hours * 60 + minutes

  function toggleArea(area: AreaName) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  async function handleSubmit() {
    if (totalMins <= 0) return

    // Place session at 9am on the chosen date
    const startTime = new Date(`${date}T09:00:00`)
    const endTime = new Date(startTime.getTime() + totalMins * 60 * 1000)

    const form: CompletionFormState = {
      selectedAreas,
      areaLogs,
      motivationLevel: motivation,
      struggleNote: motivation <= 2 ? overallNotes : '',
      overallNotes: motivation > 2 ? overallNotes : '',
    }

    try {
      await saveSession({ startTime, endTime, estimatedSeconds: null, form })
      setSubmitted(true)
      setDate(today)
      setHours(0)
      setMinutes(30)
      setSelectedAreas([])
      setAreaLogs({})
      setMotivation(3)
      setOverallNotes('')
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      // error is surfaced via useSession
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Date</label>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="bg-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
        />
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Duration</label>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2.5">
            <input
              type="number"
              min={0}
              max={12}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Math.min(12, Number(e.target.value))))}
              className="w-full bg-transparent text-white text-sm outline-none tabular-nums"
            />
            <span className="text-slate-500 text-xs shrink-0">hrs</span>
          </label>
          <label className="flex-1 flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2.5">
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
              className="w-full bg-transparent text-white text-sm outline-none tabular-nums"
            />
            <span className="text-slate-500 text-xs shrink-0">min</span>
          </label>
        </div>
        {totalMins <= 0 && (
          <p className="text-amber-400 text-xs">Duration must be greater than 0</p>
        )}
      </div>

      {/* Areas */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          Areas <span className="normal-case font-normal">(optional)</span>
        </label>
        <div className="flex flex-col gap-1.5">
          {customAreas.map((area) => {
            const isSelected = selectedAreas.includes(area.name)
            return (
              <div key={area.name}>
                <button
                  onClick={() => toggleArea(area.name)}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/50'
                      : 'bg-slate-700 border border-transparent hover:bg-slate-600'
                  }`}
                >
                  <span className="text-base">{area.emoji}</span>
                  <span className="text-sm text-slate-200 flex-1">{area.name}</span>
                  {isSelected && <span className="text-indigo-400 text-xs font-bold">✓</span>}
                </button>
                {isSelected && (
                  <textarea
                    placeholder={`Notes for ${area.name}…`}
                    value={areaLogs[area.name] ?? ''}
                    onChange={(e) =>
                      setAreaLogs((prev) => ({ ...prev, [area.name]: e.target.value }))
                    }
                    rows={2}
                    className="mt-1 w-full bg-slate-700/50 text-slate-200 text-sm rounded-xl px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Motivation */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          Motivation — <span className="normal-case font-normal text-slate-500">{MOTIVATION_LABELS[motivation]}</span>
        </label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setMotivation(n)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                motivation === n
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          {motivation <= 2 ? 'Struggle note' : 'Notes'}{' '}
          <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          placeholder={motivation <= 2 ? 'What made it hard?' : 'How did the session go?'}
          value={overallNotes}
          onChange={(e) => setOverallNotes(e.target.value)}
          rows={2}
          className="bg-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 resize-none outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={totalMins <= 0 || saving}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 transition-all active:scale-95"
      >
        {submitted ? (
          <><CheckCircle size={18} className="text-green-300" /> Session logged!</>
        ) : saving ? (
          'Saving…'
        ) : (
          <><PlusCircle size={18} /> Log Session</>
        )}
      </button>
    </div>
  )
}
