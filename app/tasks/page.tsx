import { TaskManager } from '@/components/task-manager'

export const metadata = {
  title: 'Task Manager - Smart Time Tasker',
  description: 'Manage your tasks and track your progress.',
}

export default function TasksPage() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Task Manager</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and organize your tasks. Mark them complete as you progress through your work sessions.
          </p>
        </div>

        <TaskManager />

        {/* Tips Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Task Management Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Break Down Large Tasks
              </h3>
              <p className="text-sm text-muted-foreground">
                Divide complex tasks into smaller, manageable chunks. This makes them easier to complete in Pomodoro sessions and provides a sense of progress.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                One Task Per Session
              </h3>
              <p className="text-sm text-muted-foreground">
                Focus on a single task during each 25-minute work session. This minimizes context switching and maximizes productivity.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Prioritize Daily
              </h3>
              <p className="text-sm text-muted-foreground">
                Start your day by identifying your top 3-5 most important tasks. This gives you a clear direction for your focused work sessions.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Review Your Progress
              </h3>
              <p className="text-sm text-muted-foreground">
                At the end of each day, review completed tasks and plan tomorrow's focus areas. Celebrate your achievements!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
