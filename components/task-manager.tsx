'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react'
import { useAppContext } from '@/lib/app-context'
import type { Task } from '@/lib/types'

type Priority = Task['priority']

const PRIORITY_BUTTONS: { value: Priority; label: string; activeClass: string }[] = [
  { value: 'high',   label: 'High', activeClass: 'bg-destructive/10 border-destructive text-destructive' },
  { value: 'medium', label: 'Med',  activeClass: 'bg-accent/10 border-accent text-accent'               },
  { value: 'low',    label: 'Low',  activeClass: 'bg-muted border-foreground/40 text-foreground'         },
]

export function TaskManager() {
  const { state, dispatch } = useAppContext()
  const { tasks } = state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    if (newTaskTitle.trim().length > 200) return
    dispatch({ type: 'ADD_TASK', payload: { title: newTaskTitle, priority } })
    setNewTaskTitle('')
  }

  const toggleTask = (id: string) => dispatch({ type: 'TOGGLE_TASK', payload: { id } })
  const deleteTask = (id: string) => dispatch({ type: 'DELETE_TASK', payload: { id } })

  const completedCount = tasks.filter((t) => t.completed).length
  const activeCount = tasks.filter((t) => !t.completed).length

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
        <form onSubmit={addTask} className="space-y-3">
          {/* Priority selector */}
          <div className="flex gap-1.5">
            {PRIORITY_BUTTONS.map(({ value, label, activeClass }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors
                  ${priority === value ? activeClass : 'border-border text-muted-foreground hover:border-foreground/30'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                maxLength={200}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground text-right">{newTaskTitle.length}/200</p>
            </div>
            <Button
              type="submit"
              size="icon"
              className="rounded-lg bg-linear-to-r from-primary to-accent hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
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
                {tasks.filter((t) => !t.completed).map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 border-border hover:shadow-md transition-shadow flex items-center gap-3"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                    <span className="flex-1 text-foreground">{task.title}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
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
                {tasks.filter((t) => t.completed).map((task) => (
                  <Card
                    key={task.id}
                    className="p-4 border-border hover:shadow-md transition-shadow flex items-center gap-3 bg-card/50"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0 text-accent"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <span className="flex-1 text-muted-foreground line-through">{task.title}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
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

