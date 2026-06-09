import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { BookOpen, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LEVEL_DATA, WIKI_SECTIONS } from '../data/about'
import { avgIntegrity, levelProgress, todayAvgIntegrity } from '../lib/logic'

function WikiSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-zinc-100 border-b border-orange-500/20 pb-2 mb-4">{title}</h2>
      <div className="text-zinc-400 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass p-4">
      <p className="text-xs text-zinc-600 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-orange-300 mt-1">{value}</p>
    </div>
  )
}

export function About() {
  const { state } = useApp()
  const { hash } = useLocation()
  const { pct, days, next } = levelProgress(state.user)
  const todayAvg = todayAvgIntegrity(state.todayIntegrities)

  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hash])

  const currentLevel = LEVEL_DATA.find(l => l.level === state.user.level)

  return (
    <div className="flex gap-8 items-start">
      {/* Main wiki content */}
      <article className="flex-grow min-w-0 space-y-10">
        <header className="glass neon-glow p-8">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={28} className="text-orange-400" />
            <h1 className="text-4xl font-black gradient-text">ARISE Encyclopedia</h1>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            The complete reference for the ARISE Behavioral Operating System — how goals work,
            how integrity is measured, how levels progress, and what every part of the app does.
          </p>
          <p className="text-xs text-zinc-600 mt-4">Behavioral OS · Version 1.0 · Personal discipline engine</p>
        </header>

        <WikiSection id="overview" title="Overview">
          <p>
            <strong className="text-zinc-200">ARISE</strong> is a daily discipline system built around one idea:
            you plan your entire day once, execute each goal with a timer, and integrity measures how long
            you actually stayed in each task versus how long you planned.
          </p>
          <p>
            There are no difficulty ratings, no categories, and no mid-day edits. Every goal is equal.
            What matters is <em>presence</em> — the percentage of planned time you remained in the task.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-500">
            <li>Plan all goals → Lock the day → Start each goal → Timer auto-closes at duration</li>
            <li>Integrity history persists forever; daily goals reset every calendar day</li>
            <li>A <strong className="text-orange-400">Disciplined Day</strong> requires &gt;80% average integrity across all finished goals</li>
          </ul>
        </WikiSection>

        <WikiSection id="daily-flow" title="Daily Flow">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong className="text-zinc-200">Plan Your Day</strong> — On Dashboard or Today, add every goal
              for the day (name + duration). Use presets or +/- steppers. Pick the date on the calendar.
            </li>
            <li>
              <strong className="text-zinc-200">Lock Day</strong> — Once locked, goals cannot be added, edited,
              or removed until the day ends. This is intentional — commitment before execution.
            </li>
            <li>
              <strong className="text-zinc-200">Start a Goal</strong> — A countdown timer begins. Pause stops the
              clock. The progress ring fills as time passes.
            </li>
            <li>
              <strong className="text-zinc-200">Timer Ends</strong> — When duration reaches 0:00, the goal
              auto-closes at 100% integrity and is removed from today's list.
            </li>
            <li>
              <strong className="text-zinc-200">Finish Early</strong> — If you stop before time is up, integrity
              equals time spent ÷ planned time. The goal is still removed.
            </li>
            <li>
              <strong className="text-zinc-200">Day Closes</strong> — When all goals are finished, the day
              evaluates. Average integrity &gt;80% = Disciplined Day earned.
            </li>
            <li>
              <strong className="text-zinc-200">Fresh Start</strong> — At midnight (new calendar day), all goals
              clear. Only integrity data carries forward.
            </li>
          </ol>
        </WikiSection>

        <WikiSection id="integrity" title="Integrity">
          <div className="glass p-5 border-l-4 border-l-orange-500 font-mono text-orange-300 text-base">
            Integrity % = (Time Spent ÷ Planned Duration) × 100
          </div>
          <p className="mt-3">
            Example: a 100-minute goal where you stayed 1 minute = <strong className="text-orange-400">1% integrity</strong>.
            A full timer completion = <strong className="text-orange-400">100% integrity</strong>.
          </p>
          <p>
            Paused time does not count toward time spent. Only active seconds in the session matter.
            Integrity is recorded per session and stored permanently in your history.
          </p>
        </WikiSection>

        <WikiSection id="disciplined-day" title="Disciplined Day">
          <p>
            A day counts as <strong className="text-amber-400">Disciplined</strong> when the{' '}
            <em>average integrity of all goals finished that day</em> is greater than 80%.
          </p>
          <div className="glass p-4 mt-2">
            <p className="text-zinc-300 text-sm">
              Example: 3 goals finished at 90%, 85%, and 70% → average 81.7% → <span className="text-emerald-400">Disciplined Day ✓</span>
            </p>
            <p className="text-zinc-300 text-sm mt-2">
              Example: 2 goals at 100% and 50% → average 75% → <span className="text-rose-400">Not a disciplined day</span>
            </p>
          </div>
          <p>
            Disciplined days accumulate toward your <strong className="text-zinc-200">Level</strong>.
            The weekly chart on Dashboard shows which days qualified.
          </p>
        </WikiSection>

        <WikiSection id="levels" title="All Levels">
          <p className="mb-4">
            Twelve levels map to disciplined days earned. Each level is a stage of behavioral identity —
            from first awareness to full ascension at 365 disciplined days.
          </p>
          <div className="space-y-3">
            {LEVEL_DATA.map(l => {
              const isCurrent = l.level === state.user.level
              const isPast = l.level < state.user.level
              return (
                <div
                  key={l.level}
                  className={clsx(
                    'glass p-5 border-l-4 transition-all',
                    isCurrent ? 'border-l-orange-400 neon-glow' : isPast ? 'border-l-amber-600/50' : 'border-l-zinc-700',
                  )}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        'text-2xl font-black',
                        isCurrent ? 'gradient-text' : isPast ? 'text-amber-600/60' : 'text-zinc-600',
                      )}>
                        {l.level}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-100">
                          {l.name}
                          {isCurrent && <span className="ml-2 text-xs text-orange-400 font-normal">← You are here</span>}
                        </h3>
                        <p className="text-xs text-orange-400/70 italic">{l.tagline}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-600 bg-zinc-800/60 px-2.5 py-1 rounded-lg">
                      {l.daysRequired} disciplined days
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{l.description}</p>
                  <p className="text-xs text-zinc-600 mt-2">
                    <span className="text-zinc-500 font-medium">Focus:</span> {l.focus}
                  </p>
                </div>
              )
            })}
          </div>
        </WikiSection>

        <WikiSection id="momentum" title="Momentum">
          <p>Momentum reflects your recent integrity trend across the last 5 sessions:</p>
          <ul className="list-none space-y-2 mt-2">
            <li className="flex items-center gap-2"><span className="text-emerald-400">Rising</span> — recent average &gt; 85%</li>
            <li className="flex items-center gap-2"><span className="text-orange-300">Stable</span> — recent average 65–85%</li>
            <li className="flex items-center gap-2"><span className="text-rose-400">Falling</span> — recent average &lt; 65%</li>
          </ul>
        </WikiSection>

        <WikiSection id="pages" title="App Pages">
          <div className="grid gap-3">
            {[
              ['Home', 'Welcome screen with overview and Start Rising entry point.'],
              ['Dashboard', 'Stats, level progress, weekly chart, plan day or run active goals.'],
              ['Today', 'Same daily workflow — locked goals list and session launcher.'],
              ['Analytics', 'Integrity trend chart, session history table, today\'s running average.'],
              ['Oracle', 'Coaching insights based on your integrity patterns and day status.'],
              ['Profile', 'Display name, lifetime stats, reset all data.'],
              ['About', 'This encyclopedia — full system reference.'],
            ].map(([name, desc]) => (
              <div key={name} className="flex gap-2 items-start">
                <ChevronRight size={14} className="text-orange-500 mt-1 shrink-0" />
                <p><strong className="text-zinc-200">{name}</strong> — {desc}</p>
              </div>
            ))}
          </div>
        </WikiSection>

        <WikiSection id="glossary" title="Glossary">
          <dl className="space-y-3">
            {[
              ['Goal / Protocol', 'A single task for the day with a name and duration in minutes.'],
              ['Lock Day', 'Confirm all goals for the day. No changes until day ends.'],
              ['Integrity', 'Percentage of planned time you stayed in the task.'],
              ['Disciplined Day', 'Day where average integrity of all finished goals exceeds 80%.'],
              ['Session', 'One execution of a goal from Start to Finish.'],
              ['Day Closed', 'All goals for the day have been finished and evaluated.'],
              ['Momentum', 'Rising, Stable, or Falling — based on last 5 session integrities.'],
            ].map(([term, def]) => (
              <div key={term}>
                <dt className="text-zinc-200 font-medium">{term}</dt>
                <dd className="text-zinc-500 mt-0.5">{def}</dd>
              </div>
            ))}
          </dl>
        </WikiSection>

        <WikiSection id="your-stats" title="Your Standing">
          <p className="mb-4">Live snapshot of your account in the system:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Operator" value={state.user.name.trim() || 'Not set'} />
            <Stat label="Level" value={`${state.user.level} — ${state.user.disciplineState}`} />
            <Stat label="Disciplined Days" value={state.user.disciplinedDays} />
            <Stat label="Next Level" value={`${days} / ${next} days`} />
            <Stat label="Progress" value={`${pct}%`} />
            <Stat label="Momentum" value={state.user.momentum} />
            <Stat label="All-time Avg Integrity" value={`${avgIntegrity(state.integrityHistory)}%`} />
            <Stat label="Today's Avg" value={todayAvg ? `${todayAvg}%` : '—'} />
            <Stat label="Total Sessions" value={state.completedSessions} />
            <Stat label="Member Since" value={state.user.joined} />
            <Stat label="Day Status" value={
              state.dayClosed ? 'Closed' : state.dayLocked ? `${state.protocols.length} goals left` : 'Not planned'
            } />
            <Stat label="Disciplined Days Logged" value={state.dailyLog.length} />
          </div>
          {currentLevel && (
            <div className="glass p-5 mt-4 border border-orange-500/20">
              <p className="text-xs text-orange-400 uppercase tracking-wider mb-1">Current Stage</p>
              <p className="text-lg font-semibold text-zinc-200">{currentLevel.name}</p>
              <p className="text-sm text-zinc-500 mt-2">{currentLevel.description}</p>
            </div>
          )}
        </WikiSection>

        <WikiSection id="founder" title="Founder">
          <div className="glass neon-glow p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <img
                src="/founder.jpg"
                alt="Manvith, Founder of ARISE — Mysore Palace"
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover border-2 border-orange-500/40 shadow-lg shadow-orange-500/10"
              />
              <div className="text-center sm:text-left">
                <p className="text-xs text-orange-400 uppercase tracking-[0.2em] mb-2">Founder & Creator</p>
                <h3 className="text-4xl font-black gradient-text">Manvith</h3>
                <p className="text-sm text-zinc-500 mt-4 leading-relaxed max-w-md">
                  ARISE was designed and built by Manvith — a behavioral operating system that turns
                  daily commitment into measurable integrity. One locked day at a time, one level at a time,
                  until discipline becomes identity.
                </p>
                <p className="text-xs text-zinc-600 mt-4">ARISE Behavioral OS · Est. {state.user.joined.slice(0, 4)}</p>
              </div>
            </div>
          </div>
        </WikiSection>
      </article>

      {/* Wikipedia-style sidebar TOC */}
      <aside className="hidden xl:block w-56 shrink-0 sticky top-8">
        <nav className="glass p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Contents</p>
          <ul className="space-y-1">
            {WIKI_SECTIONS.map(s => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block text-sm text-zinc-500 hover:text-orange-400 py-1 transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="glass p-4 mt-4">
          <p className="text-xs text-zinc-600 mb-2">Quick Level Index</p>
          <div className="flex flex-wrap gap-1">
            {LEVEL_DATA.map(l => (
              <span
                key={l.level}
                title={l.name}
                className={clsx(
                  'text-xs px-1.5 py-0.5 rounded font-mono',
                  l.level === state.user.level
                    ? 'bg-orange-500/25 text-orange-300'
                    : l.level < state.user.level
                      ? 'text-amber-700/80'
                      : 'text-zinc-700',
                )}
              >
                {l.level}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}