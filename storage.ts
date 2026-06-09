import type { AppState } from '../types'
import { defaultState, maybeRolloverDay } from './logic'

const KEY = 'arise_data'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    const user = { ...defaultState().user, ...parsed.user }
    if (user.name === 'Aether') user.name = ''
    const merged: AppState = { ...defaultState(), ...parsed, user }
    return maybeRolloverDay(merged)
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetState(): AppState {
  localStorage.removeItem(KEY)
  return defaultState()
}