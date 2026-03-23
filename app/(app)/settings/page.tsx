'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppContext } from '@/lib/app-context'
import { Timer, Cpu, Database, Trash2, Download, Wifi } from 'lucide-react'

// Simple inline toast — avoids needing a toast provider
function useSimpleToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const show = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(null), 3000)
  }
  return { msg, show }
}

export default function SettingsPage() {
  const { state, dispatch } = useAppContext()
  const { settings } = state
  const toast = useSimpleToast()

  const [form, setForm] = useState({
    focusDuration:       settings.focusDuration,
    shortBreakDuration:  settings.shortBreakDuration,
    longBreakDuration:   settings.longBreakDuration,
    dailyGoal:           settings.dailyGoal,
    soundEnabled:        settings.soundEnabled,
    autoStartBreaks:     settings.autoStartBreaks,
  })

  useEffect(() => {
    setForm({
      focusDuration:       settings.focusDuration,
      shortBreakDuration:  settings.shortBreakDuration,
      longBreakDuration:   settings.longBreakDuration,
      dailyGoal:           settings.dailyGoal,
      soundEnabled:        settings.soundEnabled,
      autoStartBreaks:     settings.autoStartBreaks,
    })
  }, [settings])

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const saveTimerSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    // Reset timer to new focus duration
    dispatch({ type: 'RESET_TIMER' })
    toast.show('Timer settings saved.')
  }

  const exportData = () => {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-time-tasker-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.show('Data exported.')
  }

  const resetAll = () => {
    localStorage.removeItem('stt_app_state')
    dispatch({ type: 'RESET_ALL' })
    toast.show('All data cleared.')
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your Smart Time Tasker experience.</p>
        </div>

        {/* Inline toast */}
        {toast.msg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-card border border-border shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-200">
            {toast.msg}
          </div>
        )}

        {/* ── Timer Settings ─────────────────────────────────────────── */}
        <Card className="p-6 border-border space-y-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Timer Settings</h2>
          </div>
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Focus Duration (min)"
              value={form.focusDuration}
              min={1} max={60}
              onChange={(v) => set('focusDuration', v)}
            />
            <NumberField
              label="Short Break (min)"
              value={form.shortBreakDuration}
              min={1} max={30}
              onChange={(v) => set('shortBreakDuration', v)}
            />
            <NumberField
              label="Long Break (min)"
              value={form.longBreakDuration}
              min={5} max={60}
              onChange={(v) => set('longBreakDuration', v)}
            />
            <NumberField
              label="Daily Session Goal"
              value={form.dailyGoal}
              min={1} max={20}
              onChange={(v) => set('dailyGoal', v)}
            />
          </div>

          <div className="space-y-4">
            <ToggleRow
              label="Sound Alerts"
              description="Play a sound when a session ends"
              checked={form.soundEnabled}
              onCheckedChange={(v) => set('soundEnabled', v)}
            />
            <ToggleRow
              label="Auto-start Breaks"
              description="Automatically resume work session after a break ends"
              checked={form.autoStartBreaks}
              onCheckedChange={(v) => set('autoStartBreaks', v)}
            />
          </div>

          <Button
            onClick={saveTimerSettings}
            className="rounded-full bg-gradient-to-r from-primary to-accent hover:shadow-lg w-full sm:w-auto"
          >
            Save Timer Settings
          </Button>
        </Card>

        {/* ── ESP32 Device ───────────────────────────────────────────── */}
        <Card className="p-6 border-border space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold">ESP32 Device</h2>
          </div>
          <Separator />

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
            <span className="text-sm text-muted-foreground">Not Connected</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The ESP32 device provides a distraction-free hardware timer with an LCD display,
            push buttons, and audio alerts — letting you leave your phone behind during focus sessions.
          </p>

          {/* TODO: implement WebSocket connection to ESP32 device */}
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => toast.show('ESP32 integration coming soon.')}
          >
            <Wifi className="w-4 h-4" />
            Connect Device
          </Button>
        </Card>

        {/* ── Account ────────────────────────────────────────────────── */}
        <Card className="p-6 border-border space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold">Account</h2>
          </div>
          <Separator />

          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign in with Firebase to sync your sessions, tasks, and streaks across all your devices.
          </p>

          {/* TODO: implement Firebase auth */}
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => toast.show('Firebase integration coming soon.')}
          >
            Connect Firebase
          </Button>
        </Card>

        {/* ── Data Management ────────────────────────────────────────── */}
        <Card className="p-6 border-border space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-bold">Data Management</h2>
          </div>
          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={exportData}
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your tasks, sessions, streaks, and settings.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-full bg-destructive hover:bg-destructive/90"
                    onClick={resetAll}
                  >
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <p className="text-xs text-muted-foreground">
            Export saves a JSON file of your current state. Reset clears all local data permanently.
          </p>
        </Card>

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small reusable sub-components
// ---------------------------------------------------------------------------

function NumberField({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Math.min(max, Math.max(min, Number(e.target.value)))
          onChange(v)
        }}
        className="rounded-lg"
      />
    </div>
  )
}

function ToggleRow({
  label, description, checked, onCheckedChange,
}: {
  label: string; description: string; checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
