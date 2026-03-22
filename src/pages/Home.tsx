import { useState, useEffect, useRef } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useSession } from '@/hooks/useSession'
import { useSessionStore, computeStreaks } from '@/store/sessionStore'
import { useCelebration } from '@/components/celebration/CelebrationContext'
import TimerScreen from '@/components/timer/TimerScreen'
import CompletionModal from '@/components/session/CompletionModal'
import type { CompletionFormState } from '@/types'

export default function Home() {
  const { state, startTime, elapsedSeconds, targetSeconds, start, stop, reset } = useTimer()
  const { saving, error, saveSession } = useSession()
  const sessions = useSessionStore((s) => s.sessions)
  const [showModal, setShowModal] = useState(false)
  const [capturedEndTime, setCapturedEndTime] = useState<Date | null>(null)

  const { current: streak } = computeStreaks(sessions)
  const { trigger: triggerCelebration } = useCelebration()
  const hasTriggeredRef = useRef(false)

  // Auto-trigger celebration when goal is reached
  const goalReached = targetSeconds != null && elapsedSeconds >= targetSeconds
  useEffect(() => {
    if (goalReached && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      triggerCelebration()
    }
    if (!goalReached) {
      hasTriggeredRef.current = false
    }
  }, [goalReached, triggerCelebration])

  function handleStop() {
    const endTime = stop()
    setCapturedEndTime(endTime)
    setShowModal(true)
  }

  async function handleSave(form: CompletionFormState) {
    if (!startTime || !capturedEndTime) return
    try {
      await saveSession({ startTime, endTime: capturedEndTime, estimatedSeconds: targetSeconds, form })
      reset()
      setShowModal(false)
      // Celebrate every completed session
      triggerCelebration()
    } catch {
      // error is set inside useSession, modal stays open
    }
  }

  function handleDiscard() {
    reset()
    setShowModal(false)
  }

  return (
    <>
      <TimerScreen
        timerState={state}
        elapsedSeconds={elapsedSeconds}
        startTime={startTime}
        targetSeconds={targetSeconds}
        streak={streak}
        onStart={start}
        onStop={handleStop}
      />

      {showModal && startTime && capturedEndTime && (
        <CompletionModal
          startTime={startTime}
          endTime={capturedEndTime}
          saving={saving}
          error={error}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}
    </>
  )
}
