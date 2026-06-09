import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AppState, GoalDraft, Protocol } from '../types'
import { finishSession, lockDay, todayKey } from '../lib/logic'
import { defaultState, maybeRolloverDay } from '../lib/logic'
import { fetchState, saveState } from '../lib/api'
import { useAuth } from './AuthContext'

interface AppContextValue {
  state: AppState
  ready: boolean
  lockDailyGoals: (date: string, goals: GoalDraft[]) => void
  finishProtocol: (protocolId: string, timeSpentMinutes: number) => void
  updateProfile: (name: string) => void
  reset: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setStateRaw] = useState<AppState>(defaultState)
  const [ready, setReady] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipSave = useRef(true)

  useEffect(() => {
    if (!user) {
      setStateRaw(defaultState())
      setReady(false)
      skipSave.current = true
      return
    }

    let cancelled = false
    setReady(false)
    skipSave.current = true

    fetchState()
      .then(({ state: remote }) => {
        if (cancelled) return
        const merged = maybeRolloverDay({ ...defaultState(), ...remote, user: { ...defaultState().user, ...remote.user } })
        if (!merged.user.name.trim() && user.displayName) {
          merged.user.name = user.displayName
        }
        setStateRaw(merged)
        setReady(true)
        skipSave.current = false
      })
      .catch(() => {
        if (cancelled) return
        const initial = defaultState(user.displayName)
        setStateRaw(initial)
        setReady(true)
        skipSave.current = false
      })

    return () => { cancelled = true }
  }, [user?.id])

  useEffect(() => {
    if (!user || !ready || skipSave.current) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveState(state).catch(console.error)
    }, 400)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, user?.id, ready])

  const lockDailyGoals = useCallback((date: string, goals: GoalDraft[]) => {
    const protocols: Protocol[] = goals.map(g => ({
      id: crypto.randomUUID().slice(0, 8),
      name: g.name.trim(),
      duration: g.duration,
    }))
    setStateRaw(prev => lockDay(prev, date, protocols))
  }, [])

  const finishProtocol = useCallback((protocolId: string, timeSpentMinutes: number) => {
    setStateRaw(prev => finishSession(prev, protocolId, timeSpentMinutes))
  }, [])

  const updateProfile = useCallback((name: string) => {
    setStateRaw(prev => ({ ...prev, user: { ...prev.user, name: name.trim() } }))
  }, [])

  const reset = useCallback(() => {
    const fresh = defaultState(user?.displayName || '')
    setStateRaw(fresh)
  }, [user?.displayName])

  return (
    <AppContext.Provider value={{ state, ready, lockDailyGoals, finishProtocol, updateProfile, reset }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { todayKey }