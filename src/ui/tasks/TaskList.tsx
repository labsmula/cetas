'use client'

import { CheckSquare } from 'lucide-react'
import { useHomeStore, DAILY_TASK_DEFS } from '@/src/lib/homeStore'
import TaskItem from './TaskItem'

export default function TaskList() {
  const { taskStates } = useHomeStore()
  const completedCount = taskStates.filter(t => t.done).length

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pb-1">
        <CheckSquare className="h-4 w-4 text-[var(--ok)]" />
        <h1 className="font-display text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--gold-hi)]">
          Daily Quests
        </h1>
        <span className="ml-auto font-display text-[11px] text-[var(--ok)]">
          {completedCount}/{DAILY_TASK_DEFS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="stat-bar mb-1" style={{ height: 5 }}>
        <div
          className="stat-bar-fill bg-gradient-to-r from-[var(--ok)] to-[#7fffb0]"
          style={{ width: `${(completedCount / DAILY_TASK_DEFS.length) * 100}%`, borderRadius: 4 }}
        />
      </div>
      {/* Task items */}
      {DAILY_TASK_DEFS.map(def => (
        <TaskItem key={def.id} def={def} />
      ))}
    </div>
  )
}
