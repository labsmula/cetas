import LandingClient from '@/src/ui/LandingClient'
import AppHeader from '@/src/ui/hub/AppHeader'

/**
 * Shared layout for all hub pages: /home, /tasks, /leaderboard, /friends
 *
 * Structure:
 *   app-frame-outer  — full viewport, flex row, justify-center
 *   └─ mobile-shell  — max-w-[430px], h-dvh, flex col, NO page scroll
 *       ├─ curtain   — fixed overlay, fades out on mount
 *       ├─ AppHeader — fixed height header
 *       └─ main      — flex-1, overflow-hidden — pages control their own inner scroll
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame-outer">
      <div className="mobile-shell home-bg flex flex-col overflow-hidden" style={{ height: '100dvh' }}>

        {/* Page-transition curtain */}
        <div className="curtain" aria-hidden />

        <AppHeader />

        <main className="relative z-10 flex flex-1 flex-col overflow-hidden px-4 pb-[72px] pt-2">
          {children}
        </main>

        {/* Keeps music alive when navigating between hub pages */}
        <LandingClient />

      </div>
    </div>
  )
}
