'use client'

interface RoundModalProps {
  show: boolean
  title: string
  titleColor: string
  description: string
  buttonLabel: string
  onNext: () => void
}

export default function RoundModal({
  show, title, titleColor, description, buttonLabel, onNext,
}: RoundModalProps) {
  if (!show) return null

  const isWin = title.includes('Menang')
  const isGameOver = title.includes('Game Over')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(6,4,12,0.82)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="anim-pop w-full max-w-[320px] rounded-2xl border border-[rgba(212,170,80,0.3)] bg-[#13111a] shadow-[0_0_60px_rgba(0,0,0,0.7)] overflow-hidden">

        {/* Color band at top */}
        <div
          className="h-1.5 w-full"
          style={{ background: titleColor }}
        />

        <div className="px-6 py-5 flex flex-col items-center gap-3 text-center">
          {/* Big emoji */}
          <div className="text-[48px] leading-none mt-1">
            {isGameOver ? '☠️' : isWin ? '🏆' : '😤'}
          </div>

          {/* Title */}
          <h2
            id="modal-title"
            className="text-[22px] font-black leading-tight"
            style={{ color: titleColor }}
          >
            {title.replace(/^[^\s]+\s/, '')} {/* strip emoji from title since we show it above */}
          </h2>

          {/* Description */}
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-[rgba(255,255,255,0.07)]" />

          {/* CTA */}
          <button
            onClick={onNext}
            autoFocus
            className={`btn w-full h-12 rounded-xl text-[13px] font-black ${
              isWin ? 'btn-gold' : 'btn-red'
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
