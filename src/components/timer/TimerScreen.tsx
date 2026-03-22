import { useState } from 'react'
import ElapsedDisplay from './ElapsedDisplay'
import FocusButton from './FocusButton'
import type { TimerState } from '@/hooks/useTimer'

const GOAL_OPTIONS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '60m', seconds: 60 * 60 },
  { label: '90m', seconds: 90 * 60 },
]

interface TimerScreenProps {
  timerState: TimerState
  elapsedSeconds: number
  startTime: Date | null
  targetSeconds: number | null
  streak: number
  onStart: (targetSecs?: number | null) => void
  onStop: () => void
}

function formatStartTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TimerScreen({
  timerState,
  elapsedSeconds,
  startTime,
  targetSeconds,
  streak,
  onStart,
  onStop,
}: TimerScreenProps) {
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null)

  function handleStart() {
    onStart(selectedGoal)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {/* Streak badge */}
      {streak > 0 && timerState === 'idle' && (
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-4 py-1.5">
          <span className="text-base">🔥</span>
          <span className="text-slate-300 text-sm font-medium">{streak}-day streak</span>
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-3">
        <ElapsedDisplay seconds={elapsedSeconds} targetSeconds={targetSeconds} />
        {timerState === 'running' && startTime && (
          <p className="text-slate-500 text-sm">
            Started at {formatStartTime(startTime)}
          </p>
        )}
      </div>

      {/* Goal selector (only when idle) */}
      {timerState === 'idle' && (
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-slate-500 text-xs uppercase tracking-widest">Session goal</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedGoal(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedGoal === null
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              None
            </button>
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => setSelectedGoal(opt.seconds)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedGoal === opt.seconds
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full">
        <FocusButton state={timerState} onStart={handleStart} onStop={onStop} />
      </div>

      {timerState === 'idle' && (
        <p className="text-slate-500 text-sm text-center max-w-xs">
          Tap to begin your focus session. The timer persists even if you close the app.
        </p>
      )}

      {timerState === 'running' && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">In focus</span>
        </div>
      )}
    </div>
  )
}
