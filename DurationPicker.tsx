import { Minus, Plus } from 'lucide-react'
import clsx from 'clsx'

const PRESETS = [15, 25, 30, 45, 60, 90, 120]

interface Props {
  value: number
  onChange: (minutes: number) => void
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function DurationPicker({ value, onChange }: Props) {
  const step = (delta: number) => onChange(Math.max(1, value + delta))

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-5)}
          className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          <Minus size={14} />
        </button>
        <div className="flex-grow relative">
          <input
            type="number"
            min={1}
            value={value}
            onChange={e => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="input text-center text-lg font-semibold pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">min</span>
        </div>
        <button
          type="button"
          onClick={() => step(5)}
          className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <p className="text-xs text-orange-400/80 text-center">{formatDuration(value)}</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {PRESETS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
              value === p
                ? 'bg-orange-500/25 text-orange-300 border border-orange-500/40'
                : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700 hover:border-orange-500/30 hover:text-zinc-300',
            )}
          >
            {formatDuration(p)}
          </button>
        ))}
      </div>
    </div>
  )
}