import { Shield, Award, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { StatCard } from '../components/StatCard'
import { avgIntegrity, todayAvgIntegrity } from '../lib/logic'

export function Analytics() {
  const { state } = useApp()

  const chartData = state.integrityHistory.map((v, i) => ({
    session: i + 1,
    integrity: v,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Integrity = time spent ÷ planned time</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Sessions" value={String(state.completedSessions)} icon={Activity} />
        <StatCard label="All-time Avg" value={`${avgIntegrity(state.integrityHistory)}%`} icon={Shield} color="text-orange-400" />
        <StatCard label="Disciplined Days" value={String(state.user.disciplinedDays)} icon={Award} color="text-amber-400" />
      </div>

      <div className="glass p-5">
        <p className="text-sm text-zinc-500 mb-4">Integrity Trend (all sessions)</p>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="orange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ff6b00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="session" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a120c', border: '1px solid rgba(255,107,0,0.25)', borderRadius: 12, color: '#fafafa' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Area type="monotone" dataKey="integrity" stroke="#ff6b00" strokeWidth={2} fill="url(#orange)" dot={{ fill: '#ffb800', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-zinc-600 text-center py-16">Complete sessions to see your trend.</p>
        )}
      </div>

      {state.sessionLog.length > 0 && (
        <div className="glass p-5">
          <p className="text-sm text-zinc-500 mb-4">Session History</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-left border-b border-zinc-800">
                  <th className="pb-3 font-medium">Goal</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-center">Integrity</th>
                  <th className="pb-3 font-medium text-center">Time Spent</th>
                  <th className="pb-3 font-medium text-center">Planned</th>
                </tr>
              </thead>
              <tbody>
                {state.sessionLog.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 text-zinc-300">
                    <td className="py-3">{r.name}</td>
                    <td className="py-3 text-zinc-500">{r.date}</td>
                    <td className="py-3 text-center text-orange-400">{r.integrity}%</td>
                    <td className="py-3 text-center">{r.timeSpentMinutes} min</td>
                    <td className="py-3 text-center">{r.plannedMinutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state.todayIntegrities.length > 0 && (
        <div className="glass p-5">
          <p className="text-sm text-zinc-500">Today's running average</p>
          <p className="text-4xl font-bold text-orange-400 mt-1">{todayAvgIntegrity(state.todayIntegrities)}%</p>
          <p className="text-xs text-zinc-600 mt-1">Need &gt;80% when all goals are finished for a disciplined day</p>
        </div>
      )}
    </div>
  )
}