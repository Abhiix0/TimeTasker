'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react'

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

interface TaskManagerProps {
  onTasksChange?: (tasks: Task[]) => void
}

export function TaskManager({ onTasksChange }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [mounted, setMounted] = useState(false)

  // Load tasks from localStorage
  useEffect(() => {
    setMounted(true)
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error('Failed to load tasks:', e)
      }
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
      onTasksChange?.(tasks)
    }
  }, [tasks, mounted, onTasksChange])

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: Date.now()
    }

    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const completedCount = tasks.filter(t => t.completed).length
  const activeCount = tasks.filter(t => !t.completed).length

  if (!mounted) {
    return <div className="h-96 bg-card rounded-xl animate-pulse" />
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-sm text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-primary">{activeCount}</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border text-center">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-accent">{completedCount}</p>
        </div>
      </div>

      {/* Add Task Form */}
      <Card className="p-6 border-border">
        <form onSubmit={addTask} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 rounded-lg"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </form>
      </Card>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <p className="text-muted-foreground mb-4">No tasks yet. Create one to get started!</p>
            <div className="text-4xl mb-2">📝</div>
          </Card>
        ) : (
          <>
            {/* Active Tasks */}
            {activeCount > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground px-2">Active Tasks ({activeCount})</h3>
                {tasks.filter(t => !t.completed).map(task => (
                  <Card
                    key={task.id}
                    className="p-4 border-border hover:shadow-md transition-shadow flex items-center gap-3"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                    <span className="flex-1 text-foreground">{task.title}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Card>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedCount > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground px-2">Completed Tasks ({completedCount})</h3>
                {tasks.filter(t => t.completed).map(task => (
                  <Card
                    key={task.id}
                    className="p-4 border-border hover:shadow-md transition-shadow flex items-center gap-3 bg-card/50"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 text-accent"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <span className="flex-1 text-muted-foreground line-through">{task.title}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
