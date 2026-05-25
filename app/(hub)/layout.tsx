import LandingClient from '@/src/ui/LandingClient'
import AppHeader from '@/src/ui/hub/AppHeader'

/**
 * Shared layout for all hub pages: /home, /tasks, /leaderboard
 * - Dark RPG background
 * - Consistent top header (logo + version pill)
 * - Bottom padding so content clears the fixed BottomNav
 * - Music client (keeps audio playing across navigation)
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="home-bg game-scroll app-frame-outer mobile-shell flex flex-col overflow-hidden">
      {/* Curtain fade-in on every hub page */}
      <div className="curtain" aria-hidden />

      <AppHeader />

      <main className="flex flex-col gap-3 px-4 pb-24 pt-2">
        {children}
      </main>

      {/* Keeps music alive when navigating between hub pages */}
      <LandingClient />
    </div>
  )
}
