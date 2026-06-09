import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutDashboard, ListChecks, BarChart3, Sparkles, User, BookOpen, TrendingUp, TrendingDown, Minus, Gauge, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { levelProgress, todayAvgIntegrity } from '../lib/logic'

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/protocols', icon: ListChecks, label: 'Today' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/oracle', icon: Sparkles, label: 'Oracle' },
  { to: '/about', icon: BookOpen, label: 'About' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const MOMENTUM_ICON = { Rising: TrendingUp, Falling: TrendingDown, Stable: Minus }
const MOMENTUM_COLOR = { Rising: 'text-amber-400', Falling: 'text-rose-400', Stable: 'text-orange-300' }

export function Layout() {
  const { state, ready } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  if (!ready) {
    return (
      <div className="arise-bg min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm tracking-widest uppercase">Syncing your rise…</p>
      </div>
    )
  }
  const isHome = pathname === '/'
  const { pct, days, next } = levelProgress(state.user)
  const todayAvg = todayAvgIntegrity(state.todayIntegrities)
  const MomentumIcon = MOMENTUM_ICON[state.user.momentum]

  return (
    <div className="arise-bg flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-orange-500/10 bg-[#0d0906] p-5 flex flex-col">
        <h1 className="text-2xl font-extrabold gradient-text px-2">ARISE</h1>
        <p className="text-xs text-zinc-500 px-2 mb-6 tracking-widest uppercase">Behavioral OS</p>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                  : 'text-zinc-500 hover:text-orange-200 hover:bg-orange-500/5',
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut size={15} />
            Log Out
          </button>

        <div className="glass p-4">
          <p className="text-sm font-semibold text-zinc-200">
            {state.user.name.trim() || user?.username || 'Set your name'}
          </p>
          <p className="text-xs text-zinc-600 mt-0.5">{user?.email || `@${user?.username}`}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Level {state.user.level} · {state.user.disciplineState}</p>
          <div className="h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-zinc-600 mt-1">{days}/{next} days</p>
          {state.dayLocked && !state.dayClosed && (
            <p className="text-xs text-orange-400 mt-2 font-medium">
              Today avg: {todayAvg}% · {state.protocols.length} left
            </p>
          )}
          {state.dayClosed && (
            <p className="text-xs text-amber-400 mt-2 font-medium">Day complete — {todayAvg}% avg</p>
          )}
        </div>
        </div>
      </aside>

      <main className={clsx('flex-grow p-8', isHome ? 'max-w-none' : 'max-w-6xl')}>
        {!isHome && (
          <div className="flex justify-end mb-6">
            <div className="glass flex items-center gap-2 px-4 py-2">
              <Gauge size={14} className="text-zinc-500" />
              <MomentumIcon size={14} className={MOMENTUM_COLOR[state.user.momentum]} />
              <span className={clsx('text-sm font-semibold', MOMENTUM_COLOR[state.user.momentum])}>
                {state.user.momentum}
              </span>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}