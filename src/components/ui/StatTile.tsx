import type { ReactNode } from 'react'
import { cn } from '@/src/lib/utils'

type StatTileProps = {
  icon: ReactNode
  label: string
  value: string
  className?: string
}

export function StatTile({ icon, label, value, className }: StatTileProps) {
  return (
    <div className={cn('relic-frame flex items-center gap-3 px-3 py-3', className)}>
      <div className="relative z-[1] flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[rgba(4,16,33,0.7)]">
        {icon}
      </div>
      <div className="relative z-[1] min-w-0">
        <p className="text-[9px] uppercase tracking-wider text-[var(--text-3)]">{label}</p>
        <p className="truncate font-display text-[15px] font-bold tabular-nums text-[var(--text-1)]">{value}</p>
      </div>
    </div>
  )
}
