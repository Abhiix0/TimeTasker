'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StreakCalendar } from '@/components/streak-calendar'
import { useAppContext } from '@/lib/app-context'

const MILESTONES = [
  { days: 3,  label: '3-Day Streak',  emoji: '🌱' },
  { days: 7,  label: '1-Week Streak', emoji: '⚡' },
  { days: 14, label: '2-Week Streak', emoji: '🔥' },
  { days: 30, label: '30-Day Streak', emoji: '🏆' },
]

export default function StreaksPage() {
  const { state } = useAppContext()
  const { stats, weeklyActivity } = state

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold mb-2">Streaks</h1>
          <p className="text-muted-foreground">Keep the momentum going.</p>
        </div>

        {/* Current & longest streak */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 text-center border-border">
            <p className="text-6xl font-bold">{stats.currentStreak} 🔥</p>
            <p className="text-sm text-muted-foreground mt-2">Current streak</p>
          </Card>
          <Card className="p-6 text-center border-border">
            <p className="text-6xl font-bold">{stats.longestStreak} 🏆</p>
            <p className="text-sm text-muted-foreground mt-2">Longest streak</p>
          </Card>
        </div>

        {/* Activity calendar */}
        <Card className="p-6 border-border overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Activity Calendar</h2>
          <StreakCalendar activity={weeklyActivity} />
        </Card>

        {/* Milestones */}
        <Card className="p-6 border-border">
          <h2 className="text-lg font-bold mb-4">Streak Milestones</h2>
          <div className="space-y-3">
            {MILESTONES.map((m) => {
              const achieved = stats.longestStreak >= m.days
              return (
                <div
                  key={m.days}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${achieved ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 opacity-50'}
                  `}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${achieved ? '' : 'text-muted-foreground'}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achieved ? 'Achieved' : `${m.days - stats.longestStreak} days to go`}
                    </p>
                  </div>
                  {achieved
                    ? <Badge variant="default">✓ Done</Badge>
                    : <Badge variant="outline">{m.days}d</Badge>
                  }
                </div>
              )
            })}
          </div>
        </Card>

      </div>
    </div>
  )
}
