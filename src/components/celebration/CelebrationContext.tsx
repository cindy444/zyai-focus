import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CelebrationState {
  isActive: boolean
  sceneIndex: number
  trigger: () => void
  dismiss: () => void
}

const CelebrationContext = createContext<CelebrationState>({
  isActive: false,
  sceneIndex: 0,
  trigger: () => {},
  dismiss: () => {},
})

export function useCelebration() {
  return useContext(CelebrationContext)
}

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)

  const trigger = useCallback(() => {
    setSceneIndex(Math.floor(Math.random() * 5))
    setIsActive(true)
  }, [])

  const dismiss = useCallback(() => {
    setIsActive(false)
  }, [])

  return (
    <CelebrationContext.Provider value={{ isActive, sceneIndex, trigger, dismiss }}>
      {children}
    </CelebrationContext.Provider>
  )
}
