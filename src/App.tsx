import { useState, Suspense, lazy, Component, type ReactNode } from 'react'
import AppShell from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import Trends from '@/pages/Trends'
import Settings from '@/pages/Settings'
import { CelebrationProvider } from '@/components/celebration/CelebrationContext'

const CelebrationOverlay = lazy(
  () => import('@/components/celebration/CelebrationOverlay')
)

// Error boundary so the celebration module can never crash the app
class CelebrationErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn('[Celebration] 3D scene error:', error.message)
    // Reset after a moment so subsequent triggers can retry
    setTimeout(() => this.setState({ hasError: false }), 1000)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export type Tab = 'home' | 'trends' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  return (
    <CelebrationProvider>
      <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'home' && <Home />}
        {activeTab === 'trends' && <Trends />}
        {activeTab === 'settings' && <Settings />}
      </AppShell>

      <CelebrationErrorBoundary>
        <Suspense fallback={null}>
          <CelebrationOverlay />
        </Suspense>
      </CelebrationErrorBoundary>
    </CelebrationProvider>
  )
}
