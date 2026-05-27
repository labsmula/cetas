import type { ReactNode } from 'react'
import { cn } from '@/src/lib/utils'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('relic-frame flex flex-col items-center gap-2 py-8 text-center', className)}>
      <div className="text-[var(--text-dim)]">{icon}</div>
      <p className="font-display text-[12px] text-[var(--text-3)]">{title}</p>
      <p className="text-[10px] text-[var(--text-dim)]">{description}</p>
    </div>
  )
}
