import type { AreaName } from '@/types'

interface AreaLogInputProps {
  area: AreaName
  value: string
  onChange: (value: string) => void
}

export default function AreaLogInput({ area, value, onChange }: AreaLogInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-slate-300 text-sm font-medium">{area}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`What did you accomplish in ${area}?`}
        rows={2}
        className="bg-slate-800 border border-slate-600 rounded-xl p-3 w-full text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  )
}
