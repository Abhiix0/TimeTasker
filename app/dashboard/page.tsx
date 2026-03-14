'use client'

import { StatsCards } from '@/components/stats-cards'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar } from 'lucide-react'

interface DailyStats {
  date: string
  sessions: number
  focusTime: number
}

export default function DashboardPage() {
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Generate weekly stats (simulated data)
    const today = new Date()
    const stats: DailyStats[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulated data
      const sessions = Math.floor(Math.random() * 8) + 1
      const focusTime = sessions * 25 + Math.floor(Math.random() * 30)
      
      stats.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions,
        focusTime
      })
    }
    
    setWeeklyStats(stats)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-96 bg-card rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const maxSessions = Math.max(...weeklyStats.map(s => s.sessions))
  const totalSessions = weeklyStats.reduce((sum, s) => sum + s.sessions, 0)
  const avgSessions = Math.round(totalSessions / 7)

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Productivity Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Track your focus sessions, completed tasks, and productivity trends.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-12">
          <StatsCards />
        </div>

        {/* Weekly Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Bar Chart */}
          <Card className="lg:col-span-2 p-8 border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                This Week's Activity
              </h2>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-4">
              {weeklyStats.map((day, idx) => {
                const percentage = (day.sessions / maxSessions) * 100
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-muted-foreground">{day.sessions} sessions</span>
                    </div>
                    <div className="w-full h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="space-y-4">
            <Card className="p-6 border-border">
              <p className="text-sm text-muted-foreground mb-2">Average Sessions</p>
              <p className="text-4xl font-bold">{avgSessions}</p>
              <p className="text-xs text-muted-foreground mt-2">per day this week</p>
            </Card>

            <Card className="p-6 border-border">
              <p className="text-sm text-muted-foreground mb-2">Peak Day</p>
              <p className="text-4xl font-bold">{Math.max(...weeklyStats.map(s => s.sessions))}</p>
              <p className="text-xs text-muted-foreground mt-2">sessions in a single day</p>
            </Card>

            <Card className="p-6 border-border">
              <p className="text-sm text-muted-foreground mb-2">Total Focus Time</p>
              <p className="text-4xl font-bold">{weeklyStats.reduce((sum, s) => sum + s.focusTime, 0)}</p>
              <p className="text-xs text-muted-foreground mt-2">minutes this week</p>
            </Card>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Goal
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete at least 6 focus sessions for maximum productivity.
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 of 6 sessions completed</p>
          </Card>

          <Card className="p-6 border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Productivity Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Start your day with your most challenging task</li>
              <li>• Take breaks away from your desk</li>
              <li>• Keep phone on silent during sessions</li>
            </ul>
          </Card>
        </div>

        {/* CTA */}
        <Card className="p-8 border-border bg-gradient-to-br from-primary/10 to-accent/10 text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to Start a Session?</h3>
          <p className="text-muted-foreground mb-6">
            Begin your next Pomodoro session to keep your momentum going.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-lg">
              <Link href="/timer">Start Timer</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/tasks">View Tasks</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
