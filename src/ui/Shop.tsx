'use client'

import Image from 'next/image'
import { cn } from '@/src/lib/utils'
import type { ShopItem } from '../game/core/types'

const TRAIT_COLORS: Record<string, string> = {
  Melee: 'var(--trait-melee)',
  Ranged: 'var(--trait-ranged)',
  Tank: 'var(--trait-tank)',
  Assassin: 'var(--trait-assassin)',
}

interface ShopProps {
  shop: ShopItem[]
  onBuy: (idx: number) => void
}

export default function Shop({ shop, onBuy }: ShopProps) {
  return (
    <div className="surface px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="label">Toko</span>
        <span className="text-[9px] text-[var(--text-3)]">Tap untuk beli</span>
      </div>
      <div className="scroll-x flex gap-2 pb-0.5">
        {shop.map((item, i) => (
          <ShopCard key={i} item={item} onBuy={() => onBuy(i)} />
        ))}
      </div>
    </div>
  )
}

function ShopCard({ item, onBuy }: { item: ShopItem; onBuy: () => void }) {
  const tc = TRAIT_COLORS[item.traitLabel] ?? 'var(--text-2)'

  return (
    <button
      onClick={item.sold ? undefined : onBuy}
      disabled={item.sold}
      className={cn(
        'flex flex-shrink-0 w-[74px] flex-col items-center gap-1 rounded-xl px-1.5 py-2 transition-transform',
        item.sold
          ? 'cursor-default border border-[var(--border)] bg-white/2 opacity-25'
          : 'cursor-pointer border border-[rgba(212,170,80,0.2)] bg-[var(--bg-card)] active:scale-92'
      )}
      aria-label={`Beli ${item.name} seharga ${item.cost} koin${item.sold ? ' (terjual)' : ''}`}
    >
      <div className={cn(
        'h-11 w-11 overflow-hidden rounded-lg border',
        item.sold ? 'border-[rgba(212,170,80,0.1)]' : 'border-[rgba(212,170,80,0.3)]'
      )}>
        <Image src={`/assets/ui/avatars/avatar-${item.avatarIndex}.png`} alt={item.name} width={64} height={64} className="pixel h-full w-full object-cover" />
      </div>

      <span className="text-center text-[10px] font-bold leading-tight text-[var(--text)]">{item.name}</span>
      <span className="text-[8px] font-semibold" style={{ color: tc }}>{item.traitLabel}</span>

      <div className="flex gap-1.5 text-[8px]">
        <span className="text-[var(--stat-atk)]">⚔{item.atk}</span>
        <span className="text-[var(--stat-hp)]">❤{item.hp}</span>
      </div>

      <div className="flex items-center gap-0.5 rounded-full border border-[rgba(212,170,80,0.28)] bg-[rgba(212,170,80,0.15)] px-2 py-[2px]">
        <Image src="/assets/ui/icons/icon-03.png" alt="" width={10} height={10} className="pixel" aria-hidden />
        <span className="text-[10px] font-black text-[var(--stat-gold)]">{item.cost}</span>
      </div>
    </button>
  )
}
