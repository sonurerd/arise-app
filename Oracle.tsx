import type { ElementType } from 'react'
import { Clock, Sparkles, TrendingDown, Target, Trophy, Rocket, Gauge, List } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { coachInsights, todayAvgIntegrity } from '../lib/logic'

const ICONS: Record<string, ElementType> = {
  rocket: Rocket,
  clock: Clock,
  sparkles: Sparkles,
  'trending-down': TrendingDown,
  target: Target,
  trophy: Trophy,
}

export function Oracle() {
  const { state } = useApp()
  const insights = coachInsights(state)
  const todayAvg = todayAvgIntegrity(state.todayIntegrities)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Discipline Oracle</h1>
        <p className="text-sm text-zinc-500 mt-1">Coaching based on your integrity data</p>
      </div>

      <div className="space-y-4">
        {insights.map((item, i) => {
          const Icon = ICONS[item.icon] || Sparkles
          return (
            <div key={i} className="glass p-6 border-l-[3px] border-l-orange-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-200">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mt-1">{item.body}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass p-6">
        <p className="text-sm text-zinc-500 mb-4">System Status</p>
        <div className="grid grid-cols-3 gap-6">
          <StatusItem icon={Gauge} label="Momentum" value={state.user.momentum} />
          <StatusItem icon={List} label="Goals Left" value={String(state.protocols.length)} />
          <StatusItem icon={Target} label="Today Avg" value={todayAvg ? `${todayAvg}%` : '—'} />
        </div>
      </div>
    </div>
  )
}

function StatusItem({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-zinc-600">
        <Icon size={12} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-zinc-300 mt-1">{value}</p>
    </div>
  )
}