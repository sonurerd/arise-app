import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Target, Timer, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function Home() {
  const { state, updateProfile } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState(state.user.name)
  const canStart = name.trim().length > 0

  const start = () => {
    if (!canStart) return
    updateProfile(name)
    navigate('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
      <p className="text-xs tracking-[0.35em] text-orange-400/80 font-semibold uppercase mb-6">
        Behavioral Operating System
      </p>

      <h1 className="text-7xl sm:text-8xl md:text-9xl font-black gradient-text leading-none tracking-tighter">
        ARISE
      </h1>

      <p className="text-lg sm:text-xl text-zinc-400 mt-8 max-w-md leading-relaxed">
        Plan your day once. Stay in every task. Let integrity measure who you become.
      </p>

      <p className="text-sm text-zinc-600 mt-3 max-w-sm">
        One locked day at a time — from Awakening to Ascension.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-zinc-500">
        <span className="flex items-center gap-2">
          <Target size={15} className="text-orange-500" />
          Set goals
        </span>
        <span className="flex items-center gap-2">
          <Timer size={15} className="text-orange-500" />
          Track presence
        </span>
        <span className="flex items-center gap-2">
          <TrendingUp size={15} className="text-orange-500" />
          Rise daily
        </span>
      </div>

      <div className="w-full max-w-sm mt-12">
        <label className="block text-left">
          <span className="text-xs text-zinc-500 mb-2 block uppercase tracking-wider">Your Name</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canStart && start()}
            placeholder="Enter your name to begin"
            className="input text-center text-lg"
            autoComplete="off"
            autoFocus={!state.user.name.trim()}
          />
        </label>
      </div>

      <button
        onClick={start}
        disabled={!canStart}
        className="mt-8 group flex items-center gap-3 px-10 py-4 text-lg font-bold btn-primary neon-glow disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40 disabled:transform-none"
      >
        Start Rising
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {!canStart && (
        <p className="text-xs text-zinc-600 mt-3">Enter your name to continue</p>
      )}
    </div>
  )
}