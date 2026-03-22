import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useCelebration } from './CelebrationContext'
import { SCENES } from './scenes'

const DURATION = 8000
const FADE_DURATION = 700

export default function CelebrationOverlay() {
  const { isActive, sceneIndex, dismiss } = useCelebration()
  const [visible, setVisible] = useState(false)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (isActive) {
      setVisible(true)
      // Fade in on next frame so CSS transition fires
      const raf = requestAnimationFrame(() => setOpacity(1))

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setOpacity(0)
        setTimeout(() => {
          dismiss()
          setVisible(false)
        }, FADE_DURATION)
      }, DURATION)

      return () => {
        cancelAnimationFrame(raf)
        clearTimeout(timer)
      }
    } else {
      setOpacity(0)
      const t = setTimeout(() => setVisible(false), FADE_DURATION)
      return () => clearTimeout(t)
    }
  }, [isActive, dismiss])

  if (!visible) return null

  const SceneComponent = SCENES[sceneIndex % SCENES.length]

  function handleDismiss() {
    setOpacity(0)
    setTimeout(() => {
      dismiss()
      setVisible(false)
    }, FADE_DURATION)
  }

  return (
    <div
      className="fixed inset-0 z-[40]"
      style={{
        opacity,
        transition: `opacity ${FADE_DURATION}ms ease-in-out`,
      }}
    >
      <Canvas
        gl={{ alpha: false, antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#0f172a' }}
      >
        <color attach="background" args={['#0f172a']} />
        <SceneComponent />
      </Canvas>

      {/* Tap to dismiss */}
      <button
        onClick={handleDismiss}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
        aria-label="Dismiss celebration"
      />

      {/* Dismiss hint */}
      <p
        style={{
          position: 'absolute',
          bottom: '7rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        Tap anywhere to dismiss
      </p>
    </div>
  )
}
