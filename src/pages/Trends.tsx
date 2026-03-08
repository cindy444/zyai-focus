import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import AreaBarChart from '@/components/trends/AreaBarChart'
import SessionCard from '@/components/trends/SessionCard'
import type { AreaName } from '@/types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export default function Trends() {
  const { sessions, sessionLogs } = useSessionStore()
  const [selectedArea, setSelectedArea] = useState<AreaName | null>(null)

  const cutoff = Date.now() - THIRTY_DAYS_MS

  const recentSessions = useMemo(
    () =>
      sessions
        .filter((s) => new Date(s.created_at).getTime() > cutoff)
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

  // Filtered sessions: if an area is selected, only sessions that have a log for that area
  const filteredSessions = useMemo(() => {
    if (!selectedArea) return recentSessions
    const sessionIdsWithArea = new Set(
      sessionLogs
        .filter((l) => l.area_name === selectedArea && recentSessionIds.has(l.session_id))
        .map((l) => l.session_id)
    )
    return recentSessions.filter((s) => sessionIdsWithArea.has(s.id))
  }, [selectedArea, recentSessions, sessionLogs, recentSessionIds])

  const totalSeconds = Object.values(totals).reduce((a, b) => a + b, 0)

  function handleAreaClick(area: AreaName) {
    setSelectedArea((prev) => (prev === area ? null : area))
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h2 className="text-white font-bold text-xl">Trends</h2>
        <p className="text-slate-400 text-sm mt-0.5">Last 30 days</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
            Sessions
          </p>
          <p className="text-white text-3xl font-bold mt-1 tabular-nums">
            {recentSessions.length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
            Total Time
          </p>
          <p className="text-white text-3xl font-bold mt-1 tabular-nums">
            {totalSeconds >= 3600
              ? `${Math.floor(totalSeconds / 3600)}h`
              : totalSeconds >= 60
                ? `${Math.floor(totalSeconds / 60)}m`
                : `${totalSeconds}s`}
          </p>
        </div>
      </div>

      {/* Area bar chart — tap an area to filter */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <p className="text-slate-300 font-semibold mb-1">Minutes per area</p>
        <p className="text-slate-500 text-xs mb-4">Tap an area to filter sessions below</p>
        <AreaBarChart
          totals={totals}
          selectedArea={selectedArea}
          onAreaClick={handleAreaClick}
        />
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
