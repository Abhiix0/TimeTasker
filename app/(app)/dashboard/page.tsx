'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatsCards } from '@/components/stats-cards'
import { useAppContext } from '@/lib/app-context'
import { TrendingUp, Calendar, Timer, CheckCircle2, Circle } from 'lucide-react'

// Day label from ISO date string — parsed as local time to avoid UTC offset shifting the day
function dayLabel(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const { state, dispatch } = useAppContext()
  const { tasks, stats, timer, weeklyActivity, settings } = state

  const incompleteTasks = tasks.filter((t) => !t.completed)
  const goalPct = Math.min(100, Math.round((stats.sessionsToday / settings.dailyGoal) * 100))

  const maxSessions = weeklyActivity.length
    ? Math.max(...weeklyActivity.map((d) => d.sessionsCompleted), 1)
    : 1

  const totalWeeklyFocus = weeklyActivity.reduce((s, d) => s + d.focusMinutes, 0)
  const avgSessions = weeklyActivity.length
    ? Math.round(weeklyActivity.reduce((s, d) => s + d.sessionsCompleted, 0) / weeklyActivity.length)
    : 0

  const timerModeLabel = { work: 'Work Session', shortBreak: 'Short Break', longBreak: 'Long Break' }[timer.mode]
  const timerMins = Math.floor(timer.timeLeft / 60)
  const timerSecs = timer.timeLeft % 60
  const timerDisplay = `${timerMins.toString().padStart(2, '0')}:${timerSecs.toString().padStart(2, '0')}`

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Productivity Dashboard</h1>
          <p className="text-muted-foreground">Track your focus sessions, completed tasks, and productivity trends.</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Daily goal + Quick Timer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily goal progress */}
          <Card className="p-6 border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Goal
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {stats.sessionsToday} of {settings.dailyGoal} sessions completed
            </p>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{goalPct}% of daily goal</p>
          </Card>

          {/* Quick Timer card */}
          <Card className="p-6 border-border flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Timer — {timerModeLabel}</h3>
              {timer.isRunning && (
                <span className="ml-auto text-xs text-primary animate-pulse font-medium">● Running</span>
              )}
            </div>
            <p className="text-5xl font-mono font-bold text-center my-4">{timerDisplay}</p>
            <Button asChild className="rounded-full bg-gradient-to-r from-primary to-accent w-full">
              <Link href="/timer">{timer.isRunning ? 'View Timer' : 'Start Session'}</Link>
            </Button>
          </Card>
        </div>

        {/* Weekly activity chart + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 border-border">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              This Week's Activity
            </h2>
            {weeklyActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">
                No activity yet — complete a session to see data here.
              </p>
            ) : (
              <div className="space-y-4">
                {[...weeklyActivity].sort((a, b) => a.date.localeCompare(b.date)).slice(-7).map((day, idx) => {
                  const pct = Math.round((day.sessionsCompleted / maxSessions) * 100)
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dayLabel(day.date)}</span>
                        <span className="text-muted-foreground">{day.sessionsCompleted} sessions · {day.focusMinutes} min</span>
                      </div>
                      <div className="w-full h-7 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Summary stats */}
          <div className="space-y-4">
            <Card className="p-6 border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Sessions / Day</p>
              <p className="text-4xl font-bold">{avgSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">this week</p>
            </Card>
            <Card className="p-6 border-border">
              <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
              <p className="text-4xl font-bold">{stats.currentStreak} 🔥</p>
              <p className="text-xs text-muted-foreground mt-1">days in a row</p>
            </Card>
            <Card className="p-6 border-border">
              <p className="text-sm text-muted-foreground mb-1">Weekly Focus Time</p>
              <p className="text-4xl font-bold">{totalWeeklyFocus}</p>
              <p className="text-xs text-muted-foreground mt-1">minutes</p>
            </Card>
          </div>
        </div>

        {/* Today's Tasks */}
        <Card className="p-8 border-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Today's Tasks
            {incompleteTasks.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {incompleteTasks.length} remaining
              </span>
            )}
          </h2>

          {incompleteTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {tasks.length === 0 ? 'No tasks yet.' : 'All tasks complete — great work!'}
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/tasks">Manage Tasks</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {incompleteTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: { id: task.id } })}
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                    aria-label={`Complete "${task.title}"`}
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <span className="flex-1 text-sm">{task.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.priority === 'high'
                      ? 'bg-destructive/10 text-destructive'
                      : task.priority === 'medium'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {incompleteTasks.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{incompleteTasks.length - 5} more —{' '}
                  <Link href="/tasks" className="text-primary hover:underline">view all</Link>
                </p>
              )}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}
