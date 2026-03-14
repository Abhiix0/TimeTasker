'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'

type SessionMode = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroTimerProps {
  onSessionComplete?: (mode: SessionMode, sessionsCompleted: number) => void
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<SessionMode>('work')
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const modes = {
    work: { label: 'Work Session', duration: 25 * 60, color: 'from-primary to-accent' },
    shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'from-accent to-primary' },
    longBreak: { label: 'Long Break', duration: 15 * 60, color: 'from-secondary to-primary' }
  }

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      // Session complete
      setIsRunning(false)
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = () => {
    // Play notification sound
    playNotificationSound()

    if (mode === 'work') {
      setSessionsCompleted(prev => prev + 1)
      // Auto switch to break
      const isLongBreak = (sessionsCompleted + 1) % 4 === 0
      setMode(isLongBreak ? 'longBreak' : 'shortBreak')
      setTimeLeft(isLongBreak ? 15 * 60 : 5 * 60)
    } else {
      // Break finished, switch back to work
      setMode('work')
      setTimeLeft(25 * 60)
    }

    onSessionComplete?.(mode, sessionsCompleted)
  }

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modes[mode].duration)
  }

  const switchMode = (newMode: SessionMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(modes[newMode].duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = 1 - timeLeft / modes[mode].duration

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-8 justify-center flex-wrap">
        {(['work', 'shortBreak', 'longBreak'] as SessionMode[]).map(m => (
          <Button
            key={m}
            variant={mode === m ? 'default' : 'outline'}
            onClick={() => switchMode(m)}
            disabled={isRunning}
            className="rounded-full"
          >
            {modes[m].label}
          </Button>
        ))}
      </div>

      {/* Timer Display */}
      <Card className="p-8 md:p-12 text-center border-2 border-primary/20 bg-card">
        <div className="mb-6">
          <h2 className="text-lg md:text-2xl text-muted-foreground mb-2">{modes[mode].label}</h2>
          <div className={`text-7xl md:text-8xl font-bold bg-gradient-to-r ${modes[mode].color} bg-clip-text text-transparent font-mono`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray={`${progress * 2 * Math.PI * 45} ${2 * Math.PI * 45}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Sessions Counter */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-2">Sessions Completed</p>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < sessionsCompleted % 4
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={toggleTimer}
            className={`rounded-full gap-2 ${
              isRunning
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
            className="rounded-full gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Work Duration</p>
          <p className="text-lg font-semibold">25 min</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-lg font-semibold">{sessionsCompleted}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Break Interval</p>
          <p className="text-lg font-semibold">Every 4 sessions</p>
        </div>
      </div>
    </div>
  )
}
