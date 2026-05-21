'use client'

import Image from 'next/image'
import type { EnemyPreview } from '../game/core/types'

interface EnemyIntelProps {
  enemies: EnemyPreview[]
  round: number
}

const TRAIT_COLOR: Record<string, string> = {
  Melee:    'bg-red-900/60 text-red-300 border-red-700/50',
  Ranged:   'bg-green-900/60 text-green-300 border-green-700/50',
  Tank:     'bg-blue-900/60 text-blue-300 border-blue-700/50',
  Assassin: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
}

export default function EnemyIntel({ enemies, round }: EnemyIntelProps) {
  if (!enemies.length) return null

  // Aggregate stats for threat summary
  const totalAtk = enemies.reduce((s, e) => s + e.atk, 0)
  const totalHp  = enemies.reduce((s, e) => s + e.hp, 0)
  const threat   = totalAtk > 150 ? 'TINGGI' : totalAtk > 80 ? 'SEDANG' : 'RENDAH'
  const threatColor = threat === 'TINGGI' ? 'text-red-400' : threat === 'SEDANG' ? 'text-yellow-400' : 'text-green-400'

  return (
    <section className="panel px-3 py-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">⚠️</span>
          <span className="section-header text-[var(--text-muted)]">Musuh Ronde {round}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Ancaman:</span>
          <span className={`text-[10px] font-black ${threatColor}`}>{threat}</span>
        </div>
      </div>

      {/* Enemy cards */}
      <div className="flex gap-2 overflow-x-auto pb-1 scroll-x">
        {enemies.map((e, i) => (
          <EnemyCard key={i} enemy={e} />
        ))}
      </div>

      {/* Aggregate summary */}
      <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)] flex gap-3">
        <SummaryChip icon="⚔️" label="Total ATK" value={totalAtk} color="text-red-400" />
        <SummaryChip icon="🛡️" label="Total HP"  value={totalHp}  color="text-blue-400" />
        <div className="ml-auto text-[10px] text-[var(--text-muted)] self-center">
          {enemies.length} unit musuh
        </div>
      </div>
    </section>
  )
}

function EnemyCard({ enemy }: { enemy: EnemyPreview }) {
  const traitCls = TRAIT_COLOR[enemy.traitLabel] ?? 'bg-zinc-800 text-zinc-300 border-zinc-600'
  const spdLabel = enemy.spd >= 1.4 ? 'Cepat' : enemy.spd >= 0.9 ? 'Normal' : 'Lambat'

  return (
    <div className="flex-shrink-0 w-[80px] rounded-xl border border-[rgba(255,90,90,0.25)] bg-[rgba(255,60,60,0.06)] p-1.5 flex flex-col items-center gap-1">
      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[rgba(255,90,90,0.3)]">
        <Image
          src={`/assets/ui/avatars/avatar-${enemy.avatarIndex}.png`}
          alt={enemy.name}
          width={64}
          height={64}
          className="pixel w-full h-full object-cover"
        />
        {/* Stars overlay */}
        {enemy.stars > 1 && (
          <div className="absolute bottom-0 right-0 bg-black/70 rounded-tl px-0.5 text-[8px] text-yellow-400 font-bold leading-tight">
            {'★'.repeat(enemy.stars)}
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-[9px] font-bold text-[var(--text-primary)] text-center leading-tight">
        {enemy.name}
      </span>

      {/* Trait badge */}
      <span className={`text-[8px] font-bold px-1.5 py-[1px] rounded-full border ${traitCls}`}>
        {enemy.traitLabel}
      </span>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-0.5">
        <StatMini icon="⚔" value={enemy.atk} color="text-red-400" />
        <StatMini icon="❤" value={enemy.hp}  color="text-pink-400" />
      </div>
      <div className="text-[8px] text-[var(--text-muted)]">{spdLabel}</div>
    </div>
  )
}

function StatMini({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5 justify-center">
      <span className={`text-[8px] ${color}`}>{icon}</span>
      <span className="text-[9px] font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  )
}

function SummaryChip({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px]">{icon}</span>
      <div>
        <div className="text-[8px] text-[var(--text-muted)] leading-none">{label}</div>
        <div className={`text-[12px] font-black leading-tight ${color}`}>{value}</div>
      </div>
    </div>
  )
}
