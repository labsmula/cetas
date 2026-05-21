import Link from 'next/link'
import Image from 'next/image'

// Avatar indices to show as hero characters
const HERO_AVATARS = [3, 7, 12, 18]

export default function Home() {
  return (
    <div className="home-bg min-h-dvh flex flex-col items-center justify-between px-5 py-safe select-none"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 28px)', paddingBottom: 'max(env(safe-area-inset-bottom), 28px)' }}>

      {/* ── Network badge ── */}
      <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
        style={{ background: 'rgba(212,170,80,0.1)', border: '1px solid rgba(212,170,80,0.25)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse" />
        <span className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--gold)' }}>
          Celo L2 · MiniPay
        </span>
      </div>

      {/* ── Hero section ── */}
      <div className="flex flex-col items-center gap-6 text-center w-full max-w-[340px]">

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[11px] font-bold tracking-[0.3em] uppercase"
            style={{ color: 'var(--gold-dim)' }}>
            ⚔ &nbsp;Auto-Battler Roguelike&nbsp; ⚔
          </div>
          <h1 className="text-[44px] font-black tracking-tight leading-none"
            style={{
              color: 'var(--gold-bright)',
              textShadow: '0 0 40px rgba(212,170,80,0.4), 0 2px 0 rgba(0,0,0,0.8)',
            }}>
            CELO
          </h1>
          <h1 className="text-[44px] font-black tracking-tight leading-none -mt-2"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 2px 0 rgba(0,0,0,0.8)',
            }}>
            TACTICS
          </h1>
        </div>

        {/* Hero avatars — 4 characters in a row */}
        <div className="flex items-end justify-center gap-3">
          {HERO_AVATARS.map((n, i) => {
            const sizes = [52, 64, 64, 52]
            const offsets = [4, 0, 0, 4]
            const num = String(n).padStart(2, '0')
            return (
              <div
                key={n}
                className="rounded-xl overflow-hidden pixel anim-float"
                style={{
                  width: sizes[i],
                  height: sizes[i],
                  marginBottom: offsets[i],
                  animationDelay: `${i * 0.4}s`,
                  border: '1.5px solid rgba(212,170,80,0.3)',
                  background: 'rgba(255,255,255,0.04)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                <Image
                  src={`/assets/ui/avatars/avatar-${num}.png`}
                  alt=""
                  width={256}
                  height={256}
                  className="pixel w-full h-full object-cover"
                  aria-hidden="true"
                  priority={i < 2}
                />
              </div>
            )
          })}
        </div>

        {/* Description */}
        <p className="text-[13px] leading-relaxed max-w-[260px]"
          style={{ color: 'var(--text-secondary)' }}>
          Susun pasukan, lawan musuh, menangkan arena.<br />
          Fully on-chain · Gasless via Biconomy.
        </p>

        {/* Stats row */}
        <div className="flex gap-3 w-full justify-center">
          {[
            { label: 'Ronde', value: '5' },
            { label: 'Unit', value: '4' },
            { label: 'Max TPS', value: '1.4K' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <span className="text-[18px] font-black" style={{ color: 'var(--gold-bright)' }}>{s.value}</span>
              <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-col items-center gap-3 w-full max-w-[300px]">
        <Link
          href="/game"
          className="btn btn-gold w-full h-14 text-[16px] rounded-2xl anim-glow"
          aria-label="Mulai bermain"
        >
          ⚔️ &nbsp; MULAI BERMAIN
        </Link>

        <div className="flex gap-2 w-full">
          <button className="btn btn-ghost flex-1 h-10 text-[11px] rounded-xl" disabled>
            🏆 Leaderboard
          </button>
          <button className="btn btn-ghost flex-1 h-10 text-[11px] rounded-xl" disabled>
            🎴 Koleksi
          </button>
        </div>

        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Segera hadir di MiniPay
        </p>
      </div>

    </div>
  )
}
