import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/src/components/ui/Badge'
import { Button } from '@/src/components/ui/Button'
import { Card, CardContent } from '@/src/components/ui/Card'
import { LayoutGrid, Swords, Trophy } from 'lucide-react'

const PREVIEW_UNITS = [
  { src: '/assets/units/blue/warrior/idle.png', name: 'Warrior' },
  { src: '/assets/units/blue/archer/idle.png', name: 'Archer' },
  { src: '/assets/units/blue/lancer/idle.png', name: 'Lancer' },
  { src: '/assets/units/blue/pawn/idle.png', name: 'Pawn' },
]

export default function Home() {
  return (
    <div className="game-bg game-scroll app-frame-outer">
      <div className="mobile-shell">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="flex flex-col items-center gap-3 px-4 pt-8 pb-5">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-1 anim-glow">
            <Image src="/logo.png" alt="CETAS" fill className="object-contain" priority />
          </div>

          <div className="text-center">
            <h1 className="font-display text-[22px] font-bold tracking-wide text-[var(--gold)]">
              CETAS
            </h1>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--text-2)]">
              Auto-battler taktikal. Susun pasukan, tempur otomatis, kalahkan musuh!
            </p>
          </div>

          <div className="flex gap-2">
            <Badge>Fase 1</Badge>
            <Badge>Web2</Badge>
          </div>
        </section>

        {/* ── Preview card ─────────────────────────────── */}
        <section className="px-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-4 gap-0">
                {PREVIEW_UNITS.map((unit) => (
                  <div key={unit.name} className="relative aspect-square border-r border-[var(--border)] last:border-r-0">
                    <Image src={unit.src} alt={unit.name} fill className="object-contain p-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="flex flex-col gap-3 px-4 pt-4 pb-10">
          <Link href="/game">
            <Button variant="gold" size="lg" className="w-full anim-glow">
              <Swords className="h-4 w-4" /> MULAI BERMAIN
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" disabled><Trophy className="h-3 w-3" /> Leaderboard</Button>
            <Button variant="ghost" size="sm" disabled><LayoutGrid className="h-3 w-3" /> Koleksi</Button>
          </div>
          <p className="text-center text-[11px] text-[var(--text-3)]">
            Celo Tactics — Mini App Edition
          </p>
        </section>
      </div>
    </div>
  )
}
