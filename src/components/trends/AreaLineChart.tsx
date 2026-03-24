import { useMemo, useState, useCallback } from 'react'
import type { Session, SessionLog, AreaName } from '@/types'

type TimeRange = '7d' | '30d' | '90d' | 'all'

interface AreaLineChartProps {
  sessions: Session[]
  sessionLogs: SessionLog[]
  selectedArea: AreaName | null
  timeRange: TimeRange
}

const VW = 320
const VH = 140
const PAD = { top: 10, right: 12, bottom: 28, left: 36 }
const PW = VW - PAD.left - PAD.right  // 272
const PH = VH - PAD.top - PAD.bottom  // 102

// Tooltip dimensions
const TW = 72
const TH = 36

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function shortLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function fmtY(secs: number): string {
  if (secs <= 0) return '0'
  const m = Math.round(secs / 60)
  if (m < 60) return `${m}m`
  const h = secs / 3600
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`
}

function fmtTooltip(secs: number): string {
  if (secs <= 0) return 'No focus'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m === 0) return `${s}s`
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}

export default function AreaLineChart({ sessions, sessionLogs, selectedArea, timeRange }: AreaLineChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  // Build ordered day list for the selected range
  const days = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    let start: Date
    if (timeRange === 'all') {
      if (sessions.length === 0) {
        start = new Date()
        start.setDate(start.getDate() - 6)
      } else {
        const earliest = Math.min(...sessions.map((s) => new Date(s.start_time).getTime()))
        start = new Date(earliest)
      }
    } else {
      const back = timeRange === '7d' ? 6 : timeRange === '30d' ? 29 : 89
      start = new Date()
      start.setDate(start.getDate() - back)
    }
    start.setHours(0, 0, 0, 0)

    const result: string[] = []
    const cursor = new Date(start)
    while (cursor <= today) {
      result.push(dateStr(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [timeRange, sessions])

  // Daily totals, optionally filtered by area
  const dailyData = useMemo(() => {
    let relevant = sessions
    if (selectedArea) {
      const ids = new Set(
        sessionLogs.filter((l) => l.area_name === selectedArea).map((l) => l.session_id)
      )
      relevant = sessions.filter((s) => ids.has(s.id))
    }

    const byDay: Record<string, number> = {}
    for (const s of relevant) {
      const day = s.start_time.slice(0, 10)
      byDay[day] = (byDay[day] ?? 0) + s.duration_seconds
    }
    return days.map((d) => ({ date: d, seconds: byDay[d] ?? 0 }))
  }, [days, sessions, sessionLogs, selectedArea])

  const maxSecs = Math.max(...dailyData.map((d) => d.seconds), 60)

  // Which x-axis indices to label
  const labelIndices = useMemo(() => {
    const n = days.length
    if (n <= 8) return days.map((_, i) => i)
    const targetCount = n <= 31 ? 6 : 7
    const step = Math.ceil((n - 1) / (targetCount - 1))
    const indices: number[] = []
    for (let i = 0; i < n - 1; i += step) indices.push(i)
    indices.push(n - 1)
    return indices
  }, [days])

  const n = dailyData.length

  const pts = useMemo(() =>
    dailyData.map((d, i) => ({
      x: PAD.left + (n === 1 ? PW / 2 : (i / (n - 1)) * PW),
      y: PAD.top + PH - (d.seconds / maxSecs) * PH,
      seconds: d.seconds,
      date: d.date,
    })),
    [dailyData, n, maxSecs]
  )

  // Find nearest point from SVG-space x coordinate
  const findNearest = useCallback((svgX: number): number => {
    let nearest = 0
    let minDist = Infinity
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - svgX)
      if (dist < minDist) { minDist = dist; nearest = i }
    })
    return nearest
  }, [pts])

  function getSvgX(e: React.PointerEvent<SVGSVGElement>): number {
    const rect = e.currentTarget.getBoundingClientRect()
    return ((e.clientX - rect.left) / rect.width) * VW
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No sessions logged yet.</p>
        <p className="text-slate-600 text-xs mt-1">Complete a focus session to see trends.</p>
      </div>
    )
  }

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const fillPath = `${linePath} L${pts[pts.length - 1].x},${PAD.top + PH} L${pts[0].x},${PAD.top + PH} Z`

  // Tooltip for active point
  const tooltip = activeIdx !== null ? (() => {
    const p = pts[activeIdx]
    const tx = Math.min(Math.max(p.x - TW / 2, PAD.left), PAD.left + PW - TW)
    const ty = p.y - TH - 10 < PAD.top ? p.y + 10 : p.y - TH - 10
    return { p, tx, ty }
  })() : null

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible', touchAction: 'none' }}
      onPointerMove={(e) => setActiveIdx(findNearest(getSvgX(e)))}
      onPointerLeave={() => setActiveIdx(null)}
    >
      {/* Gridlines */}
      <line x1={PAD.left} y1={PAD.top}          x2={PAD.left + PW} y2={PAD.top}          stroke="#1e293b" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top + PH / 2} x2={PAD.left + PW} y2={PAD.top + PH / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 3" />
      <line x1={PAD.left} y1={PAD.top + PH}     x2={PAD.left + PW} y2={PAD.top + PH}     stroke="#1e293b" strokeWidth="1" />

      {/* Y labels */}
      <text x={PAD.left - 4} y={PAD.top + 4}          textAnchor="end" fill="#475569" fontSize="8">{fmtY(maxSecs)}</text>
      <text x={PAD.left - 4} y={PAD.top + PH / 2 + 4} textAnchor="end" fill="#475569" fontSize="8">{fmtY(maxSecs / 2)}</text>
      <text x={PAD.left - 4} y={PAD.top + PH + 4}     textAnchor="end" fill="#475569" fontSize="8">0</text>

      {/* Fill */}
      <path d={fillPath} fill="#6366f1" opacity="0.1" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Crosshair vertical line */}
      {activeIdx !== null && (
        <line
          x1={pts[activeIdx].x} y1={PAD.top}
          x2={pts[activeIdx].x} y2={PAD.top + PH}
          stroke="#475569" strokeWidth="1" strokeDasharray="3 3"
        />
      )}

      {/* Dots */}
      {n <= 30 && pts.map((p, i) => {
        const isActive = activeIdx === i
        return p.seconds > 0 ? (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={isActive ? 5 : 3}
            fill={isActive ? '#a5b4fc' : '#818cf8'}
            stroke="#0f172a"
            strokeWidth="1.5"
            style={{ transition: 'r 0.1s, fill 0.1s' }}
          />
        ) : null
      })}

      {/* Active dot for >30 day views (no static dots, but still show active) */}
      {n > 30 && activeIdx !== null && pts[activeIdx].seconds > 0 && (
        <circle
          cx={pts[activeIdx].x} cy={pts[activeIdx].y}
          r="5" fill="#a5b4fc" stroke="#0f172a" strokeWidth="1.5"
        />
      )}

      {/* Transparent hit area */}
      <rect
        x={PAD.left} y={PAD.top}
        width={PW} height={PH}
        fill="transparent"
      />

      {/* Tooltip */}
      {tooltip && (
        <g>
          <rect
            x={tooltip.tx} y={tooltip.ty}
            width={TW} height={TH}
            rx="4"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="0.75"
          />
          <text
            x={tooltip.tx + TW / 2} y={tooltip.ty + 12}
            textAnchor="middle" fill="#94a3b8" fontSize="8"
          >
            {shortLabel(tooltip.p.date)}
          </text>
          <text
            x={tooltip.tx + TW / 2} y={tooltip.ty + 27}
            textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold"
          >
            {fmtTooltip(tooltip.p.seconds)}
          </text>
        </g>
      )}

      {/* X labels */}
      {labelIndices.map((i) => (
        <text key={i} x={pts[i].x} y={VH - 2} textAnchor="middle" fill="#475569" fontSize="8">
          {shortLabel(days[i])}
        </text>
      ))}
    </svg>
  )
}
