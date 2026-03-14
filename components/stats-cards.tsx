'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Clock, CheckCircle2, Zap } from 'lucide-react'

interface Stats {
  sessionsToday: number
  totalFocusTime: number
  tasksCompleted: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    sessionsToday: 0,
    totalFocusTime: 0,
    tasksCompleted: 0
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load stats from localStorage
    const today = new Date().toDateString()
    const savedStatsDate = localStorage.getItem('statsDate')
    
    if (savedStatsDate === today) {
      const saved = localStorage.getItem('stats')
      if (saved) {
        try {
          setStats(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to load stats:', e)
        }
      }
    } else {
      // Reset stats for new day
      localStorage.setItem('statsDate', today)
      localStorage.setItem('stats', JSON.stringify({
        sessionsToday: 0,
        totalFocusTime: 0,
        tasksCompleted: 0
      }))
    }

    // Load tasks and count completed
    const tasks = localStorage.getItem('tasks')
    if (tasks) {
      try {
        const taskList = JSON.parse(tasks)
        const completed = taskList.filter((t: any) => t.completed).length
        setStats(prev => ({
          ...prev,
          tasksCompleted: completed
        }))
      } catch (e) {
        console.error('Failed to load tasks:', e)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const focusTimeHours = Math.floor(stats.totalFocusTime / 60)
  const focusTimeMinutes = stats.totalFocusTime % 60

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Focus Sessions */}
      <Card className="p-6 border-border hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Focus Sessions Today</p>
            <p className="text-4xl font-bold text-gradient">{stats.sessionsToday}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Zap className="w-6 h-6 text-primary" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Keep up the momentum!</p>
      </Card>

      {/* Focus Time */}
      <Card className="p-6 border-border hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Focus Time</p>
            <p className="text-4xl font-bold">
              {focusTimeHours}
              <span className="text-lg ml-1">h</span>
              <span className="text-lg ml-2">{focusTimeMinutes}</span>
              <span className="text-lg ml-1">m</span>
            </p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg">
            <Clock className="w-6 h-6 text-accent" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">You're crushing your goals!</p>
      </Card>

      {/* Tasks Completed */}
      <Card className="p-6 border-border hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tasks Completed</p>
            <p className="text-4xl font-bold text-primary">{stats.tasksCompleted}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Great progress today!</p>
      </Card>
    </div>
  )
}
