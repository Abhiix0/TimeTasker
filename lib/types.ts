export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  priority: 'high' | 'medium' | 'low'
}

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface TimerState {
  mode: TimerMode
  isRunning: boolean
  timeLeft: number       // seconds
  totalTime: number      // seconds
  sessionsCompleted: number
  todayFocusMinutes: number
}

export interface Stats {
  sessionsToday: number
  totalFocusTime: number  // minutes
  tasksCompleted: number
  currentStreak: number   // days
  longestStreak: number   // days
}

export interface DailyActivity {
  date: string            // ISO date string e.g. "2026-03-23"
  sessionsCompleted: number
  focusMinutes: number
}

export interface Settings {
  focusDuration: number       // minutes, default 25
  shortBreakDuration: number  // minutes, default 5
  longBreakDuration: number   // minutes, default 15
  dailyGoal: number           // sessions, default 8
  soundEnabled: boolean
  autoStartBreaks: boolean
}

export interface AppState {
  tasks: Task[]
  timer: TimerState
  stats: Stats
  weeklyActivity: DailyActivity[]
  settings: Settings
}
