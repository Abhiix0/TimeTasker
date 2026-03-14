import { PomodoroTimer } from '@/components/pomodoro-timer'

export const metadata = {
  title: 'Pomodoro Timer - Smart Time Tasker',
  description: 'Start your focused work session with our Pomodoro timer.',
}

export default function TimerPage() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Focus Timer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use the Pomodoro Technique to maintain deep focus. Work for 25 minutes, then take a break.
          </p>
        </div>

        <PomodoroTimer />

        {/* Timer Guide */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="text-lg font-semibold mb-3 text-primary">Work Session</h3>
            <p className="text-sm text-muted-foreground">
              Stay focused for 25 minutes. Eliminate distractions and put your full attention on your task. Leave your phone behind!
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="text-lg font-semibold mb-3 text-accent">Short Break</h3>
            <p className="text-sm text-muted-foreground">
              After each work session, take a 5-minute break to recharge. Stretch, hydrate, or take a quick walk.
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="text-lg font-semibold mb-3 text-secondary">Long Break</h3>
            <p className="text-sm text-muted-foreground">
              After 4 consecutive work sessions, take a 15-minute break. This helps you recharge for another productive cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
