export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function defaultState(displayName = '') {
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