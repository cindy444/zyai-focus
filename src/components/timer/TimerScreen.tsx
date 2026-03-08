import ElapsedDisplay from './ElapsedDisplay'
import FocusButton from './FocusButton'
import type { TimerState } from '@/hooks/useTimer'

interface TimerScreenProps {
  timerState: TimerState
  elapsedSeconds: number
  startTime: Date | null
  onStart: () => void
  onStop: () => void
}

function formatStartTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TimerScreen({
  timerState,
  elapsedSeconds,
  startTime,
  onStart,
  onStop,
}: TimerScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 px-4">
      <div className="w-full flex flex-col items-center gap-3">
        <ElapsedDisplay seconds={elapsedSeconds} />
        {timerState === 'running' && startTime && (
          <p className="text-slate-500 text-sm">
            Started at {formatStartTime(startTime)}
          </p>
        )}
      </div>

      <div className="w-full">
        <FocusButton state={timerState} onStart={onStart} onStop={onStop} />
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
