'use client'

import Image from 'next/image'
import type { BenchSlots, SelectedSource } from '../game/core/types'

interface BenchProps {
  bench: BenchSlots
  selected: SelectedSource
  onSlotClick: (idx: number) => void
}

export default function Bench({ bench, selected, onSlotClick }: BenchProps) {
  const filled = bench.filter(Boolean).length

  return (
    <section className="panel px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="section-header">Bangku Cadangan</span>
        <span className="text-[9px] text-[var(--text-muted)]">{filled}/8 unit</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scroll-x">
        {bench.map((unit, i) => {
          const isSel =
            selected?.src === 'bench' &&
            (selected as { src: 'bench'; idx: number }).idx === i
          return (
            <BenchSlot
              key={i}
              unit={unit}
              isSelected={isSel}
              onClick={() => onSlotClick(i)}
            />
          )
        })}
      </div>
    </section>
  )
}

function BenchSlot({
  unit, isSelected, onClick,
}: {
  unit: BenchSlots[number]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={unit ? `${unit.name} ⭐${unit.stars} | ATK:${unit.atkVal} HP:${unit.curHp}` : 'Kosong'}
      className={[
        'flex-shrink-0 w-[58px] h-[68px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all',
        unit
          ? isSelected
            ? 'border-2 border-[var(--blue-ally)] bg-[rgba(74,158,255,0.12)] scale-105'
            : 'border border-[rgba(74,158,255,0.35)] bg-[rgba(74,158,255,0.06)] active:scale-95'
          : 'border border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]',
      ].join(' ')}
      aria-label={unit ? `${unit.name} bintang ${unit.stars}` : 'Slot kosong'}
      aria-pressed={isSelected}
    >
      {unit ? (
        <>
          {/* Avatar */}
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[rgba(74,158,255,0.4)]">
            <Image
              src={`/assets/ui/avatars/avatar-${unit.avatarIndex}.png`}
              alt={unit.name}
              width={64}
              height={64}
              className="pixel w-full h-full object-cover"
            />
            {unit.stars > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 rounded-tl px-0.5 text-[7px] text-yellow-400 font-bold leading-tight">
                {'★'.repeat(unit.stars)}
              </div>
            )}
          </div>
          {/* Name */}
          <span className="text-[8px] font-bold text-[var(--text-primary)] leading-none text-center px-0.5">
            {unit.name}
          </span>
          {/* Mini stats */}
          <div className="flex gap-1 text-[7px]">
            <span className="text-red-400">⚔{unit.atkVal}</span>
            <span className="text-pink-400">❤{unit.curHp}</span>
          </div>
        </>
      ) : (
        <span className="text-[18px] text-[rgba(255,255,255,0.1)]">+</span>
      )}
    </button>
  )
}
