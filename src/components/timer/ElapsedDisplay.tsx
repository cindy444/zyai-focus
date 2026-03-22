interface ElapsedDisplayProps {
  seconds: number
  targetSeconds?: number | null
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function ElapsedDisplay({ seconds, targetSeconds }: ElapsedDisplayProps) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const goalReached = targetSeconds != null && seconds >= targetSeconds
  const progress = targetSeconds != null ? Math.min(seconds / targetSeconds, 1) : null

  return (
    <div className="text-center w-full max-w-xs mx-auto">
      <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-2">
        Focus Time
      </p>
      <p className={`text-6xl font-mono font-bold tabular-nums tracking-tight transition-colors ${goalReached ? 'text-green-400' : 'text-white'}`}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>

      {targetSeconds != null && (
        <div className="mt-4 flex flex-col items-center gap-1.5">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${goalReached ? 'bg-green-400' : 'bg-indigo-500'}`}
              style={{ width: `${(progress ?? 0) * 100}%` }}
            />
          </div>
          {goalReached ? (
            <p className="text-green-400 text-xs font-medium tracking-wide animate-pulse">
              Goal reached!
            </p>
          ) : (
            <p className="text-slate-500 text-xs tabular-nums">
              {Math.max(0, Math.ceil((targetSeconds - seconds) / 60))}m remaining
            </p>
          )}
        </div>
      )}
    </div>
  )
}
