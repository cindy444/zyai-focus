import { useState } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useSession } from '@/hooks/useSession'
import TimerScreen from '@/components/timer/TimerScreen'
import CompletionModal from '@/components/session/CompletionModal'
import type { CompletionFormState } from '@/types'

export default function Home() {
  const { state, startTime, elapsedSeconds, start, stop, reset } = useTimer()
  const { saving, error, saveSession } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [capturedEndTime, setCapturedEndTime] = useState<Date | null>(null)

  function handleStop() {
    const endTime = stop()
    setCapturedEndTime(endTime)
    setShowModal(true)
  }

  async function handleSave(form: CompletionFormState) {
    if (!startTime || !capturedEndTime) return
    try {
      await saveSession({ startTime, endTime: capturedEndTime, form })
      reset()
      setShowModal(false)
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
