'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreakCalendar } from '@/components/streak-calendar'
import { useAppContext } from '@/lib/app-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  uid: string
  displayName: string
  initials: string
  weeklyFocusMinutes: number
  weeklySessions: number
  streak: number
  showOnLeaderboard: boolean
  isYou?: boolean
}

type Tab = 'weeklyFocusMinutes' | 'weeklySessions' | 'streak'

const TABS: { key: Tab; label: string }[] = [
  { key: 'weeklyFocusMinutes', label: 'Focus Time'  },
  { key: 'weeklySessions',     label: 'Sessions'    },
  { key: 'streak',             label: 'Streak'      },
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
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <Card className="p-4 border-border flex items-center gap-4 animate-pulse">
      <div className="w-8 h-5 bg-muted rounded" />
      <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
      <div className="flex-1 h-4 bg-muted rounded" />
      <div className="w-16 h-4 bg-muted rounded" />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('weeklyFocusMinutes')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { state } = useAppContext()
  const { stats, weeklyActivity } = state

  // Subscribe to leaderboard collection ordered by active tab field
  useEffect(() => {
    setLoading(true)
    const currentUid = getAuth().currentUser?.uid ?? null

    const q = query(
      collection(db, 'leaderboard'),
      orderBy(activeTab, 'desc'),
      limit(50)
    )

    const unsub = onSnapshot(q, (snap) => {
      const rows: LeaderboardEntry[] = []
      snap.forEach((d) => {
        const data = d.data() as Omit<LeaderboardEntry, 'uid' | 'isYou'>
        if (!data.showOnLeaderboard) return
        rows.push({ ...data, uid: d.id, isYou: d.id === currentUid })
      })
      setEntries(rows)
      setLoading(false)
    }, () => setLoading(false))

    return unsub
  }, [activeTab])

  // If current user has no leaderboard entry, append a ghost row from local stats
  const currentUid = getAuth().currentUser?.uid ?? null
  const hasOwnEntry = entries.some((e) => e.isYou)
  const last7FocusMinutes = state.weeklyActivity
    .filter(d => (Date.now() - new Date(d.date).getTime()) / 86400000 < 7)
    .reduce((s, d) => s + d.focusMinutes, 0)
  const last7Sessions = state.weeklyActivity
    .filter(d => (Date.now() - new Date(d.date).getTime()) / 86400000 < 7)
    .reduce((s, d) => s + d.sessionsCompleted, 0)

  const ghostEntry: LeaderboardEntry | null =
    !hasOwnEntry && currentUid
      ? {
          uid: currentUid,
          displayName: 'You',
          initials: 'ME',
          weeklyFocusMinutes: last7FocusMinutes,
          weeklySessions: last7Sessions,
          streak: stats.currentStreak,
          showOnLeaderboard: true,
          isYou: true,
        }
      : null

  const statLabel = (entry: LeaderboardEntry) => {
    if (activeTab === 'weeklyFocusMinutes') return formatFocusTime(entry.weeklyFocusMinutes)
    if (activeTab === 'weeklySessions')     return `${entry.weeklySessions} sessions`
    return `${entry.streak}d streak`
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against other focused workers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT — table */}
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
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : (
                <>
                  {entries.map((entry, idx) => {
                    const rank = idx + 1
                    const isFirst = rank === 1
                    return (
                      <Card
                        key={entry.uid}
                        className={`p-4 border flex items-center gap-4 transition-shadow
                          ${entry.isYou ? 'border-primary/60 bg-primary/5' : 'border-border'}
                          ${isFirst ? 'shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_0_16px_hsl(var(--primary)/0.15)]' : ''}
                        `}
                      >
                        <div className="w-8 text-center shrink-0">
                          {rank <= 3
                            ? <span className="text-xl">{MEDALS[rank - 1]}</span>
                            : <span className="text-sm font-bold text-muted-foreground">{rank}</span>
                          }
                        </div>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                          ${entry.isYou
                            ? 'bg-linear-to-br from-primary to-accent text-white'
                            : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {entry.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${entry.isYou ? 'text-primary' : ''}`}>
                            {entry.displayName}
                            {entry.isYou && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground shrink-0">
                          🔥 {entry.streak}d
                        </div>
                        <div className="text-right shrink-0 min-w-[72px]">
                          <span className={`font-bold text-sm ${isFirst ? 'text-primary' : ''}`}>
                            {statLabel(entry)}
                          </span>
                        </div>
                      </Card>
                    )
                  })}

                  {/* Ghost row — user not yet on leaderboard */}
                  {ghostEntry && (
                    <Card className="p-4 border border-primary/40 bg-primary/5 flex items-center gap-4 opacity-70">
                      <div className="w-8 text-center shrink-0">
                        <span className="text-sm font-bold text-muted-foreground">–</span>
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-linear-to-br from-primary to-accent text-white">
                        {ghostEntry.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-primary">
                          {ghostEntry.displayName}
                          <span className="ml-2 text-xs text-muted-foreground">(you — not ranked yet)</span>
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground shrink-0">
                        🔥 {ghostEntry.streak}d
                      </div>
                      <div className="text-right shrink-0 min-w-[72px]">
                        <span className="font-bold text-sm">{statLabel(ghostEntry)}</span>
                      </div>
                    </Card>
                  )}

                  {entries.length === 0 && !ghostEntry && (
                    <Card className="p-12 text-center border-border">
                      <p className="text-muted-foreground text-sm">No leaderboard data yet.</p>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT — streak panel */}
          <div className="lg:col-span-2 space-y-6">
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

            <Card className="p-6 border-border overflow-x-auto">
              <h2 className="text-lg font-bold mb-4">Activity Calendar</h2>
              <StreakCalendar activity={weeklyActivity} />
            </Card>

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

