export type Momentum = 'Rising' | 'Falling' | 'Stable'

export interface User {
  name: string
  level: number
  disciplinedDays: number
  momentum: Momentum
  disciplineState: string
  joined: string
}

export interface Protocol {
  id: string
  name: string
  duration: number
}

export interface SessionLog {
  name: string
  date: string
  integrity: number
  timeSpentMinutes: number
  plannedMinutes: number
}

export interface AppState {
  user: User
  protocols: Protocol[]
  currentDay: string
  dayLocked: boolean
  dayClosed: boolean
  todayIntegrities: number[]
  integrityHistory: number[]
  sessionLog: SessionLog[]
  completedSessions: number
  dailyLog: string[]
}

export interface Insight {
  icon: string
  title: string
  body: string
}

export interface GoalDraft {
  name: string
  duration: number
}

export const LEVELS = [
  'Awakening', 'Initiation', 'Stabilization', 'Resistance', 'Structure',
  'Discipline', 'Momentum', 'Consistency', 'Control', 'Mastery', 'Identity', 'Ascension',
] as const

export const LEVEL_REQUIREMENTS = [0, 14, 28, 45, 65, 90, 120, 160, 210, 270, 320, 365]