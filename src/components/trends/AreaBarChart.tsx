import { ChevronRight } from 'lucide-react'
import type { AreaName } from '@/types'

interface AreaBarChartProps {
  totals: Partial<Record<AreaName, number>>
  selectedArea: AreaName | null
  onAreaClick: (area: AreaName) => void
}

function formatSeconds(secs: number): string {
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ${secs % 60}s`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function AreaBarChart({ totals, selectedArea, onAreaClick }: AreaBarChartProps) {
  const entries = Object.entries(totals) as [AreaName, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] ?? 1

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No sessions logged yet.</p>
        <p className="text-slate-600 text-xs mt-1">
          Complete a focus session to see trends.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(([area, mins]) => {
        const pct = Math.round((mins / max) * 100)
        const isSelected = selectedArea === area
        return (
          <button
            key={area}
            onClick={() => onAreaClick(area)}
            className={`flex flex-col gap-1 text-left rounded-xl p-2 -mx-2 transition-colors ${
              isSelected ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>
                {area}
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-sm tabular-nums">
                {formatSeconds(mins)}
                <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-90 text-indigo-400' : ''}`} />
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-indigo-400' : 'bg-indigo-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
