import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import Trends from '@/pages/Trends'
import Settings from '@/pages/Settings'

export type Tab = 'home' | 'trends' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <Home />}
      {activeTab === 'trends' && <Trends />}
      {activeTab === 'settings' && <Settings />}
    </AppShell>
  )
}
