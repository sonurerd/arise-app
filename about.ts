import { LEVELS, LEVEL_REQUIREMENTS } from '../types'

export interface LevelInfo {
  level: number
  name: string
  daysRequired: number
  tagline: string
  description: string
  focus: string
}

export const LEVEL_DATA: LevelInfo[] = LEVELS.map((name, i) => {
  const entries: Omit<LevelInfo, 'level' | 'name' | 'daysRequired'>[] = [
    { tagline: 'The first spark', description: 'You have entered the system. Awareness replaces autopilot. Every session is a vote for who you are becoming.', focus: 'Show up. Complete one locked day.' },
    { tagline: 'Commitment takes form', description: 'Intent becomes routine. You no longer debate whether to start — you execute the plan you set.', focus: 'Lock your day every morning without hesitation.' },
    { tagline: 'Rhythm over motivation', description: 'Discipline stops depending on mood. Structure carries you when energy does not.', focus: 'Maintain above 80% daily average integrity.' },
    { tagline: 'Friction is expected', description: 'Resistance appears — boredom, fatigue, distraction. You stay in the task anyway.', focus: 'Finish sessions even when urge to quit is high.' },
    { tagline: 'Architecture of a day', description: 'Your day has a skeleton. Goals are set once, executed sequentially, closed cleanly.', focus: 'Plan all goals before locking. No mid-day edits.' },
    { tagline: 'Self-trust compounds', description: 'You do what you said you would. Integrity is no longer abstract — it is measured in minutes stayed.', focus: 'Let timers run full duration. Minimize early exits.' },
    { tagline: 'Velocity builds', description: 'Momentum replaces willpower. Each disciplined day makes the next easier to begin.', focus: 'Chain disciplined days. Watch momentum rise.' },
    { tagline: 'The long game', description: 'Short bursts matter less than repetition. You are building a year, not a highlight reel.', focus: 'Protect streaks. Do not break the daily lock ritual.' },
    { tagline: 'Command of attention', description: 'You direct focus deliberately. Distraction loses its grip because the system is stronger than impulse.', focus: 'High integrity across every goal in a single day.' },
    { tagline: 'Discipline as craft', description: 'Execution is refined. You know your numbers, your averages, your weak points — and you adjust.', focus: 'Study Analytics. Respond to Oracle insights.' },
    { tagline: 'Behavior becomes identity', description: 'You are not trying to be disciplined — you are someone who finishes what they start.', focus: 'Disciplined days are default, not exceptional.' },
    { tagline: 'Full ascent', description: 'A full year of proof. Discipline is woven into identity. The system runs through you.', focus: '365 disciplined days. Maintain the standard.' },
  ]
  return {
    level: i + 1,
    name,
    daysRequired: LEVEL_REQUIREMENTS[i],
    ...entries[i],
  }
})

export const WIKI_SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'daily-flow', title: 'Daily Flow' },
  { id: 'integrity', title: 'Integrity' },
  { id: 'disciplined-day', title: 'Disciplined Day' },
  { id: 'levels', title: 'All Levels' },
  { id: 'momentum', title: 'Momentum' },
  { id: 'pages', title: 'App Pages' },
  { id: 'glossary', title: 'Glossary' },
  { id: 'your-stats', title: 'Your Standing' },
  { id: 'founder', title: 'Founder' },
] as const