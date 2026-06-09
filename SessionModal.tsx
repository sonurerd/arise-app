import { useState, useEffect, useRef, useCallback } from 'react'
import { Pause, Play, Check, X } from 'lucide-react'
import type { Protocol } from '../types'
import { calculateIntegrity } from '../lib/logic'
import { formatDuration } from './DurationPicker'

interface Props {
  protocol: Protocol | null
  onClose: () => void
  onComplete: (timeSpentMinutes: number) => void
}

export function SessionModal({ protocol, onClose, onComplete }: Props) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [autoFinished, setAutoFinished] = useState(false)
  const finishedRef = useRef(false)

  const totalSeconds = protocol ? protocol.duration * 60 : 0
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
  const progress = totalSeconds ? elapsedSeconds / totalSeconds : 0

  useEffect(() => {
    if (!protocol) return
    setElapsedSeconds(0)
    setPaused(false)
    setShowResult(false)
    setAutoFinished(false)
    finishedRef.current = false
  }, [protocol])

  useEffect(() => {
    if (!protocol || paused || showResult) return
    const id = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1
        if (next >= totalSeconds && !finishedRef.current) {
          finishedRef.current = true
          setAutoFinished(true)
          setShowResult(true)
          setTimeout(() => {
            onComplete(protocol.duration)
            onClose()
          }, 1200)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [protocol, paused, showResult, totalSeconds, onComplete, onClose])

  const togglePause = useCallback(() => setPaused(p => !p), [])

  const finishEarly = useCallback(() => {
    if (finishedRef.current) return
    setShowResult(true)
  }, [])

  const submit = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete(elapsedSeconds / 60)
    onClose()
  }

  if (!protocol) return null

  const timeSpentMin = autoFinished ? protocol.duration : elapsedSeconds / 60
  const integrity = calculateIntegrity(timeSpentMin, protocol.duration)
  const remainingM = Math.floor(remainingSeconds / 60)
  const remainingS = remainingSeconds % 60
  const countdown = `${String(remainingM).padStart(2, '0')}:${String(remainingS).padStart(2, '0')}`
  const circumference = 2 * Math.PI * 115
  const strokeOffset = circumference * (1 - Math.min(1, progress))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0705]/95">
      {!showResult && (
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-orange-400">
          <X size={24} />
        </button>
      )}

      {!showResult ? (
        <div className="flex flex-col items-center gap-8 max-w-lg w-full px-8">
          <p className="text-xs tracking-[0.3em] text-orange-400 font-semibold">IN SESSION</p>
          <h2 className="text-4xl font-bold text-zinc-100 text-center">{protocol.name}</h2>

          <div className="relative flex items-center justify-center">
            <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="120" cy="120" r="115" fill="none" stroke="rgba(255,107,0,0.12)" strokeWidth="6" />
              <circle
                cx="120" cy="120" r="115" fill="none" stroke="#ff6b00" strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-6xl font-mono font-light text-orange-300">{countdown}</span>
              <p className="text-xs text-zinc-600 mt-1">remaining</p>
            </div>
          </div>

          <p className="text-sm text-zinc-500">Goal: {formatDuration(protocol.duration)}</p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-10 py-3 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              {paused ? <Play size={18} /> : <Pause size={18} />}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={finishEarly} className="flex items-center gap-2 px-10 py-3 rounded-xl btn-primary">
              <Check size={18} />
              Finish Early
            </button>
          </div>
        </div>
      ) : (
        <div className="glass neon-glow p-8 w-full max-w-md text-center">
          <h3 className="text-xl font-semibold text-zinc-200">
            {autoFinished ? "Time's Up!" : 'Session Complete'}
          </h3>
          <p className="text-orange-400 text-4xl font-bold my-3">{integrity}%</p>
          <p className="text-sm text-zinc-500">
            You spent {Math.round(timeSpentMin * 10) / 10} of {protocol.duration} min in this task.
          </p>
          {autoFinished ? (
            <p className="text-xs text-zinc-600 mt-4">Closing automatically…</p>
          ) : (
            <button onClick={submit} className="w-full mt-6 py-3 btn-primary">
              Done — Remove from Today
            </button>
          )}
        </div>
      )}
    </div>
  )
}