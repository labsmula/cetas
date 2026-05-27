'use client'

import Image from 'next/image'
import { CheckSquare } from 'lucide-react'
import { useTasks, useClaimTask } from '@/src/hooks/useTasks'
import { useWallet } from '@/src/providers/WalletProvider'
import { EmptyState } from '@/src/components/ui/EmptyState'
import { LoadingRows } from '@/src/components/ui/LoadingState'
import TaskItem from './tasks/TaskItem'

export default function TasksClient() {
  const { authStatus } = useWallet()
  const isReady = authStatus === 'authenticated'

  const { data: tasks = [], isLoading } = useTasks(isReady)
  const claimMutation = useClaimTask()

  const completedCount = tasks.filter(t => t.done).length
  const isInitialLoading = !isReady || isLoading

  return (
    <div className="flex h-full flex-col gap-3">
      {/* ── Fixed header ── */}
      <div className="flex flex-shrink-0 items-center gap-2 px-1">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl
                        border border-[rgba(200,146,42,0.3)] bg-[rgba(200,146,42,0.08)]">
          <Image
            src="/assets/ui/task.png"
            alt=""
            width={18} height={18}
            loading="eager"
            unoptimized
            className="pixel object-contain"
            aria-hidden
          />
        </div>
        <h1 className="font-display text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--gold-hi)]">
          Daily Quests
        </h1>
        <span className="ml-auto font-display text-[11px] text-[var(--ok)]">
          {isInitialLoading ? 'loading' : `${completedCount}/${tasks.length || '—'}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="stat-bar flex-shrink-0" style={{ height: 5 }}>
        <div
          className="stat-bar-fill bg-gradient-to-r from-[var(--ok)] to-[#7fffb0]"
          style={{
            width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%',
            borderRadius: 4,
          }}
        />
      </div>

      {/* ── Scrollable list ── */}
      <div className="game-scroll flex flex-1 flex-col gap-2 overflow-y-auto">
        {isInitialLoading
          ? <LoadingRows count={6} />
          : tasks.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="h-8 w-8" />}
                title="No quests yet"
                description="Daily quests will appear after setup"
              />
            )
          : tasks.map(task => (
              <TaskItem
                key={task.id}
                def={{
                  id:      task.id,
                  label:   task.label,
                  desc:    task.desc,
                  reward:  task.reward,
                  total:   task.total,
                  iconId:  task.iconId as import('@/src/lib/homeStore').TaskIconId,
                }}
                progress={task.progress}
                done={task.done}
                claimedAt={task.claimedAt}
                onClaim={() => claimMutation.mutate(task.id)}
                claiming={claimMutation.isPending && claimMutation.variables === task.id}
              />
            ))
        }
      </div>
    </div>
  )
}
