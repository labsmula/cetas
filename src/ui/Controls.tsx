'use client'

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

export default function Controls({
  phase, hasSelected,
  secondsLeft, speedUp,
  onReroll, onSell, onBattle,
}: ControlsProps) {
  const isBattle = phase === 'battle'

  if (!isBattle) {
    return (
      <div className="flex gap-2 px-1">
        {/* Reroll */}
        <button
          onClick={onReroll}
          className="btn btn-blue flex-1 h-12 rounded-xl text-[12px]"
        >
          🎲 Reroll <span className="opacity-70 text-[10px]">−2🪙</span>
        </button>

        {/* Sell — contextual */}
        {hasSelected && (
          <button
            onClick={onSell}
            className="btn btn-sm-red w-12 h-12 rounded-xl text-[13px]"
            aria-label="Jual unit terpilih"
          >
            💰
          </button>
        )}

        {/* Battle */}
        <button
          onClick={onBattle}
          className="btn btn-red flex-1 h-12 rounded-xl text-[13px] font-black"
        >
          ⚔️ BATTLE
        </button>
      </div>
    )
  }

  // Battle phase — timer bar
  const pct = speedUp ? 100 : (secondsLeft / 30) * 100
  const barColor = speedUp
    ? 'bg-orange-400'
    : secondsLeft <= 5
    ? 'bg-red-500'
    : secondsLeft <= 10
    ? 'bg-yellow-400'
    : 'bg-emerald-500'

  const timeLabel = speedUp
    ? '⚡ 3× SPEED'
    : `${secondsLeft}s`

  const timeLabelColor = speedUp
    ? 'text-orange-400'
    : secondsLeft <= 5
    ? 'text-red-400 anim-pulse'
    : secondsLeft <= 10
    ? 'text-yellow-400'
    : 'text-emerald-400'

  return (
    <div className="panel px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <span className="text-[16px] flex-shrink-0">⏱</span>

        {/* Time label */}
        <span className={`font-mono font-black text-[16px] tabular-nums w-[64px] flex-shrink-0 ${timeLabelColor}`}>
          {timeLabel}
        </span>

        {/* Bar */}
        <div className="flex-1 h-3 rounded-full overflow-hidden bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.06)]">
          {speedUp ? (
            <div
              className="h-full w-full bg-orange-400"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.25) 4px,rgba(255,255,255,0.25) 8px)',
                animation: 'stripe 0.4s linear infinite',
              }}
            />
          ) : (
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        {/* Status */}
        <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
          {speedUp ? 'Speed up!' : 'Berlangsung…'}
        </span>
      </div>
    </div>
  )
}
