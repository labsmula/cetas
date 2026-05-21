'use client'

import Image from 'next/image'
import type { ShopItem } from '../game/core/types'

interface ShopProps {
  shop: ShopItem[]
  onBuy: (idx: number) => void
}

const TRAIT_COLOR: Record<string, string> = {
  Melee:    'text-red-400',
  Ranged:   'text-green-400',
  Tank:     'text-blue-400',
  Assassin: 'text-purple-400',
}

export default function Shop({ shop, onBuy }: ShopProps) {
  return (
    <section className="panel px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="section-header">Toko Unit</span>
        <span className="text-[9px] text-[var(--text-muted)]">Tap untuk beli</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scroll-x">
        {shop.map((item, i) => (
          <ShopCard key={i} item={item} onBuy={() => onBuy(i)} />
        ))}
      </div>
    </section>
  )
}

function ShopCard({ item, onBuy }: { item: ShopItem; onBuy: () => void }) {
  const traitColor = TRAIT_COLOR[item.traitLabel] ?? 'text-zinc-400'

  return (
    <button
      onClick={item.sold ? undefined : onBuy}
      disabled={item.sold}
      className={[
        'flex-shrink-0 w-[76px] rounded-xl flex flex-col items-center gap-1 py-2 px-1.5 transition-all',
        item.sold
          ? 'opacity-30 cursor-default bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]'
          : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(212,170,80,0.2)] active:scale-95 active:bg-[rgba(212,170,80,0.08)]',
      ].join(' ')}
      aria-label={`Beli ${item.name} seharga ${item.cost} koin${item.sold ? ' (terjual)' : ''}`}
    >
      {/* Avatar */}
      <div className={[
        'w-11 h-11 rounded-lg overflow-hidden border',
        item.sold ? 'border-[rgba(255,255,255,0.08)]' : 'border-[rgba(212,170,80,0.35)]',
      ].join(' ')}>
        <Image
          src={`/assets/ui/avatars/avatar-${item.avatarIndex}.png`}
          alt={item.name}
          width={64}
          height={64}
          className="pixel w-full h-full object-cover"
        />
      </div>

      {/* Name */}
      <span className="text-[10px] font-bold text-[var(--text-primary)] leading-tight text-center">
        {item.name}
      </span>

      {/* Trait */}
      <span className={`text-[8px] font-semibold ${traitColor}`}>
        {item.traitLabel}
      </span>

      {/* Stats row */}
      <div className="flex gap-1.5 text-[8px]">
        <span className="text-red-400">⚔{item.atk}</span>
        <span className="text-pink-400">❤{item.hp}</span>
      </div>

      {/* Cost */}
      <div className="flex items-center gap-0.5 rounded-full bg-[rgba(212,170,80,0.18)] border border-[rgba(212,170,80,0.3)] px-2 py-[2px]">
        <Image src="/assets/ui/icons/icon-03.png" alt="" width={10} height={10} className="pixel" aria-hidden />
        <span className="text-[10px] font-black text-[var(--gold-bright)]">{item.cost}</span>
      </div>
    </button>
  )
}
