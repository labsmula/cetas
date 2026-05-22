'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/src/lib/utils'
import { Settings, Swords } from 'lucide-react'
import type { GamePhase } from '../game/core/types'

interface TopBarProps {
  round: number; hp: number; gold: number
  boardUnitCount: number; maxBoardSlots: number; phase: GamePhase
}

export default function TopBar({ round, hp, gold, boardUnitCount, maxBoardSlots, phase }: TopBarProps) {
  const hpPct = Math.max(0, Math.min(100, hp))
  const hpColor = hpPct > 50 ? 'var(--ok)' : hpPct > 25 ? 'var(--warn)' : 'var(--enemy)'
  const isPrep = phase === 'prep'

  return (
    <div className="relic-frame flex items-center gap-2 rounded-xl px-2 py-1.5">
      <Link
        href="/"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(212,170,80,0.25)] bg-white/5 text-lg font-bold text-[var(--gold)]"
        aria-label="Menu"
      >
        ‹
      </Link>

      <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--gold-hi)]">
        CETAS
      </span>

      <div className="flex-1" />

      {/* Gold */}
      <div className="flex items-center gap-1 rounded-lg border border-[rgba(212,170,80,0.25)] bg-[rgba(212,170,80,0.1)] px-2 py-1">
        <Image src="/assets/ui/icons/icon-03.png" alt="" width={12} height={12} className="pixel" aria-hidden />
        <span className="text-[13px] font-black text-[var(--gold-hi)]">{gold}</span>
      </div>

      {/* HP */}
      <div className="flex min-w-[52px] flex-col items-center rounded-lg border border-[var(--border)] bg-white/4 px-2 py-1">
        <div className="mb-0.5 flex items-center gap-1">
          <span className="text-[8px] text-[var(--text-3)]">HP</span>
          <span className="text-[11px] font-black" style={{ color: hpColor }}>{hp}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
      </div>

      {/* Round */}
      <div className="flex flex-col items-center rounded-lg border border-[var(--border)] bg-white/4 px-2 py-1">
        <span className="text-[8px] text-[var(--text-3)]">RONDE</span>
        <span className="text-[13px] font-black text-[var(--text)]">{round}/5</span>
      </div>

      {/* Phase */}
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest',
          isPrep
            ? 'border bg-[var(--prep-bg)] text-[var(--prep-text)] border-[var(--prep-border)]'
            : 'border bg-[var(--battle-bg)] text-[var(--battle-text)] border-[var(--battle-border)]'
        )}
      >
        {isPrep ? (<><Settings className="h-3 w-3" /> Prep</>) : (<><Swords className="h-3 w-3" /> Battle</>)}
      </div>
    </div>
  )
}
