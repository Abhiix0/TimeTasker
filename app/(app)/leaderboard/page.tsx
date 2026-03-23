'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreakCalendar } from '@/components/streak-calendar'
import { useAppContext } from '@/lib/app-context'

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace mock data with Firebase query when backend is ready
// ---------------------------------------------------------------------------

interface LeaderboardUser {
  id: number
  name: string
  initials: string
  focusTime: number   // minutes
  tasksCompleted: number
  sessions: number
  streak: number
  isYou?: boolean
}

const MOCK_USERS: LeaderboardUser[] = [
  { id: 1, name: 'Alex Chen',      initials: 'AC', focusTime: 1240, tasksCompleted: 48, sessions: 52, streak: 14 },
  { id: 2, name: 'Maria Santos',   initials: 'MS', focusTime: 1100, tasksCompleted: 41, sessions: 44, streak: 9  },
  { id: 3, name: 'You',            initials: 'ME', focusTime: 975,  tasksCompleted: 36, sessions: 39, streak: 7,  isYou: true },
  { id: 4, name: 'James Park',     initials: 'JP', focusTime: 860,  tasksCompleted: 31, sessions: 34, streak: 5  },
  { id: 5, name: 'Priya Nair',     initials: 'PN', focusTime: 720,  tasksCompleted: 27, sessions: 29, streak: 4  },
  { id: 6, name: 'Lucas Müller',   initials: 'LM', focusTime: 640,  tasksCompleted: 22, sessions: 26, streak: 3  },
  { id: 7, name: 'Sara Johansson', initials: 'SJ', focusTime: 510,  tasksCompleted: 18, sessions: 21, streak: 2  },
  { id: 8, name: 'Omar Hassan',    initials: 'OH', focusTime: 380,  tasksCompleted: 12, sessions: 15, streak: 1  },
]

type Tab = 'focusTime' | 'tasksCompleted' | 'sessions'

const TABS: { key: Tab; label: string }[] = [
  { key: 'focusTime',      label: 'Focus Time'       },
  { key: 'tasksCompleted', label: 'Tasks Completed'  },
  { key: 'sessions',       label: 'Sessions'         },
]

const MEDALS = ['🥇', '🥈', '🥉']

const MILESTONES = [
  { days: 3,  label: '3-Day Streak',  emoji: '🌱' },
  { days: 7,  label: '1-Week Streak', emoji: '⚡' },
  { days: 14, label: '2-Week Streak', emoji: '🔥' },
  { days: 30, label: '30-Day Streak', emoji: '🏆' },
]

function formatFocusTime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('focusTime')
  const { state } = useAppContext()
  const { stats, weeklyActivity } = state

  const sorted = [...MOCK_USERS].sort((a, b) => b[activeTab] - a[activeTab])

  const statLabel = (user: LeaderboardUser) => {
    if (activeTab === 'focusTime')      return formatFocusTime(user.focusTime)
    if (activeTab === 'tasksCompleted') return `${user.tasksCompleted} tasks`
    return `${user.sessions} sessions`
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against other focused workers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ----------------------------------------------------------------
              LEFT — Leaderboard table (3/5 width on desktop)
          ---------------------------------------------------------------- */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map((t) => (
                <Button
                  key={t.key}
                  size="sm"
                  variant={activeTab === t.key ? 'default' : 'outline'}
                  onClick={() => setActiveTab(t.key)}
                  className="rounded-full"
                >
                  {t.label}
                </Button>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {sorted.map((user, idx) => {
                const rank = idx + 1
                const isFirst = rank === 1
                return (
                  <Card
                    key={user.id}
                    className={`p-4 border flex items-center gap-4 transition-shadow
                      ${user.isYou ? 'border-primary/60 bg-primary/5' : 'border-border'}
                      ${isFirst ? 'shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_0_16px_hsl(var(--primary)/0.15)]' : ''}
                    `}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {rank <= 3
                        ? <span className="text-xl">{MEDALS[rank - 1]}</span>
                        : <span className="text-sm font-bold text-muted-foreground">{rank}</span>
                      }
                    </div>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                      ${user.isYou
                        ? 'bg-gradient-to-br from-primary to-accent text-white'
                        : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {user.initials}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${user.isYou ? 'text-primary' : ''}`}>
                        {user.name}
                        {user.isYou && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                      </p>
                    </div>

                    {/* Streak badge */}
                    <div className="text-sm text-muted-foreground shrink-0">
                      🔥 {user.streak}d
                    </div>

                    {/* Stat value */}
                    <div className="text-right shrink-0 min-w-[72px]">
                      <span className={`font-bold text-sm ${isFirst ? 'text-primary' : ''}`}>
                        {statLabel(user)}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT — Your streak stats (2/5 width on desktop)
          ---------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak numbers */}
            <Card className="p-6 border-border">
              <h2 className="text-lg font-bold mb-4">Your Streak</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/40 rounded-xl">
                  <p className="text-4xl font-bold">{stats.currentStreak} 🔥</p>
                  <p className="text-xs text-muted-foreground mt-1">Current streak</p>
                </div>
                <div className="text-center p-4 bg-muted/40 rounded-xl">
                  <p className="text-4xl font-bold">{stats.longestStreak} 🏆</p>
                  <p className="text-xs text-muted-foreground mt-1">Longest streak</p>
                </div>
              </div>
            </Card>

            {/* Streak calendar */}
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
                      {achieved && <span className="text-primary text-sm">✓</span>}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
