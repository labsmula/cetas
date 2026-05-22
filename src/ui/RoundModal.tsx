'use client'

import { Button } from '@/src/components/ui/Button'

interface RoundModalProps {
  show: boolean; title: string; titleColor: string
  description: string; buttonLabel: string; onNext: () => void
}

export default function RoundModal({ show, title, titleColor, description, buttonLabel, onNext }: RoundModalProps) {
  if (!show) return null

  const isWin = title.includes('Menang')
  const isGameOver = title.includes('Game Over')
  const emoji = isGameOver ? '☠️' : isWin ? '🏆' : '😤'
  const btnVariant: 'gold' | 'red' = isWin ? 'gold' : 'red'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-5 backdrop-blur-[6px]"
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div className="anim-pop w-full max-w-[300px] overflow-hidden rounded-2xl border border-[rgba(212,170,80,0.28)] bg-[var(--bg-panel)] shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: titleColor }} />

        <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
          <div className="text-[52px] leading-none">{emoji}</div>

          <h2 id="modal-title" className="text-[20px] font-black" style={{ color: titleColor }}>
            {title.replace(/^[^\s]+\s/, '')}
          </h2>

          <p className="text-[13px] leading-relaxed text-[var(--text-2)]">
            {description}
          </p>

          <div className="h-px w-full bg-[var(--border)]" />

          <Button
            onClick={onNext}
            variant={btnVariant}
            size="md"
            autoFocus
            className="w-full text-[13px] font-black"
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
