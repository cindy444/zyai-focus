import {
  Cpu,
  Heart,
  Users,
  Briefcase,
  DollarSign,
  Brain,
  Youtube,
  Code2,
  BookOpen,
} from 'lucide-react'
import { ALL_AREAS } from '@/types'
import type { AreaName } from '@/types'

const AREA_ICONS: Record<AreaName, React.ReactNode> = {
  'System Design': <Cpu size={18} />,
  'Parental family': <Heart size={18} />,
  'Social': <Users size={18} />,
  'Professional (Linkedin)': <Briefcase size={18} />,
  'Financial': <DollarSign size={18} />,
  'Personal (Mental Health)': <Brain size={18} />,
  'Youtube': <Youtube size={18} />,
  'Tech Playground': <Code2 size={18} />,
  'Reading': <BookOpen size={18} />,
}

interface AreaSelectorProps {
  selected: AreaName[]
  onChange: (selected: AreaName[]) => void
}

export default function AreaSelector({ selected, onChange }: AreaSelectorProps) {
  function toggle(area: AreaName) {
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
        {ALL_AREAS.map((area) => {
          const isSelected = selected.includes(area)
          return (
            <button
              key={area}
              onClick={() => toggle(area)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium text-left transition-colors active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className={isSelected ? 'text-indigo-200' : 'text-slate-400'}>
                {AREA_ICONS[area]}
              </span>
              <span className="leading-tight">{area}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
