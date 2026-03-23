'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react'
import type { AppState, Task, Settings, DailyActivity } from './types'

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  dailyGoal: 8,
  soundEnabled: true,
  autoStartBreaks: false,
}

const initialState: AppState = {
  tasks: [],
  timer: {
    mode: 'work',
    isRunning: false,
    timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
    totalTime: DEFAULT_SETTINGS.focusDuration * 60,
    sessionsCompleted: 0,
    todayFocusMinutes: 0,
  },
  stats: {
    sessionsToday: 0,
    totalFocusTime: 0,
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
  weeklyActivity: [],
  settings: DEFAULT_SETTINGS,
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'ADD_TASK'; payload: { title: string; priority?: Task['priority'] } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_TASK'; payload: { id: string } }
  | { type: 'TICK_TIMER' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function upsertDailyActivity(
  activity: DailyActivity[],
  patch: Partial<DailyActivity>
): DailyActivity[] {
  const today = todayISO()
  const idx = activity.findIndex((a) => a.date === today)
  let updated: DailyActivity[]
  if (idx === -1) {
    updated = [...activity, { date: today, sessionsCompleted: 0, focusMinutes: 0, ...patch }]
  } else {
    updated = [...activity]
    updated[idx] = { ...updated[idx], ...patch }
  }
  // Keep only the last 90 days to prevent unbounded localStorage growth
  if (updated.length > 90) {
    updated = updated.sort((a, b) => a.date.localeCompare(b.date)).slice(-90)
  }
  return updated
}

// Count consecutive days backwards from today that have sessionsCompleted > 0
function calcStreak(activity: DailyActivity[]): number {
  if (activity.length === 0) return 0
  const byDate = new Map(activity.map((a) => [a.date, a.sessionsCompleted]))
  let streak = 0
  const cursor = new Date()
  // Start from today; if today has no sessions yet, start from yesterday
  const todayKey = cursor.toISOString().split('T')[0]
  if (!byDate.get(todayKey)) cursor.setDate(cursor.getDate() - 1)
  while (true) {
    const key = cursor.toISOString().split('T')[0]
    if ((byDate.get(key) ?? 0) > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: Task = {
        id: Date.now().toString(),
        title: action.payload.title.trim(),
        completed: false,
        createdAt: Date.now(),
        priority: action.payload.priority ?? 'medium',
      }
      return { ...state, tasks: [task, ...state.tasks] }
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) }

    case 'TOGGLE_TASK': {
      const tasks = state.tasks.map((t) =>
        t.id === action.payload.id ? { ...t, completed: !t.completed } : t
      )
      const tasksCompleted = tasks.filter((t) => t.completed).length
      return {
        ...state,
        tasks,
        stats: { ...state.stats, tasksCompleted },
      }
    }

    case 'TICK_TIMER': {
      if (!state.timer.isRunning || state.timer.timeLeft <= 0) return state
      return {
        ...state,
        timer: { ...state.timer, timeLeft: state.timer.timeLeft - 1 },
      }
    }

    case 'START_TIMER':
      return { ...state, timer: { ...state.timer, isRunning: true } }

    case 'PAUSE_TIMER':
      return { ...state, timer: { ...state.timer, isRunning: false } }

    case 'RESET_TIMER': {
      const { mode } = state.timer
      const { focusDuration, shortBreakDuration, longBreakDuration } = state.settings
      const totalTime =
        mode === 'work' ? focusDuration * 60
        : mode === 'shortBreak' ? shortBreakDuration * 60
        : longBreakDuration * 60
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: false,
          timeLeft: totalTime,
          totalTime,
        },
      }
    }

    case 'COMPLETE_SESSION': {
      // TODO: sync to Firebase when db is available
      const { timer, stats, settings } = state
      const isWork = timer.mode === 'work'
      const newSessionsCompleted = timer.sessionsCompleted + (isWork ? 1 : 0)
      const focusMinutesAdded = isWork ? settings.focusDuration : 0

      // Determine next mode
      let nextMode: AppState['timer']['mode'] = 'shortBreak'
      if (!isWork) {
        nextMode = 'work'
      } else if (newSessionsCompleted % 4 === 0) {
        nextMode = 'longBreak'
      }

      const nextDuration =
        nextMode === 'work'
          ? settings.focusDuration
          : nextMode === 'shortBreak'
          ? settings.shortBreakDuration
          : settings.longBreakDuration

      const newTotalFocusTime = stats.totalFocusTime + focusMinutesAdded
      const newSessionsToday = stats.sessionsToday + (isWork ? 1 : 0)

      const todayKey = todayISO()
      const todayEntry = state.weeklyActivity.find((a) => a.date === todayKey)
      const weeklyActivity = isWork
        ? upsertDailyActivity(state.weeklyActivity, {
            sessionsCompleted: (todayEntry?.sessionsCompleted ?? 0) + 1,
            focusMinutes: (todayEntry?.focusMinutes ?? 0) + focusMinutesAdded,
          })
        : state.weeklyActivity

      const currentStreak = isWork ? calcStreak(weeklyActivity) : stats.currentStreak
      const longestStreak = Math.max(currentStreak, stats.longestStreak)

      return {
        ...state,
        timer: {
          ...timer,
          mode: nextMode,
          isRunning: isWork ? true : settings.autoStartBreaks,
          timeLeft: nextDuration * 60,
          totalTime: nextDuration * 60,
          sessionsCompleted: newSessionsCompleted,
          todayFocusMinutes: timer.todayFocusMinutes + focusMinutesAdded,
        },
        stats: {
          ...stats,
          sessionsToday: newSessionsToday,
          totalFocusTime: newTotalFocusTime,
          currentStreak,
          longestStreak,
        },
        weeklyActivity,
      }
    }

    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.payload }
      // Recalculate timer totalTime if durations changed and timer is not running
      const totalTime =
        !state.timer.isRunning && state.timer.mode === 'work'
          ? settings.focusDuration * 60
          : state.timer.totalTime
      const timeLeft =
        !state.timer.isRunning && state.timer.mode === 'work'
          ? settings.focusDuration * 60
          : state.timer.timeLeft
      return {
        ...state,
        settings,
        timer: { ...state.timer, totalTime, timeLeft },
      }
    }

    case 'RESET_ALL':
      return { ...initialState }

    case 'LOAD_FROM_STORAGE': {
      const payload = action.payload
      return {
        ...state,
        tasks: payload.tasks ?? state.tasks,
        weeklyActivity: payload.weeklyActivity ?? state.weeklyActivity,
        stats: payload.stats ? { ...state.stats, ...payload.stats } : state.stats,
        settings: payload.settings ? { ...state.settings, ...payload.settings } : state.settings,
        timer: payload.timer
          ? { ...state.timer, ...payload.timer, isRunning: false }
          : state.timer,
      }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'stt_app_state'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved: Partial<AppState> = JSON.parse(raw)
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: saved })
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e)
    }
  }, [])

  // Persist to localStorage on every state change
  // TODO: sync to Firebase when db is available
  useEffect(() => {
    try {
      // Don't persist timer.isRunning — always start paused on reload
      const toSave: AppState = {
        ...state,
        timer: { ...state.timer, isRunning: false },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.error('Failed to persist state to localStorage:', e)
    }
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>')
  return ctx
}
