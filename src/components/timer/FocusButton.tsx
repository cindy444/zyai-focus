import { Play, Square } from 'lucide-react'
import type { TimerState } from '@/hooks/useTimer'

interface FocusButtonProps {
  state: TimerState
  onStart: () => void
  onStop: () => void
}

export default function FocusButton({ state, onStart, onStop }: FocusButtonProps) {
  if (state === 'running') {
    return (
      <button
        onClick={onStop}
        className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-red-500 hover:bg-red-400 active:scale-95 text-white font-bold text-xl rounded-2xl py-6 px-8 transition-all duration-150 shadow-lg shadow-red-500/30"
      >
        <Square size={24} fill="white" />
        Stop
      </button>
    )
  }

  return (
    <button
      onClick={onStart}
      className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xl rounded-2xl py-6 px-8 transition-all duration-150 shadow-lg shadow-indigo-500/30"
    >
      <Play size={24} fill="white" />
      Start Focus
    </button>
  )
}
