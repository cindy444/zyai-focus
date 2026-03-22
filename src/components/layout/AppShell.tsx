import { Sparkles } from 'lucide-react'
import BottomNav from './BottomNav'
import { useCelebration } from '@/components/celebration/CelebrationContext'
import type { Tab } from '@/App'

interface AppShellProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  children: React.ReactNode
}

export default function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  const { trigger } = useCelebration()

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 z-10 flex items-center justify-between">
        <h1 className="text-indigo-400 font-bold text-lg tracking-tight">zyai-focus</h1>
        <button
          onClick={trigger}
          className="opacity-20 hover:opacity-50 active:opacity-80 transition-opacity p-1 rounded"
          aria-label="Celebration"
        >
          <Sparkles size={14} className="text-indigo-300" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24">{children}</main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
