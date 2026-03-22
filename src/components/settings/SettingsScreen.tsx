import { useState, useRef } from 'react'
import { Download, Upload, CheckCircle, AlertCircle, Plus, Trash2, Pencil } from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { useSessionStore } from '@/store/sessionStore'
import { hasSupabase } from '@/lib/supabaseClient'
import type { AreaConfig } from '@/types'

const EMOJI_OPTIONS = [
  '⚙️','❤️','👥','💼','💰','🧠','📹','💻','📚',
  '🎯','🏋️','🎨','🎵','✍️','🌿','🔬','📊','🏠',
  '✈️','🍎','🎓','💡','🔧','🤝','🌟','📱','🎮',
]

export default function SettingsScreen() {
  const { exportBackup, importBackup } = useSession()
  const { customAreas, setCustomAreas } = useSessionStore()

  const [exportState, setExportState] = useState<'idle' | 'success' | 'error'>('idle')
  const [importState, setImportState] = useState<'idle' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState('')

  // Area management state
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')

  const importRef = useRef<HTMLInputElement>(null)

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

  function handleImportClick() {
    importRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const text = await file.text()
      const result = importBackup(text)
      if (result.ok) {
        setImportState('success')
        setTimeout(() => setImportState('idle'), 3000)
      } else {
        setImportError(result.error ?? 'Import failed')
        setImportState('error')
        setTimeout(() => { setImportState('idle'); setImportError('') }, 4000)
      }
    } catch {
      setImportError('Could not read file')
      setImportState('error')
      setTimeout(() => { setImportState('idle'); setImportError('') }, 4000)
    }
  }

  // Area management
  function startEdit(idx: number) {
    setEditingIdx(idx)
    setEditName(customAreas[idx].name)
    setEditEmoji(customAreas[idx].emoji)
  }

  function saveEdit() {
    if (editingIdx === null || !editName.trim()) return
    const updated = customAreas.map((a, i) =>
      i === editingIdx ? { name: editName.trim(), emoji: editEmoji } : a
    )
    setCustomAreas(updated)
    setEditingIdx(null)
  }

  function deleteArea(idx: number) {
    setCustomAreas(customAreas.filter((_, i) => i !== idx))
  }

  function addArea() {
    if (!newName.trim()) return
    const area: AreaConfig = { name: newName.trim(), emoji: newEmoji }
    setCustomAreas([...customAreas, area])
    setNewName('')
    setNewEmoji('🎯')
    setAddingNew(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h2 className="text-white font-bold text-xl">Settings</h2>
        <p className="text-slate-400 text-sm mt-0.5">Manage your data and areas</p>
      </div>

      {/* Manage Areas */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-slate-300 font-semibold">Focus Areas</p>
        <p className="text-slate-400 text-sm">Add, rename, or remove areas. Changes apply to new sessions.</p>

        <div className="flex flex-col gap-2">
          {customAreas.map((area, idx) => (
            <div key={idx}>
              {editingIdx === idx ? (
                <div className="flex flex-col gap-2 bg-slate-700 rounded-xl p-3">
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEditEmoji(e)}
                        className={`text-xl p-1 rounded-lg transition-colors ${editEmoji === e ? 'bg-indigo-600' : 'hover:bg-slate-600'}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg py-2 transition-colors">Save</button>
                    <button onClick={() => setEditingIdx(null)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg py-2 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2.5">
                  <span className="text-lg">{area.emoji}</span>
                  <span className="text-slate-200 text-sm flex-1">{area.name}</span>
                  <button onClick={() => startEdit(idx)} className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteArea(idx)} className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {addingNew ? (
            <div className="flex flex-col gap-2 bg-slate-700 rounded-xl p-3">
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={`text-xl p-1 rounded-lg transition-colors ${newEmoji === e ? 'bg-indigo-600' : 'hover:bg-slate-600'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addArea() }}
                placeholder="Area name"
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={addArea} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg py-2 transition-colors">Add</button>
                <button onClick={() => { setAddingNew(false); setNewName('') }} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg py-2 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center justify-center gap-2 border border-dashed border-slate-600 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-xl py-2.5 text-sm transition-colors"
            >
              <Plus size={16} /> Add area
            </button>
          )}
        </div>
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
              <><CheckCircle size={18} className="text-green-400" /><span className="text-green-400">Backup downloaded!</span></>
            ) : exportState === 'error' ? (
              <><AlertCircle size={18} className="text-red-400" /><span className="text-red-400">Export failed</span></>
            ) : (
              <><Download size={18} />Backup Data</>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-slate-400 text-sm">
            Restore a previously exported backup file. This will replace all current data.
          </p>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-medium rounded-xl py-3.5 px-4 transition-all"
          >
            {importState === 'success' ? (
              <><CheckCircle size={18} className="text-green-400" /><span className="text-green-400">Import successful!</span></>
            ) : importState === 'error' ? (
              <><AlertCircle size={18} className="text-red-400" /><span className="text-red-400">{importError || 'Import failed'}</span></>
            ) : (
              <><Upload size={18} />Import Backup</>
            )}
          </button>
        </div>
      </div>

      {/* Storage Mode */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-slate-300 font-semibold">Storage Mode</p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasSupabase ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <p className="text-slate-400 text-sm">
            {hasSupabase ? 'Syncing to Supabase cloud' : 'Local only (Supabase not configured)'}
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
        <p className="text-slate-500 text-sm">zyai-focus v0.2.0</p>
        <p className="text-slate-600 text-xs">Momentum Tracker PWA</p>
      </div>
    </div>
  )
}
