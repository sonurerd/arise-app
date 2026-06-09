import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Shield, Target, PlayCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { StatCard } from '../components/StatCard'
import { ProtocolCard } from '../components/ProtocolCard'
import { SessionModal } from '../components/SessionModal'
import { DailySetup } from '../components/DailySetup'
import { avgIntegrity, greeting, levelProgress, todayAvgIntegrity, weeklyActivity } from '../lib/logic'
import type { Protocol } from '../types'

export function Dashboard() {
  const { state, lockDailyGoals, finishProtocol } = useApp()
  const navigate = useNavigate()
  const [active, setActive] = useState<Protocol | null>(null)
  const { pct, days, next } = levelProgress(state.user)
  const week = weeklyActivity(state.dailyLog)
  const todayAvg = todayAvgIntegrity(state.todayIntegrities)
  const days_labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const canPlan = !state.dayLocked && !state.dayClosed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">{greeting(state.user.name)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Disciplined Days" value={String(state.user.disciplinedDays)} icon={Calendar} />
        <StatCard label="All-time Avg" value={`${avgIntegrity(state.integrityHistory)}%`} icon={Shield} color="text-orange-400" />
        <StatCard label="Today Avg" value={todayAvg ? `${todayAvg}%` : '—'} icon={Target} color="text-amber-400" />
        <StatCard label="Sessions" value={String(state.completedSessions)} icon={PlayCircle} color="text-zinc-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass p-6 lg:col-span-2">
          <p className="text-sm text-zinc-500 mb-3">Level Progress</p>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-black gradient-text">{state.user.level}</span>
            <div className="flex-grow pb-1">
              <p className="text-zinc-300 font-medium">{state.user.disciplineState} → Level {Math.min(state.user.level + 1, 12)}</p>
              <div className="h-2.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-zinc-600 mt-1">{days} of {next} disciplined days (need &gt;80% daily avg)</p>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <p className="text-sm text-zinc-500 mb-4">This Week</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {week.map((active, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-md transition-all"
                  style={{ height: active ? 72 : 12, background: active ? '#ff6b00' : '#27272a' }}
                />
                <span className="text-xs text-zinc-600">{days_labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {canPlan && (
        <DailySetup onLock={(date, goals) => lockDailyGoals(date, goals)} />
      )}

      {state.dayClosed && (
        <div className="glass neon-glow p-8 text-center">
          <p className="text-2xl font-bold gradient-text">Day Complete</p>
          <p className="text-zinc-400 mt-2">
            Today's average integrity: <span className="text-orange-400 font-bold">{todayAvg}%</span>
            {todayAvg > 80 ? ' — Disciplined day earned!' : ' — Need above 80% for a disciplined day.'}
          </p>
          <p className="text-sm text-zinc-600 mt-3">Come back tomorrow for a fresh start.</p>
        </div>
      )}

      {state.dayLocked && !state.dayClosed && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">
            Today's Goals ({state.protocols.length} remaining)
          </h2>
          {state.protocols.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.protocols.map(p => (
                <ProtocolCard key={p.id} protocol={p} onStart={() => setActive(p)} />
              ))}
            </div>
          ) : null}
          {state.todayIntegrities.length > 0 && (
            <p className="text-sm text-zinc-500 mt-3">
              Running average: {todayAvg}% — finish all goals to close the day
            </p>
          )}
        </div>
      )}

      {!canPlan && !state.dayClosed && !state.protocols.length && (
        <div className="glass p-8 text-center">
          <p className="text-zinc-400">No active goals. Plan your day on the Today page.</p>
          <button onClick={() => navigate('/protocols')} className="mt-4 px-5 py-2.5 btn-primary text-sm">
            Go to Today
          </button>
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