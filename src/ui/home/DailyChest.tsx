'use client'

import { useState } from 'react'
import { Gift, Package, Sparkles } from 'lucide-react'
import { Modal } from '@/src/components/ui/Modal'
import { Button } from '@/src/components/ui/Button'
import { useHomeStore, type ChestReward } from '@/src/lib/homeStore'
import { cn } from '@/src/lib/utils'

export default function DailyChest() {
  const { chestOpened, openChest } = useHomeStore()

  const [animating, setAnimating] = useState(false)
  const [reward,    setReward]    = useState<ChestReward | null>(null)
  const [showModal, setShowModal] = useState(false)

  function handleOpen() {
    if (chestOpened || animating) return
    setAnimating(true)
    setTimeout(() => {
      const r = openChest()
      setAnimating(false)
      if (r) { setReward(r); setShowModal(true) }
    }, 900)
  }

  return (
    <>
      {/* Reward modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="rpg-modal-bar" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-6 text-center">
          {/* Animated icon instead of emoji */}
          <div className="chest-open-anim flex h-16 w-16 items-center justify-center rounded-2xl
                          border-2 border-[rgba(200,146,42,0.5)] bg-[rgba(200,146,42,0.12)]
                          shadow-[0_0_24px_rgba(200,146,42,0.4)]">
            <Sparkles className="h-8 w-8 text-[var(--gold-hi)]" />
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[var(--text-3)]">
              You received
            </p>
            <p className="mt-1 font-display text-[24px] font-bold text-[var(--gold-hi)]">
              +{reward?.amount}
            </p>
            <p className="font-display text-[13px] uppercase tracking-wider text-[var(--gold-mid)]">
              {reward?.label}
            </p>
          </div>
          <div className="divider-gold w-full" />
          <Button variant="pixelGold" size="md" className="w-full" onClick={() => setShowModal(false)}>
            Claim Reward
          </Button>
        </div>
      </Modal>

      {/* Card */}
      <section className="relic-frame px-4 py-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--gold-mid)]" />
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold-hi)]">
              Daily Reward
            </span>
          </div>
          {chestOpened
            ? <span className="text-[9px] uppercase tracking-wider text-[var(--text-3)]">Come back tomorrow</span>
            : <span className="animate-pulse text-[9px] font-semibold uppercase tracking-wider text-[var(--ok)]">Available!</span>
          }
        </div>

        {/* Chest button */}
        <button
          onClick={handleOpen}
          disabled={chestOpened}
          aria-label="Open daily treasure chest"
          className={cn(
            'flex w-full flex-col items-center gap-3 rounded-xl border py-6 transition-all',
            chestOpened
              ? 'cursor-not-allowed border-[var(--border)] bg-white/[0.02] opacity-50'
              : 'cursor-pointer border-[rgba(200,146,42,0.4)] bg-[rgba(200,146,42,0.06)] hover:bg-[rgba(200,146,42,0.1)] chest-glow',
            animating && 'chest-shake'
          )}
        >
          {/* Icon — Gift when available, Package when opened */}
          <div className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all',
            chestOpened
              ? 'border-[var(--border)] bg-white/[0.04] text-[var(--text-3)]'
              : 'border-[rgba(200,146,42,0.45)] bg-[rgba(200,146,42,0.1)] text-[var(--gold-hi)]',
            animating && 'chest-bounce'
          )}>
            {chestOpened
              ? <Package  className="h-7 w-7" />
              : <Gift     className="h-7 w-7" />
            }
          </div>

          <span className="font-display text-[11px] uppercase tracking-[0.15em] text-[var(--text-2)]">
            {chestOpened ? 'Opened' : animating ? 'Opening…' : 'Tap to Open'}
          </span>
        </button>
      </section>
    </>
  )
}
