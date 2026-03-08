import { useState, useEffect, useRef, useCallback } from 'react'

const LS_KEY = 'zyai_focus_start_time'

export type TimerState = 'idle' | 'running'

export interface UseTimerReturn {
  state: TimerState
  startTime: Date | null
  elapsedSeconds: number
  start: () => void
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

  const start = useCallback(() => {
    const now = new Date()
    localStorage.setItem(LS_KEY, now.toISOString())
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
    setStartTime(null)
    setElapsedSeconds(0)
  }, [])

  return {
    state: startTime ? 'running' : 'idle',
    startTime,
    elapsedSeconds,
    start,
    stop,
    reset,
  }
}
