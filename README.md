# CETAS - Celo Tactics

> Tactical auto-battler mini app for MiniPay, built around short strategy sessions, persistent endless progress, referrals, daily quests, and leaderboard competition.

CETAS is a mobile-first strategy game designed for the Celo and MiniPay ecosystem. The game combines an auto-battler combat loop with lightweight Web3 onboarding: players enter through their MiniPay wallet, create a commander profile, build a formation, recruit troops, and push as far as possible through endless stages.

The current implementation is a browser-based mini app with an off-chain game backend for player profiles, progression, quests, referrals, and leaderboard data. The on-chain layer is planned for assets, match stakes, and settlement-related mechanics.

---

## What This Project Is

CETAS is not a landing page or a generic wallet demo. It is a playable tactical game with a real app shell:

- A MiniPay-ready wallet flow.
- Player onboarding with custom name and avatar.
- A home dashboard for profile, points, streaks, daily chest, and quest status.
- An endless auto-battler game mode.
- Persistent game progress: stage, HP, gold, bench, and board formation are saved.
- A referral system where players can invite or be invited.
- A leaderboard based on score, streak, and endless-stage performance.
- Mobile-first UI tuned for MiniPay-style small viewports.

The core product goal is simple: make a fast, repeatable tactical game loop that can later support on-chain ownership and reward mechanics without forcing the player through wallet popups during normal play.

---

## Player Experience

1. **Open CETAS inside MiniPay**
   - The app auto-connects to the injected MiniPay wallet.
   - In development, the app can use a mock wallet so the flow can be tested locally.

2. **Create a commander profile**
   - New players choose their name and avatar before a player profile is created.
   - This avoids duplicate default-name conflicts and keeps onboarding intentional.

3. **Use the hub**
   - The home screen shows points, streak, level, daily reward status, quest progress, and endless-stage progress.
   - Friends, tasks, and leaderboard are separate app tabs.

4. **Play endless mode**
   - The player buys troops from the shop, places them on the board, rerolls, merges units, and starts battle.
   - Combat runs automatically.
   - Units recall after battle. They do not permanently die from combat; only selling removes them.
   - Progress is saved so the run can continue later.

5. **Grow through social and daily systems**
   - Daily quests and chest rewards increase points.
   - Referral rewards connect both sides of the referral graph.
   - Leaderboard ranks players by progression and score signals.

---

## Game Loop

CETAS uses a prep-and-battle loop.

### Prep Phase

Players make tactical decisions before combat:

- Recruit troops from the shop.
- Reroll the shop with gold.
- Move troops between bench and board.
- Merge three matching troops into stronger star levels.
- Inspect enemy intel before starting the fight.

### Battle Phase

Once battle starts, the board plays out automatically:

- Units move, attack, take damage, and fire projectiles based on their role.
- Battle has a time cap and speed-up behavior.
- The result updates HP, gold, stage, board slots, and saved progress.
- The next stage increases pressure and difficulty.

### Endless Progression

Endless mode is stage-based. The player keeps pushing forward as long as HP and strategy hold up.

Saved run data includes:

- Current stage.
- Current HP.
- Current gold.
- Board slots.
- Board formation.
- Bench troops.

---

## Core Systems

### MiniPay Wallet And Session

The app follows the MiniPay expectation that users should not be asked to sign a message just to access the app.

- Wallet connection uses `wagmi` and the injected MiniPay provider.
- Authentication creates an httpOnly JWT session cookie.
- The session is tied to the wallet address.
- API routes resolve the player from the session.

### Player Profile

The player profile stores:

- Wallet address.
- Name and avatar.
- Total points.
- Level.
- Streak days.
- Endless stage.
- Saved game progress.
- Referral code.
- Remaining name changes.

### Tasks And Daily Rewards

Daily engagement systems are backed by database records:

- Task definitions define daily quest targets and rewards.
- Task progress resets by date.
- Daily chest claims are unique per player per day.
- Reward claims refetch and sync player points.

### Friends And Referrals

The referral system supports a two-way friend list:

- A player can submit another player's referral code.
- The referrer can claim referral rewards.
- Both inbound and outbound relationships can be displayed in the friends page.

### Leaderboard

Leaderboard entries are derived from player activity and progression signals:

- Score / points.
- Wins and losses.
- Streak.
- Best streak.
- Endless-stage progress.
- Tier.

---

## Tech Stack

| Layer | Stack |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + custom CSS tokens |
| Game State | Zustand |
| Server State | TanStack Query |
| Renderer | Canvas 2D |
| Wallet | wagmi + viem |
| Auth Session | httpOnly JWT cookie with `jose` |
| Database | Neon Serverless Postgres |
| ORM | Prisma 7 with Neon adapter |
| Audio | Howler.js |
| Icons | Lucide React |

---

## Project Structure

```text
app/
  api/                    API routes for auth, player, tasks, rewards, friends, leaderboard
  game/                   Game page
  home/                   Home dashboard
  friends/                Referral and friend network page
  leaderboard/            Ranking page
  tasks/                  Daily quest page

src/
  components/ui/          Reusable UI primitives
  game/
    core/                 Shared game types and unit factory
    entities/             Static unit definitions
    renderer/             Canvas board renderer
    state/                Zustand game store
    systems/              Pure board, shop, and combat systems
  hooks/                  TanStack Query and app hooks
  lib/                    Auth, DB, validation, DTOs, utilities
  providers/              Wallet and query providers
  ui/                     Feature UI components

prisma/
  schema.prisma           Database schema
  migrations/             SQL migrations
  seed.mjs                Task seed script

public/
  assets/                 Game sprites, avatars, UI icons, FX, music
  logo.png                CETAS logo

contract/
  src/                    Planned on-chain contracts
  script/                 Contract deployment scripts
  test/                   Contract tests
```

---

## Running Locally

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SESSION_SECRET="replace-with-a-long-random-secret"
```

Generate Prisma client and prepare the database:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

For MiniPay device testing, expose the local server through HTTPS, for example:

```bash
ngrok http 3000
```

Then open the HTTPS URL inside MiniPay Developer Mode.

---

## Useful Commands

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Apply migrations in development
npm run db:seed      # Seed task definitions
npm run db:studio    # Open Prisma Studio
```

---

## Current Product Status

Implemented:

- MiniPay-style wallet auto-connect flow.
- Cookie-based app session.
- Player onboarding.
- Endless battle mode.
- Saved stage and saved run progress.
- Shop, bench, board placement, reroll, merge, and recall mechanics.
- Daily chest.
- Daily tasks.
- Referral/friends system.
- Leaderboard.
- Mobile-first game HUD.

Planned:

- On-chain unit ownership.
- Match entry fee and prize pool settlement.
- Stronger anti-cheat / deterministic battle settlement.
- Multiplayer or asynchronous PvP.
- More troop classes, traits, stages, and enemy patterns.
- More complete tokenomics and reward sinks.

---

## Design Direction

CETAS uses a compact fantasy-tactics interface built for repeated play on small mobile screens:

- No-scroll game screen where the board, controls, and tray fit in one viewport.
- Pixel-art assets with gold and navy UI framing.
- Dense but readable HUD for HP, gold, stage, slots, and phase state.
- Shop, bench, intel, and battle log live inside a fixed bottom tray.
- Loading and empty states are explicit so data fetching does not look broken.

The design priority is not a marketing page. The first screen after onboarding should feel like a playable mini app.
