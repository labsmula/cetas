import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/src/components/ui/Badge'
import { Button } from '@/src/components/ui/Button'
import { Swords, Shield, Trophy } from 'lucide-react'

const FX_PARTICLES = [
  { src: '/assets/ui/icons/icon-01.png', cls: 'particle p1' },
  { src: '/assets/ui/icons/icon-02.png', cls: 'particle p2' },
  { src: '/assets/ui/icons/icon-04.png', cls: 'particle p3' },
  { src: '/assets/ui/icons/icon-05.png', cls: 'particle p4' },
  { src: '/assets/ui/icons/icon-06.png', cls: 'particle p5' },
  { src: '/assets/ui/icons/icon-07.png', cls: 'particle p6' },
  { src: '/assets/ui/icons/icon-08.png', cls: 'particle p7' },
  { src: '/assets/ui/icons/icon-09.png', cls: 'particle p8' },
  { src: '/assets/ui/icons/icon-10.png', cls: 'particle p9' },
  { src: '/assets/ui/icons/icon-11.png', cls: 'particle p10' },
  { src: '/assets/ui/icons/icon-12.png', cls: 'particle p11' },
]

const FEATURES = [
  { icon: <Swords className="h-4 w-4" />, label: 'Auto Battle' },
  { icon: <Shield className="h-4 w-4" />, label: 'Taktik Grid' },
  { icon: <Trophy className="h-4 w-4" />, label: '5 Ronde' },
]

export default function Home() {
  return (
    <div className="landing-bg game-scroll app-frame-outer mobile-shell relative overflow-hidden flex flex-col">

      {/* Overlay */}
      <div className="landing-overlay" aria-hidden />

      {/* Particles */}
      {FX_PARTICLES.map((p, i) => (
        <Image key={i} src={p.src} alt="" width={18} height={18} className={p.cls} aria-hidden />
      ))}

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center gap-2 px-4 pt-10 pb-4">
        <p className="font-display text-[10px] uppercase tracking-[0.32em] text-[rgba(245,216,120,0.7)]">
          Dark Fantasy Auto Battler
        </p>
        <Image
          src="/logo.png"
          alt="CETAS"
          width={420} height={420}
          className="object-contain drop-shadow-[0_0_40px_rgba(200,146,42,0.4)]"
          priority
        />
      </section>

      {/* ── Feature pills ── */}
      <section className="relative z-10 flex justify-center gap-2 px-4 pb-4">
        {FEATURES.map((f, i) => (
          <Badge
            key={i}
            className="flex items-center gap-1 border-[rgba(200,146,42,0.3)] bg-[rgba(200,146,42,0.08)] text-[var(--gold-mid)]"
          >
            {f.icon}
            {f.label}
          </Badge>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 flex flex-col gap-3 px-4 pb-6">
        <Link href="/game">
          <Button variant="pixelGold" size="lg" className="w-full text-[15px] font-black tracking-widest anim-glow">
            <Swords className="h-5 w-5" />
            MULAI BERMAIN
          </Button>
        </Link>

        <p className="text-center font-display text-[10px] uppercase tracking-[0.2em] text-[rgba(245,216,120,0.5)]">
          Celo Tactics · Mini App Edition
        </p>
      </section>
    </div>
  )
}
