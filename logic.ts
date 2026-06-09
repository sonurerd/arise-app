import type { AppState, Insight, Momentum, User } from '../types'
import { LEVEL_REQUIREMENTS, LEVELS } from '../types'

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function defaultState(displayName = ''): AppState {
  return {
    user: {
      name: displayName,
      level: 1,
      disciplinedDays: 0,
      momentum: 'Stable',
      disciplineState: 'Awakening',
      joined: todayKey(),
    },
    protocols: [],
    currentDay: todayKey(),
    dayLocked: false,
    dayClosed: false,
    todayIntegrities: [],
    integrityHistory: [],
    sessionLog: [],
    completedSessions: 0,
    dailyLog: [],
  }
}

export function calculateLevel(user: User): User {
  let level = 1
  let disciplineState: string = LEVELS[0]
  for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (user.disciplinedDays >= LEVEL_REQUIREMENTS[i]) {
      level = i + 1
      disciplineState = LEVELS[i]
      break
    }
  }
  return { ...user, level, disciplineState }
}

export function calculateMomentum(history: number[]): Momentum {
  if (history.length < 5) return 'Stable'
  const recent = history.slice(-5)
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length
  if (avg > 85) return 'Rising'
  if (avg < 65) return 'Falling'
  return 'Stable'
}

/** Integrity = percentage of planned time actually spent in the task */
export function calculateIntegrity(timeSpentMinutes: number, plannedMinutes: number): number {
  if (plannedMinutes <= 0) return 0
  return Math.min(100, Math.round((timeSpentMinutes / plannedMinutes) * 100))
}

export function avgIntegrity(history: number[]): number {
  if (!history.length) return 0
  return Math.round(history.reduce((a, b) => a + b, 0) / history.length)
}

export function todayAvgIntegrity(todayIntegrities: number[]): number {
  return avgIntegrity(todayIntegrities)
}

export function levelProgress(user: User): { pct: number; days: number; next: number } {
  if (user.level >= 12) return { pct: 100, days: user.disciplinedDays, next: LEVEL_REQUIREMENTS[11] }
  const next = LEVEL_REQUIREMENTS[user.level]
  const pct = next ? Math.min(100, Math.round((user.disciplinedDays / next) * 100)) : 100
  return { pct, days: user.disciplinedDays, next }
}

export function weeklyActivity(dailyLog: string[]): number[] {
  const counts: number[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    counts.push(dailyLog.includes(d.toISOString().slice(0, 10)) ? 1 : 0)
  }
  return counts
}

export function evaluateDisciplinedDay(integrities: number[]): boolean {
  if (!integrities.length) return false
  return avgIntegrity(integrities) > 80
}

function applyDisciplinedDay(state: AppState, day: string): AppState {
  if (!evaluateDisciplinedDay(state.todayIntegrities)) return state
  if (state.dailyLog.includes(day)) return state
  const user = calculateLevel({
    ...state.user,
    disciplinedDays: state.user.disciplinedDays + 1,
  })
  return {
    ...state,
    user: { ...user, momentum: calculateMomentum(state.integrityHistory) },
    dailyLog: [...state.dailyLog, day],
  }
}

export function maybeRolloverDay(state: AppState): AppState {
  const today = todayKey()
  if (state.currentDay === today) return state

  let next = { ...state }
  if (next.todayIntegrities.length > 0) {
    next = applyDisciplinedDay(next, next.currentDay)
  }

  return {
    ...next,
    currentDay: today,
    protocols: [],
    todayIntegrities: [],
    dayLocked: false,
    dayClosed: false,
    user: { ...next.user, momentum: calculateMomentum(next.integrityHistory) },
  }
}

export function lockDay(state: AppState, date: string, protocols: AppState['protocols']): AppState {
  return {
    ...state,
    currentDay: date,
    protocols,
    dayLocked: true,
    dayClosed: false,
    todayIntegrities: [],
  }
}

export function finishSession(
  state: AppState,
  protocolId: string,
  timeSpentMinutes: number,
): AppState {
  const protocol = state.protocols.find(p => p.id === protocolId)
  if (!protocol) return state

  const integrity = calculateIntegrity(timeSpentMinutes, protocol.duration)
  const protocols = state.protocols.filter(p => p.id !== protocolId)
  const todayIntegrities = [...state.todayIntegrities, integrity]
  const integrityHistory = [...state.integrityHistory, integrity].slice(-120)
  const sessionLog = [
    {
      name: protocol.name,
      date: state.currentDay,
      integrity,
      timeSpentMinutes: Math.round(timeSpentMinutes * 10) / 10,
      plannedMinutes: protocol.duration,
    },
    ...state.sessionLog,
  ].slice(0, 100)

  let next: AppState = {
    ...state,
    protocols,
    todayIntegrities,
    integrityHistory,
    sessionLog,
    completedSessions: state.completedSessions + 1,
    user: { ...state.user, momentum: calculateMomentum(integrityHistory) },
  }

  if (protocols.length === 0) {
    next = applyDisciplinedDay(next, state.currentDay)
    next = { ...next, dayClosed: true }
  }

  return next
}

export function coachInsights(state: AppState): Insight[] {
  const insights: Insight[] = []
  const avgInt = avgIntegrity(state.integrityHistory)
  const todayAvg = todayAvgIntegrity(state.todayIntegrities)

  if (!state.dayLocked && !state.dayClosed) {
    return [{
      icon: 'rocket',
      title: 'Plan Your Day',
      body: 'Add all your daily goals at once with name and duration. Once locked, they cannot be changed until the day ends.',
    }]
  }

  if (state.dayClosed) {
    const passed = todayAvg > 80
    insights.push({
      icon: passed ? 'trophy' : 'target',
      title: passed ? 'Disciplined Day' : 'Day Complete',
      body: passed
        ? `Today's average integrity was ${todayAvg}% — above the 80% threshold. Come back tomorrow for a fresh start.`
        : `Today's average integrity was ${todayAvg}%. You need above 80% for a disciplined day. Reset tomorrow.`,
    })
    return insights
  }

  if (todayAvg > 0 && todayAvg < 80) {
    insights.push({
      icon: 'clock',
      title: 'Push Through',
      body: `Today's running average is ${todayAvg}%. Stay in each task longer — you need above 80% average to earn the day.`,
    })
  }

  if (avgInt < 70 && state.integrityHistory.length >= 3) {
    insights.push({
      icon: 'trending-down',
      title: 'Build Presence',
      body: 'Your overall integrity is low. Integrity equals time spent divided by planned time — stay in the task.',
    })
  }

  if (state.user.momentum === 'Falling') {
    insights.push({
      icon: 'sparkles',
      title: 'Recover Momentum',
      body: 'Recent sessions are slipping. Finish each remaining goal with maximum time-in-task.',
    })
  }

  if (!insights.length) {
    insights.push({
      icon: 'trophy',
      title: 'Stay Present',
      body: `${state.protocols.length} goal(s) left today. Integrity is simply the % of planned time you actually spent.`,
    })
  }

  return insights
}

export function greeting(name: string): string {
  const who = name.trim()
  const hour = new Date().getHours()
  if (!who) {
    if (hour < 12) return 'Good morning. Set your name in Profile, then plan your day.'
    if (hour < 17) return 'Good afternoon. Set your name in Profile, then stay in the task.'
    return 'Good evening. Set your name in Profile, then finish strong.'
  }
  if (hour < 12) return `Good morning, ${who}. Plan your day and execute.`
  if (hour < 17) return `Good afternoon, ${who}. Stay in the task.`
  return `Good evening, ${who}. Finish strong.`
}