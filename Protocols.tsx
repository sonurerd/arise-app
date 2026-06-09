import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ProtocolCard } from '../components/ProtocolCard'
import { SessionModal } from '../components/SessionModal'
import { DailySetup } from '../components/DailySetup'
import { todayAvgIntegrity } from '../lib/logic'
import type { Protocol } from '../types'

export function Protocols() {
  const { state, lockDailyGoals, finishProtocol } = useApp()
  const [active, setActive] = useState<Protocol | null>(null)
  const todayAvg = todayAvgIntegrity(state.todayIntegrities)
  const canPlan = !state.dayLocked && !state.dayClosed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Today</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {canPlan
            ? 'Set all your goals for the day — they lock until finished'
            : state.dayClosed
              ? `Day closed · ${todayAvg}% average integrity`
              : `${state.protocols.length} goals remaining · ${todayAvg}% running avg`}
        </p>
      </div>

      {canPlan && <DailySetup onLock={(date, goals) => lockDailyGoals(date, goals)} />}

      {state.dayLocked && !state.dayClosed && (
        <>
          <div className="flex items-center gap-2 text-sm text-orange-400/80">
            <Lock size={14} />
            Day is locked — goals cannot be edited until all are finished
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.protocols.map(p => (
              <ProtocolCard key={p.id} protocol={p} onStart={() => setActive(p)} />
            ))}
          </div>
          {!state.protocols.length && state.todayIntegrities.length > 0 && (
            <p className="text-zinc-500 text-sm">All goals finished. Day will close automatically.</p>
          )}
        </>
      )}

      {state.dayClosed && (
        <div className="glass neon-glow p-10 text-center">
          <p className="text-xl font-semibold text-zinc-200">Today's goals are done</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{todayAvg}%</p>
          <p className="text-sm text-zinc-500 mt-2">
            {todayAvg > 80 ? 'Disciplined day — great work.' : 'Below 80% threshold for a disciplined day.'}
          </p>
          <p className="text-xs text-zinc-600 mt-4">New goals available tomorrow.</p>
        </div>
      )}

      <SessionModal
        protocol={active}
        onClose={() => setActive(null)}
        onComplete={mins => { if (active) finishProtocol(active.id, mins) }}
      />
    </div>
  )
}