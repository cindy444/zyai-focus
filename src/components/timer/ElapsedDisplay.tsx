interface ElapsedDisplayProps {
  seconds: number
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function ElapsedDisplay({ seconds }: ElapsedDisplayProps) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return (
    <div className="text-center">
      <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-2">
        Focus Time
      </p>
      <p className="text-6xl font-mono font-bold tabular-nums text-white tracking-tight">
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>
    </div>
  )
}
