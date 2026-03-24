import type { AreaName } from '@/types'

export const AREA_PALETTE = [
  '#818cf8', '#34d399', '#f472b6', '#fbbf24',
  '#60a5fa', '#a78bfa', '#fb923c', '#4ade80', '#f87171',
]

function formatSeconds(secs: number): string {
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const R = 54
const CX = 80
const CY = 80
const SIZE = 160
const CIRC = 2 * Math.PI * R
const SW = 22

interface AreaDonutChartProps {
  totals: Partial<Record<AreaName, number>>
  selectedArea: AreaName | null
  onAreaClick: (area: AreaName) => void
}

export default function AreaDonutChart({ totals, selectedArea, onAreaClick }: AreaDonutChartProps) {
  const entries = (Object.entries(totals) as [AreaName, number][]).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No sessions logged yet.</p>
        <p className="text-slate-600 text-xs mt-1">Complete a focus session to see trends.</p>
      </div>
    )
  }

  let cumulative = 0

  const centerLabel = selectedArea
    ? (selectedArea.length > 11 ? selectedArea.slice(0, 10) + '…' : selectedArea)
    : 'total'
  const centerValue = selectedArea ? formatSeconds(totals[selectedArea] ?? 0) : formatSeconds(total)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e293b" strokeWidth={SW} />

          {entries.map(([area, seconds], i) => {
            const fraction = seconds / total
            const dashLen = fraction * CIRC
            const offset = CIRC * (0.25 - cumulative)
            cumulative += fraction
            const color = AREA_PALETTE[i % AREA_PALETTE.length]
            const isSelected = selectedArea === area

            return (
              <circle
                key={area}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? SW + 5 : SW}
                strokeDasharray={`${dashLen} ${CIRC - dashLen}`}
                strokeDashoffset={offset}
                opacity={selectedArea && !isSelected ? 0.2 : 1}
                onClick={() => onAreaClick(area)}
                style={{ cursor: 'pointer', transition: 'all 0.25s' }}
              />
            )
          })}

          {/* Center */}
          <text x={CX} y={CY - 5} textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="bold">
            {centerValue}
          </text>
          <text x={CX} y={CY + 11} textAnchor="middle" fill="#64748b" fontSize="9">
            {centerLabel}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1">
        {entries.map(([area, seconds], i) => {
          const pct = Math.round((seconds / total) * 100)
          const isSelected = selectedArea === area
          return (
            <button
              key={area}
              onClick={() => onAreaClick(area)}
              className={`flex items-center gap-2 text-left rounded-lg px-2 py-1.5 transition-colors ${
                isSelected ? 'bg-slate-700/60' : 'hover:bg-slate-700/30'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: AREA_PALETTE[i % AREA_PALETTE.length] }}
              />
              <span className={`text-sm flex-1 min-w-0 truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {area}
              </span>
              <span className="text-slate-500 text-xs tabular-nums shrink-0">{pct}%</span>
              <span className="text-slate-400 text-xs tabular-nums shrink-0 w-12 text-right">
                {formatSeconds(seconds)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
