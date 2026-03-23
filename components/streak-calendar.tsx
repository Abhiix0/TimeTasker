'use client'

import { useMemo, useState } from 'react'
import type { DailyActivity } from '@/lib/types'

interface Props {
  activity: DailyActivity[]
}

const WEEKS = 12
const DAYS = 7
const TOTAL_DAYS = WEEKS * DAYS // 84

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

function cellColor(sessions: number): string {
  if (sessions === 0) return 'bg-muted/60'
  if (sessions <= 2)  return 'bg-primary/40'
  if (sessions <= 4)  return 'bg-primary/70'
  return 'bg-primary'
}

export function StreakCalendar({ activity }: Props) {
  const [tooltip, setTooltip] = useState<{
    date: string; sessions: number; focusMinutes: number; x: number; y: number
  } | null>(null)

  // Build a map of ISO date → activity
  const activityMap = useMemo(
    () => new Map(activity.map((a) => [a.date, a])),
    [activity]
  )

  // Build 84-day grid ending today, starting on Monday
  const cells = useMemo(() => {
    const today = new Date()
    // Align end to Sunday so grid ends on a full week
    const endDate = new Date(today)
    // Walk back to fill exactly TOTAL_DAYS cells
    const result: { date: string; sessions: number; focusMinutes: number }[] = []
    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      const entry = activityMap.get(iso)
      result.push({ date: iso, sessions: entry?.sessionsCompleted ?? 0, focusMinutes: entry?.focusMinutes ?? 0 })
    }
    return result
  }, [activityMap])

  // Month labels: find first cell of each month in the grid
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = []
    let lastMonth = -1
    cells.forEach((cell, idx) => {
      const month = new Date(cell.date).getMonth()
      const col = Math.floor(idx / DAYS)
      if (month !== lastMonth) {
        labels.push({
          col,
          label: new Date(cell.date).toLocaleDateString('en-US', { month: 'short' }),
        })
        lastMonth = month
      }
    })
    return labels
  }, [cells])

  // Reshape into columns (each column = 1 week, 7 days)
  const columns: typeof cells[number][][] = useMemo(() => {
    const cols = []
    for (let w = 0; w < WEEKS; w++) {
      cols.push(cells.slice(w * DAYS, w * DAYS + DAYS))
    }
    return cols
  }, [cells])

  return (
    <div className="relative select-none">
      {/* Month labels row */}
      <div className="flex mb-1 ml-8">
        {Array.from({ length: WEEKS }).map((_, w) => {
          const label = monthLabels.find((m) => m.col === w)
          return (
            <div key={w} className="w-4 mr-1 text-[10px] text-muted-foreground truncate">
              {label?.label ?? ''}
            </div>
          )
        })}
      </div>

      <div className="flex gap-0">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 mr-1 justify-around">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-3.5 text-[10px] text-muted-foreground leading-none w-6 text-right pr-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {columns.map((week, w) => (
            <div key={w} className="flex flex-col gap-1">
              {week.map((cell, d) => (
                <div
                  key={d}
                  className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-opacity hover:opacity-80 ${cellColor(cell.sessions)}`}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect()
                    setTooltip({ ...cell, x: rect.left, y: rect.top })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {cell.sessions >= 5 && (
                    <span className="text-[8px] leading-none flex items-center justify-center h-full">🔥</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 ml-8">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {['bg-muted/60', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>

      {/* Tooltip — rendered in a portal-like fixed div */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg text-xs shadow-lg border border-border bg-card text-foreground"
          style={{
            left: Math.min(tooltip.x + 20, window.innerWidth - 180),
            top: Math.max(tooltip.y - 40, 8),
          }}
        >
          <p className="font-semibold">
            {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-muted-foreground">{tooltip.sessions} session{tooltip.sessions !== 1 ? 's' : ''} · {tooltip.focusMinutes} min</p>
        </div>
      )}
    </div>
  )
}
