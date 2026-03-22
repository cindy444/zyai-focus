import { useSessionStore } from '@/store/sessionStore'

interface AreaSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function AreaSelector({ selected, onChange }: AreaSelectorProps) {
  const customAreas = useSessionStore((s) => s.customAreas)

  function toggle(area: string) {
    if (selected.includes(area)) {
      onChange(selected.filter((a) => a !== area))
    } else {
      onChange([...selected, area])
    }
  }

  return (
    <div>
      <p className="text-slate-300 font-semibold mb-3">Focus Areas</p>
      <div className="grid grid-cols-2 gap-2">
        {customAreas.map((area) => {
          const isSelected = selected.includes(area.name)
          return (
            <button
              key={area.name}
              onClick={() => toggle(area.name)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium text-left transition-colors active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-base leading-none">{area.emoji}</span>
              <span className="leading-tight">{area.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
