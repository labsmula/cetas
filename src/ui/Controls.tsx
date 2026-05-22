'use client'

import { Button } from '@/src/components/ui/Button'

interface ControlsProps {
  phase: 'prep' | 'battle'
  hasSelected: boolean
  battleRunning: boolean
  secondsLeft: number
  speedUp: boolean
  onReroll: () => void
  onSell: () => void
  onBattle: () => void
}

const BATTLE_SECONDS = 30

export default function Controls({
  phase, hasSelected, secondsLeft, speedUp, onReroll, onSell, onBattle,
}: ControlsProps) {
  if (phase !== 'battle') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={onReroll} variant="blue" size="md" className="flex-1 text-[12px]">
            🎲 Reroll <span className="text-[10px] opacity-65">−2🪙</span>
          </Button>
          {hasSelected && (
            <Button onClick={onSell} variant="danger" size="md" className="w-12 px-0 text-[14px]" aria-label="Jual unit">
              💰
            </Button>
          )}
          <Button onClick={onBattle} variant="red" size="md" className="flex-1 text-[13px] font-black">
            ⚔️ BATTLE
          </Button>
        </div>
        <p className="text-center text-[10px] text-[var(--text-3)]">
          Tap unit → tap tile untuk menempatkan
        </p>
      </div>
    )
  }

  const pct = speedUp ? 100 : (secondsLeft / BATTLE_SECONDS) * 100
  const barColor = speedUp ? 'var(--enemy)'
    : secondsLeft <= 5 ? 'var(--enemy)'
    : secondsLeft <= 10 ? 'var(--warn)'
    : 'var(--ok)'
  const timeLabel = speedUp ? '⚡ 3×' : `${secondsLeft}s`

  return (
    <div className="surface flex items-center gap-2.5 px-3 py-2.5">
      <span className="flex-shrink-0 text-[15px]">⏱</span>
      <span className="w-[52px] flex-shrink-0 font-mono text-[16px] font-black tabular-nums" style={{ color: barColor }}>
        {timeLabel}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/5 bg-white/7">
        {speedUp ? (
          <div className="h-full w-full bg-[var(--enemy)] [animation:stripe_0.4s_linear_infinite] [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.22)_4px,rgba(255,255,255,0.22)_8px)]" />
        ) : (
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
        )}
      </div>
      <span className="flex-shrink-0 text-[10px] text-[var(--text-3)]">
        {speedUp ? 'Speed up!' : 'Berlangsung…'}
      </span>
    </div>
  )
}
