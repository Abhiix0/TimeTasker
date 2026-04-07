'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { useAppContext } from '@/lib/app-context'
import type { TimerMode } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mode config
// ---------------------------------------------------------------------------

const MODE_CONFIG: Record<TimerMode, { label: string; gradient: string; ringColor: string }> = {
  work:       { label: 'Work Session', gradient: 'from-primary to-accent',     ringColor: 'var(--primary)' },
  shortBreak: { label: 'Short Break',  gradient: 'from-teal-400 to-cyan-500',  ringColor: '#2dd4bf' },
  longBreak:  { label: 'Long Break',   gradient: 'from-green-400 to-emerald-500', ringColor: '#4ade80' },
}

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------

let _audioCtx: AudioContext | null = null
function getAudioCtx(): AudioContext {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return _audioCtx
}

function playNotificationSound() {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // Audio not available — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PomodoroTimer() {
  const { state, dispatch } = useAppContext()
  const { timer, settings } = state
  const { mode, isRunning, timeLeft, totalTime, sessionsCompleted } = timer

  const cfg = MODE_CONFIG[mode]

  const sessionFiredRef = useRef(false)

  // Single interval effect — ticks every second when running
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, dispatch])

  // Reset the guard whenever mode changes (i.e. after each session completes)
  useEffect(() => {
    sessionFiredRef.current = false
  }, [mode])

  // Keyboard shortcuts: Space = toggle, R = reset
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        dispatch({ type: isRunning ? 'PAUSE_TIMER' : 'START_TIMER' })
      } else if (e.code === 'KeyR') {
        dispatch({ type: 'RESET_TIMER' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isRunning, dispatch])

  // Session complete detection
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      if (sessionFiredRef.current) return
      sessionFiredRef.current = true
      if (settings.soundEnabled) playNotificationSound()
      dispatch({ type: 'COMPLETE_SESSION' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference * (1 - progress)

  // Session dots — position within current cycle of 4
  const dotsCompleted = sessionsCompleted % 4

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode indicator badge */}
      <div className="flex justify-center mb-6">
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-medium bg-linear-to-r ${cfg.gradient} text-white flex items-center gap-2`}
        >
          {cfg.label}
          {isRunning && sessionsCompleted > 0 && (
            <span className="text-xs opacity-80 animate-pulse">● Auto-running</span>
          )}
        </span>
      </div>

      <Card className="p-8 md:p-12 text-center border-2 border-primary/20 bg-card">
        {/* Time display */}
        <div className="mb-4">
          <div
            className={`text-7xl md:text-8xl font-bold bg-linear-to-r ${cfg.gradient} bg-clip-text text-transparent font-mono`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* SVG progress ring */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={cfg.ringColor} />
                <stop offset="100%" stopColor={cfg.ringColor} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
              strokeWidth="3" className="text-border" />
            {/* Progress */}
            <circle cx="50" cy="50" r="45" fill="none"
              stroke="url(#timerGradient)" strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Center content inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              {isRunning ? 'Focusing' : 'Paused'}
            </p>
            <p className="text-sm font-semibold text-foreground">
              Session {sessionsCompleted + 1}
            </p>
          </div>
        </div>

        {/* Session dots — 4 dots showing progress toward long break */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
            Progress to long break
          </p>
          <div className="flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < dotsCompleted
                    ? 'bg-primary scale-110'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => dispatch({ type: isRunning ? 'PAUSE_TIMER' : 'START_TIMER' })}
            className={`rounded-full gap-2 min-w-32 ${
              isRunning
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-linear-to-r from-primary to-accent hover:shadow-lg'
            }`}
          >
            {isRunning ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start</>}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => dispatch({ type: 'RESET_TIMER' })}
            className="rounded-full gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              if (settings.soundEnabled) playNotificationSound()
              dispatch({ type: 'SKIP_SESSION' })
            }}
            className="rounded-full gap-2"
          >
            <SkipForward className="w-5 h-5" />
            Skip
          </Button>
        </div>
      </Card>

      {/* Info strip */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Work Duration</p>
          <p className="text-lg font-semibold">{settings.focusDuration} min</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-lg font-semibold">{sessionsCompleted}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Today's Focus</p>
          <p className="text-lg font-semibold">{timer.todayFocusMinutes} min</p>
        </div>
      </div>
    </div>
  )
}

