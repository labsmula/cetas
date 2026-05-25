import Link from 'next/link'
import { ArrowLeft, Crown, Medal, Shield, Swords, Trophy } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'

const RANKS = [
  { name: 'AetherKnight', score: 4280, wins: 38, streak: 9, tier: 'Mythic' },
  { name: 'LunaTactician', score: 4015, wins: 34, streak: 7, tier: 'Grandmaster' },
  { name: 'RavenBlade', score: 3890, wins: 32, streak: 6, tier: 'Grandmaster' },
  { name: 'Zaky', score: 3510, wins: 27, streak: 4, tier: 'Diamond' },
  { name: 'CrimsonWolf', score: 3325, wins: 24, streak: 3, tier: 'Diamond' },
  { name: 'SilentMonk', score: 3190, wins: 23, streak: 2, tier: 'Platinum' },
]

export default function LeaderboardPage() {
  return (
    <main className="game-bg game-scroll app-frame-outer">
      <div className="mobile-shell px-3 py-3">
        <header className="relic-frame rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
          <Link href="/" aria-label="Back to menu">
            <Button variant="pixelGhost" size="sm" className="h-8 w-8 px-0"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex-1">
            <p className="font-display text-[10px] tracking-[0.2em] uppercase text-[var(--text-2)]">Hall of Champions</p>
            <h1 className="font-heading text-[28px] leading-none text-[var(--gold-hi)]">Leaderboard</h1>
          </div>
          <Crown className="h-5 w-5 text-[var(--gold-hi)]" />
        </header>

        <section className="relic-frame rounded-xl p-2.5 space-y-2">
          {RANKS.map((p, i) => (
            <article key={p.name} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-2 flex items-center gap-2">
              <div className="w-8 text-center font-display text-[16px] text-[var(--gold-hi)]">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-display text-[14px] text-[var(--text-1)]">{p.name}</p>
                <p className="text-[10px] text-[var(--text-2)]">Tier {p.tier}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[13px] font-bold text-[var(--gold-hi)]">{p.score}</p>
                <p className="text-[9px] text-[var(--text-3)]">rating</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-3 gap-2 mt-3">
          <div className="relic-frame rounded-lg p-2 text-center">
            <Trophy className="h-4 w-4 mx-auto text-[var(--gold-hi)]" />
            <p className="text-[10px] text-[var(--text-2)] mt-1">Top Wins</p>
            <p className="font-mono text-[12px] text-[var(--text-1)]">38</p>
          </div>
          <div className="relic-frame rounded-lg p-2 text-center">
            <Swords className="h-4 w-4 mx-auto text-[var(--enemy)]" />
            <p className="text-[10px] text-[var(--text-2)] mt-1">Best Streak</p>
            <p className="font-mono text-[12px] text-[var(--text-1)]">9</p>
          </div>
          <div className="relic-frame rounded-lg p-2 text-center">
            <Shield className="h-4 w-4 mx-auto text-[var(--ally)]" />
            <p className="text-[10px] text-[var(--text-2)] mt-1">Defenses</p>
            <p className="font-mono text-[12px] text-[var(--text-1)]">127</p>
          </div>
        </section>

        <Link href="/game" className="block mt-3">
          <Button variant="pixelGold" size="lg" className="w-full"><Medal className="h-4 w-4" /> Challenge Arena</Button>
        </Link>
      </div>
    </main>
  )
}
