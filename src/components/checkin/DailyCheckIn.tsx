import { useState } from 'react'
import { X } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import type { DailyCheckIn as DailyCheckInType } from '@/types'

const EMOJIS = ['😫', '😕', '😐', '😊', '🔥']
const LABELS = ['Rough', 'Low', 'Okay', 'Good', 'On fire']

export default function DailyCheckIn() {
  const addDailyCheckIn = useSessionStore((s) => s.addDailyCheckIn)
  const [dismissed, setDismissed] = useState(false)
  const [intention, setIntention] = useState('')
  const [mood, setMood] = useState(3)
  const [saved, setSaved] = useState(false)

  if (dismissed) return null

  function handleSave() {
    const checkIn: DailyCheckInType = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      intention: intention.trim(),
      mood,
    }
    addDailyCheckIn(checkIn)
    setSaved(true)
    setTimeout(() => setDismissed(true), 1200)
  }

  if (saved) {
    return (
      <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 text-center text-green-400 text-sm font-medium">
        Intention set — let's go!
      </div>
    )
  }

  return (
    <div className="mb-4 bg-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-200 font-semibold text-sm">Set today's intention</p>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <textarea
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="What do you want to focus on today?"
        rows={2}
        className="bg-slate-700 border border-slate-600 rounded-xl p-3 w-full text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
      />

      <div className="flex gap-2 justify-center">
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => setMood(i + 1)}
            title={LABELS[i]}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors ${
              mood === i + 1 ? 'bg-indigo-600' : 'hover:bg-slate-700'
            }`}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-slate-400 text-xs">{LABELS[i]}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-xl py-2.5 text-sm transition-all"
      >
        Set Intention
      </button>
    </div>
  )
}
