import { useState, useEffect, useRef, useCallback } from 'react'

const LS_KEY = 'zyai_focus_start_time'
const LS_TARGET_KEY = 'zyai_focus_target_seconds'

export type TimerState = 'idle' | 'running'

export interface UseTimerReturn {
  state: TimerState
  startTime: Date | null
  elapsedSeconds: number
  targetSeconds: number | null
  start: (targetSecs?: number | null) => void
  stop: () => Date
  reset: () => void
}

export function useTimer(): UseTimerReturn {
  const [startTime, setStartTime] = useState<Date | null>(() => {
    const stored = localStorage.getItem(LS_KEY)
    return stored ? new Date(stored) : null
  })

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (!stored) return 0
    return Math.floor((Date.now() - new Date(stored).getTime()) / 1000)
  })

  const [targetSeconds, setTargetSeconds] = useState<number | null>(() => {
    const stored = localStorage.getItem(LS_TARGET_KEY)
    return stored ? Number(stored) : null
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!startTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startTime])

  const start = useCallback((targetSecs?: number | null) => {
    const now = new Date()
    localStorage.setItem(LS_KEY, now.toISOString())
    if (targetSecs != null) {
      localStorage.setItem(LS_TARGET_KEY, String(targetSecs))
      setTargetSeconds(targetSecs)
    } else {
      localStorage.removeItem(LS_TARGET_KEY)
      setTargetSeconds(null)
    }
    setStartTime(now)
    setElapsedSeconds(0)
  }, [])

  const stop = useCallback((): Date => {
    const endTime = new Date()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Do NOT clear localStorage here — cleared only after successful save
    return endTime
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(LS_TARGET_KEY)
    setStartTime(null)
    setElapsedSeconds(0)
    setTargetSeconds(null)
  }, [])

  return {
    state: startTime ? 'running' : 'idle',
    startTime,
    elapsedSeconds,
    targetSeconds,
    start,
    stop,
    reset,
  }
}
