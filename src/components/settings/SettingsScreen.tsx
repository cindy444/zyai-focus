import { useState } from 'react'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { hasSupabase } from '@/lib/supabaseClient'

export default function SettingsScreen() {
  const { exportBackup } = useSession()
  const [exportState, setExportState] = useState<'idle' | 'success' | 'error'>('idle')

  function handleExport() {
    try {
      exportBackup()
      setExportState('success')
      setTimeout(() => setExportState('idle'), 3000)
    } catch {
      setExportState('error')
      setTimeout(() => setExportState('idle'), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h2 className="text-white font-bold text-xl">Settings</h2>
        <p className="text-slate-400 text-sm mt-0.5">Manage your data</p>
      </div>

      {/* Data Management */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-4">
        <p className="text-slate-300 font-semibold">Data Management</p>

        <div className="flex flex-col gap-2">
          <p className="text-slate-400 text-sm">
            Export all your sessions and logs as a JSON backup file.
          </p>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-medium rounded-xl py-3.5 px-4 transition-all"
          >
            {exportState === 'success' ? (
              <>
                <CheckCircle size={18} className="text-green-400" />
                <span className="text-green-400">Backup downloaded!</span>
              </>
            ) : exportState === 'error' ? (
              <>
                <AlertCircle size={18} className="text-red-400" />
                <span className="text-red-400">Export failed</span>
              </>
            ) : (
              <>
                <Download size={18} />
                Backup Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Storage Mode */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-slate-300 font-semibold">Storage Mode</p>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${hasSupabase ? 'bg-green-400' : 'bg-yellow-400'}`}
          />
          <p className="text-slate-400 text-sm">
            {hasSupabase
              ? 'Syncing to Supabase cloud'
              : 'Local only (Supabase not configured)'}
          </p>
        </div>
        {!hasSupabase && (
          <p className="text-slate-500 text-xs">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to enable cloud sync.
          </p>
        )}
      </div>

      {/* About */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-1">
        <p className="text-slate-300 font-semibold">About</p>
        <p className="text-slate-500 text-sm">zyai-focus v0.1.0</p>
        <p className="text-slate-600 text-xs">Momentum Tracker PWA</p>
      </div>
    </div>
  )
}
