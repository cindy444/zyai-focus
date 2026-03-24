import { useState, useMemo } from 'react'
import { X, BarChart2, PieChart, TrendingUp } from 'lucide-react'
import { useSessionStore, computeStreaks } from '@/store/sessionStore'
import AreaBarChart from '@/components/trends/AreaBarChart'
import AreaDonutChart from '@/components/trends/AreaDonutChart'
import AreaLineChart from '@/components/trends/AreaLineChart'
import SessionCard from '@/components/trends/SessionCard'
import type { AreaName } from '@/types'

type ChartView = 'bar' | 'donut' | 'line'

type TimeRange = '7d' | '30d' | '90d' | 'all'

const RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'All', value: 'all' },
]

function getRangeMs(range: TimeRange): number | null {
  if (range === '7d') return 7 * 24 * 60 * 60 * 1000
  if (range === '30d') return 30 * 24 * 60 * 60 * 1000
  if (range === '90d') return 90 * 24 * 60 * 60 * 1000
  return null
}

export default function Trends() {
  const { sessions, sessionLogs } = useSessionStore()
  const [selectedArea, setSelectedArea] = useState<AreaName | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [chartView, setChartView] = useState<ChartView>('bar')

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => computeStreaks(sessions),
    [sessions]
  )

  const rangeMs = getRangeMs(timeRange)
  const cutoff = rangeMs != null ? Date.now() - rangeMs : null

  const recentSessions = useMemo(
    () =>
      sessions
        .filter((s) => cutoff == null || new Date(s.created_at).getTime() > cutoff)
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()),
    [sessions, cutoff]
  )

  const recentSessionIds = useMemo(
    () => new Set(recentSessions.map((s) => s.id)),
    [recentSessions]
  )

  const totals = useMemo(() => {
    const sessionSeconds = Object.fromEntries(
      recentSessions.map((s) => [s.id, s.duration_seconds])
    )

    const result: Partial<Record<AreaName, number>> = {}
    for (const log of sessionLogs) {
      if (!recentSessionIds.has(log.session_id)) continue
      const secs = sessionSeconds[log.session_id] ?? 0
      result[log.area_name] = (result[log.area_name] ?? 0) + secs
    }
    return result
  }, [recentSessions, recentSessionIds, sessionLogs])

  const filteredSessions = useMemo(() => {
    if (!selectedArea) return recentSessions
    const sessionIdsWithArea = new Set(
      sessionLogs
        .filter((l) => l.area_name === selectedArea && recentSessionIds.has(l.session_id))
        .map((l) => l.session_id)
    )
    return recentSessions.filter((s) => sessionIdsWithArea.has(s.id))
  }, [selectedArea, recentSessions, sessionLogs, recentSessionIds])

  const totalSeconds = Object.values(totals).reduce((a: number, b) => a + (b ?? 0), 0)

  // Estimation accuracy: sessions that had an estimate
  const estimatedSessions = useMemo(
    () => recentSessions.filter((s) => s.estimated_seconds != null),
    [recentSessions]
  )
  const avgDeltaMins = useMemo(() => {
    if (estimatedSessions.length === 0) return null
    const totalDelta = estimatedSessions.reduce(
      (acc, s) => acc + (s.duration_seconds - s.estimated_seconds!),
      0
    )
    return Math.round(totalDelta / estimatedSessions.length / 60)
  }, [estimatedSessions])

  function handleAreaClick(area: AreaName) {
    setSelectedArea((prev) => (prev === area ? null : area))
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Trends</h2>
          <p className="text-slate-400 text-sm mt-0.5">Your focus history</p>
        </div>
        {/* Time range toggle */}
        <div className="flex bg-slate-800 rounded-xl p-1 gap-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTimeRange(opt.value); setSelectedArea(null) }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                timeRange === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Sessions</p>
          <p className="text-white text-3xl font-bold mt-1 tabular-nums">{recentSessions.length}</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Total Time</p>
          <p className="text-white text-3xl font-bold mt-1 tabular-nums leading-none">
            {totalSeconds >= 3600
              ? `${Math.floor(totalSeconds / 3600)}h`
              : totalSeconds >= 60
                ? `${Math.floor(totalSeconds / 60)}m`
                : `${totalSeconds}s`}
          </p>
          {totalSeconds >= 60 && (
            <p className="text-slate-500 text-xs tabular-nums mt-1">
              {totalSeconds >= 3600
                ? `${Math.floor((totalSeconds % 3600) / 60)}m ${totalSeconds % 60}s`
                : `${totalSeconds % 60}s`}
            </p>
          )}
        </div>
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Current Streak</p>
          <p className="text-white text-3xl font-bold mt-1 tabular-nums">
            {currentStreak > 0 ? `🔥 ${currentStreak}d` : '—'}
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Best Streak</p>
          <p className="text-white text-3xl font-bold mt-1 tabular-nums">
            {longestStreak > 0 ? `${longestStreak}d` : '—'}
          </p>
        </div>
        {avgDeltaMins !== null && (
          <div className="col-span-2 bg-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
              Avg vs Estimate ({estimatedSessions.length} session{estimatedSessions.length !== 1 ? 's' : ''})
            </p>
            <p className={`text-3xl font-bold mt-1 tabular-nums ${
              Math.abs(avgDeltaMins) < 2
                ? 'text-green-400'
                : avgDeltaMins > 0
                  ? 'text-indigo-400'
                  : 'text-amber-400'
            }`}>
              {avgDeltaMins === 0
                ? 'On target'
                : avgDeltaMins > 0
                  ? `+${avgDeltaMins}m over`
                  : `${Math.abs(avgDeltaMins)}m under`}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {avgDeltaMins > 0
                ? 'You tend to focus longer than planned'
                : avgDeltaMins < 0
                  ? 'You tend to stop earlier than planned'
                  : 'Your estimates are spot on'}
            </p>
          </div>
        )}
      </div>

      {/* Chart section */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-slate-300 font-semibold">
            {chartView === 'line' ? 'Daily focus time' : 'Time per area'}
          </p>
          {/* Chart view toggle */}
          <div className="flex bg-slate-700 rounded-lg p-0.5 gap-0.5">
            {([
              { view: 'bar',   Icon: BarChart2,  label: 'Bar'   },
              { view: 'donut', Icon: PieChart,   label: 'Donut' },
              { view: 'line',  Icon: TrendingUp, label: 'Line'  },
            ] as { view: ChartView; Icon: React.ComponentType<{ size: number }>; label: string }[]).map(({ view, Icon, label }) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                aria-label={label}
                className={`p-1.5 rounded-md transition-colors ${
                  chartView === view
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-xs mb-4">
          {chartView === 'line'
            ? 'Focus time per day — tap an area above to filter'
            : 'Tap an area to filter sessions below'}
        </p>
        {chartView === 'bar' && (
          <AreaBarChart totals={totals} selectedArea={selectedArea} onAreaClick={handleAreaClick} />
        )}
        {chartView === 'donut' && (
          <AreaDonutChart totals={totals} selectedArea={selectedArea} onAreaClick={handleAreaClick} />
        )}
        {chartView === 'line' && (
          <AreaLineChart
            sessions={recentSessions}
            sessionLogs={sessionLogs}
            selectedArea={selectedArea}
            timeRange={timeRange}
          />
        )}
      </div>

      {/* Session detail list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 font-semibold">
              {selectedArea ?? 'All Sessions'}
            </p>
            <p className="text-slate-500 text-xs">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {selectedArea && (
            <button
              onClick={() => setSelectedArea(null)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs bg-slate-800 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              Clear filter <X size={12} />
            </button>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">No sessions found.</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              logs={sessionLogs.filter((l) =>
                l.session_id === session.id &&
                (!selectedArea || l.area_name === selectedArea)
              )}
            />
          ))
        )}
      </div>
    </div>
  )
}
