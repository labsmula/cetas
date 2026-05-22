'use client'

import Image from 'next/image'
import { cn } from '@/src/lib/utils'
import type { EnemyPreview } from '../game/core/types'

interface EnemyIntelProps {
  enemies: EnemyPreview[]
  round: number
}

const TRAIT_MAP: Record<string, { text: string; bg: string; border: string }> = {
  Melee:    { text: 'var(--trait-melee)',   bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
  Ranged:   { text: 'var(--trait-ranged)',  bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
  Tank:     { text: 'var(--trait-tank)',    bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
  Assassin: { text: 'var(--trait-assassin)',bg: 'rgba(167,139,250,0.12)',border: 'rgba(167,139,250,0.3)' },
}

function getThreat(totalAtk: number) {
  if (totalAtk > 150) return { label: 'TINGGI', color: 'var(--enemy)' }
  if (totalAtk > 80)  return { label: 'SEDANG', color: 'var(--warn)' }
  return { label: 'RENDAH', color: 'var(--ok)' }
}

export default function EnemyIntel({ enemies, round }: EnemyIntelProps) {
  if (!enemies.length) return null

  const totalAtk = enemies.reduce((s, e) => s + e.atk, 0)
  const threat = getThreat(totalAtk)

  return (
    <div className="surface-gold anim-fade-up px-3 py-2.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">⚠️</span>
          <span className="label">Musuh Ronde {round}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[var(--text-3)]">Ancaman</span>
          <span className="text-[10px] font-black" style={{ color: threat.color }}>{threat.label}</span>
        </div>
      </div>

      <div className="scroll-x flex gap-2 pb-0.5">
        {enemies.map((e, i) => <EnemyCard key={i} enemy={e} />)}
      </div>
    </div>
  )
}

function EnemyCard({ enemy }: { enemy: EnemyPreview }) {
  const ts = TRAIT_MAP[enemy.traitLabel] ?? TRAIT_MAP.Melee
  const spdLabel = enemy.spd >= 1.4 ? '⚡Fast' : enemy.spd >= 0.9 ? 'Normal' : '🐢Slow'

  return (
    <div className="flex w-[76px] flex-shrink-0 flex-col items-center gap-1 rounded-xl border border-[rgba(255,90,90,0.2)] bg-white/3 px-1.5 py-2">
      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[rgba(255,90,90,0.3)]">
        <Image src={`/assets/ui/avatars/avatar-${enemy.avatarIndex}.png`} alt={enemy.name} width={64} height={64} className="pixel h-full w-full object-cover" />
        {enemy.stars > 1 && (
          <div className="absolute bottom-0 right-0 rounded-tl bg-black/75 px-0.5 text-[7px] font-bold leading-tight text-[#fbbf24]">
            {'★'.repeat(enemy.stars)}
          </div>
        )}
      </div>

      <span className="text-center text-[9px] font-bold leading-tight text-[var(--text)]">{enemy.name}</span>

      <span
        className="rounded-full px-1.5 py-[1px] text-[8px] font-bold"
        style={{ background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}
      >
        {enemy.traitLabel}
      </span>

      <div className="flex gap-1.5 text-[8px]">
        <span className="text-[var(--stat-atk)]">⚔{enemy.atk}</span>
        <span className="text-[var(--stat-hp)]">❤{enemy.hp}</span>
      </div>
      <span className="text-[7px] text-[var(--text-3)]">{spdLabel}</span>
    </div>
  )
}
