import { useState } from 'react'
import { Plus, Trash2, Lock, Calendar } from 'lucide-react'
import type { GoalDraft } from '../types'
import { todayKey } from '../context/AppContext'
import { DurationPicker } from './DurationPicker'

interface Props {
  onLock: (date: string, goals: GoalDraft[]) => void
}

const emptyGoal = (): GoalDraft => ({
  name: '',
  duration: 30,
})

export function DailySetup({ onLock }: Props) {
  const [date, setDate] = useState(todayKey())
  const [goals, setGoals] = useState<GoalDraft[]>([emptyGoal(), emptyGoal()])

  const update = (i: number, field: keyof GoalDraft, value: string | number) => {
    setGoals(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
  }

  const addRow = () => setGoals(prev => [...prev, emptyGoal()])
  const removeRow = (i: number) => setGoals(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)

  const submit = () => {
    const valid = goals.filter(g => g.name.trim() && g.duration > 0)
    if (!valid.length) return
    onLock(date, valid)
  }

  const validCount = goals.filter(g => g.name.trim() && g.duration > 0).length

  return (
    <div className="glass neon-glow p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Plan Your Day</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Add all daily goals at once. Once locked, they cannot be changed until the day ends.
        </p>
      </div>

      <label className="block max-w-xs">
        <span className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1">
          <Calendar size={12} /> Date
        </span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
      </label>

      <div className="space-y-4">
        {goals.map((g, i) => (
          <div key={i} className="glass p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-600 uppercase tracking-wider">Goal {i + 1}</span>
              <button
                onClick={() => removeRow(i)}
                disabled={goals.length <= 1}
                className="p-1.5 text-zinc-600 hover:text-rose-400 transition-colors disabled:opacity-30"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              className="input"
              placeholder="What do you need to do? e.g. Deep Work, Gym, Read"
              value={g.name}
              onChange={e => update(i, 'name', e.target.value)}
            />
            <DurationPicker
              value={g.duration}
              onChange={mins => update(i, 'duration', mins)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center pt-2">
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 text-sm text-orange-400 border border-orange-500/30 rounded-xl hover:bg-orange-500/10 transition-colors"
        >
          <Plus size={14} /> Add Another Goal
        </button>
        <button
          onClick={submit}
          disabled={!validCount}
          className="flex items-center gap-2 px-6 py-3 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Lock size={16} /> Lock Day ({validCount} goals)
        </button>
      </div>
    </div>
  )
}