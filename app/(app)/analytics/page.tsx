'use client'

import { Card } from '@/components/ui/card'
import { useAppContext } from '@/lib/app-context'
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Clock, Zap, Trophy, CheckSquare } from 'lucide-react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayLabel(iso: string) {
  return DAY_NAMES[new Date(iso).getDay()]
}

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
}

const AXIS_STYLE = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }

export default function AnalyticsPage() {
  const { state } = useAppContext()
  const { weeklyActivity, stats, tasks } = state

  // Build chart data — last 7 days
  const chartData = weeklyActivity.slice(-7).map((d) => ({
    day: dayLabel(d.date),
    focusMinutes: d.focusMinutes,
    sessions: d.sessionsCompleted,
  }))

  // Summary stats
  const totalWeeklyFocus = weeklyActivity.reduce((s, d) => s + d.focusMinutes, 0)
  const totalWeeklySessions = weeklyActivity.reduce((s, d) => s + d.sessionsCompleted, 0)
  const avgSessions = weeklyActivity.length
    ? (totalWeeklySessions / weeklyActivity.length).toFixed(1)
    : '0'
  const bestDay = weeklyActivity.length
    ? weeklyActivity.reduce((best, d) => (d.sessionsCompleted > best.sessionsCompleted ? d : best), weeklyActivity[0])
    : null
  const completionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
    : 0

  const summaryCards = [
    {
      label: 'Total Focus Time',
      value: totalWeeklyFocus >= 60
        ? `${Math.floor(totalWeeklyFocus / 60)}h ${totalWeeklyFocus % 60}m`
        : `${totalWeeklyFocus}m`,
      sub: 'this week',
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avg Sessions / Day',
      value: avgSessions,
      sub: 'this week',
      icon: Zap,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Best Day',
      value: bestDay ? `${bestDay.sessionsCompleted} sessions` : '—',
      sub: bestDay ? dayLabel(bestDay.date) : 'no data yet',
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Task Completion',
      value: `${completionRate}%`,
      sub: `${tasks.filter((t) => t.completed).length} of ${tasks.length} tasks`,
      icon: CheckSquare,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
  ]

  const hasData = chartData.length > 0

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Your productivity trends over the past week.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <Card key={label} className="p-6 border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </Card>
          ))}
        </div>

        {/* Area chart — Focus Time */}
        <Card className="p-8 border-border">
          <h2 className="text-xl font-bold mb-6">Focus Time This Week</h2>
          {!hasData ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis
                  tick={AXIS_STYLE}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}m`}
                  width={40}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number) => [`${v} min`, 'Focus Time']}
                />
                <Area
                  type="monotone"
                  dataKey="focusMinutes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#focusGradient)"
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bar chart — Sessions Per Day */}
        <Card className="p-8 border-border">
          <h2 className="text-xl font-bold mb-6">Sessions Per Day</h2>
          {!hasData ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis
                  tick={AXIS_STYLE}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number) => [v, 'Sessions']}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Bar
                  dataKey="sessions"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
      No data yet — complete a session to see your analytics.
    </div>
  )
}
