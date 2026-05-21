'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { GamePhase } from '../game/core/types'

interface TopBarProps {
  round: number
  hp: number
  gold: number
  boardUnitCount: number
  maxBoardSlots: number
  phase: GamePhase
}

export default function TopBar({ round, hp, gold, boardUnitCount, maxBoardSlots, phase }: TopBarProps) {
  const hpPct = Math.max(0, Math.min(100, hp))
  const isPrep = phase === 'prep'
  const hpColor = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#facc15' : '#f87171'

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      {/* Back */}
      <Link
        href="/"
        className="flex-shrink-0 w-8 h-8 rounded-lg border border-[rgba(212,170,80,0.3)] bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[var(--gold)] text-base font-bold"
        aria-label="Menu"
      >
        ‹
      </Link>

      {/* Title */}
      <span className="text-[12px] font-black tracking-[0.2em] text-[var(--gold-bright)] uppercase">
        Celo Tactics
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats row */}
      <div className="flex items-center gap-1.5">
        {/* Round */}
        <Chip label="Ronde" value={`${round}/5`} />

        {/* Slots */}
        <Chip label="Slot" value={`${boardUnitCount}/${maxBoardSlots}`} />

        {/* Gold */}
        <div className="flex items-center gap-1 rounded-lg border border-[rgba(212,170,80,0.3)] bg-[rgba(212,170,80,0.08)] px-2 py-1">
          <Image src="/assets/ui/icons/icon-03.png" alt="" width={12} height={12} className="pixel" aria-hidden />
          <span className="text-[12px] font-black text-[var(--gold-bright)]">{gold}</span>
        </div>

        {/* HP */}
        <div className="flex flex-col items-center gap-0.5 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-2 py-1 min-w-[52px]">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[var(--text-muted)]">HP</span>
            <span className="text-[11px] font-black" style={{ color: hpColor }}>{hp}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${hpPct}%`, background: hpColor }}
            />
          </div>
        </div>
      </div>

      {/* Phase badge */}
      <div className={`rounded-lg px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest border ${
        isPrep
          ? 'bg-[rgba(74,222,128,0.12)] text-[#9af2b1] border-[rgba(74,222,128,0.3)]'
          : 'bg-[rgba(255,90,90,0.12)] text-[#ffc1c1] border-[rgba(255,90,90,0.3)] anim-pulse'
      }`}>
        {isPrep ? '⚙ Prep' : '⚔ Battle'}
      </div>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-2 py-1">
      <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider leading-none">{label}</span>
      <span className="text-[12px] font-black text-[var(--text-primary)] leading-tight">{value}</span>
    </div>
  )
}
