const EMOJIS = ['😫', '😕', '😐', '😊', '🔥']
const LABELS = ['Rough', 'Low', 'Okay', 'Good', 'On fire']

interface MotivationSliderProps {
  value: number
  onChange: (value: number) => void
}

export default function MotivationSlider({ value, onChange }: MotivationSliderProps) {
  return (
    <div>
      <p className="text-slate-300 font-semibold mb-3">Motivation Level</p>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = value === level
          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500'
                  : 'bg-slate-800 border-slate-600 hover:border-slate-500'
              }`}
            >
              <span className="text-xl">{EMOJIS[level - 1]}</span>
              <span
                className={`text-xs font-medium ${
                  isSelected ? 'text-indigo-200' : 'text-slate-500'
                }`}
              >
                {level}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-center text-slate-500 text-xs mt-2">
        {value > 0 ? LABELS[value - 1] : 'Tap to rate'}
      </p>
    </div>
  )
}
