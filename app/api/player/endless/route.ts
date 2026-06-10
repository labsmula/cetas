import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { requireAuth } from '@/src/lib/api-auth'
import { z } from 'zod'
import { getZodMessage } from '@/src/lib/validation'
import {
  INITIAL_BOARD_SLOTS,
  REROLLS_PER_STAGE,
  MAX_BOARD_SLOTS,
  MAX_GOLD,
  ENDLESS_STAGE_CETAS_REWARD,
  ENDLESS_STAGE_XP_REWARD,
} from '@/src/game/constants'
import { UNIT_DEFS } from '@/src/game/entities/unitDefs'
import { grantCetasReward } from '@/src/lib/onchain'

const VALID_UNIT_IDS = new Set(UNIT_DEFS.map(unit => unit.id))

const savedUnitSchema = z.object({
  id: z.string().min(1).max(64).refine(id => VALID_UNIT_IDS.has(id), 'Invalid unit'),
  stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

const savedBoardSchema = z.array(
  z.array(savedUnitSchema.nullable()).length(8)
).length(8)

const savedBenchSchema = z.array(savedUnitSchema.nullable()).length(8)

const endlessProgressSchema = z.object({
  stage: z.number().int().min(1).max(10_000),
  hp: z.number().int().min(0).max(100).optional(),
  gold: z.number().int().min(0).max(MAX_GOLD).optional(),
  maxBoardSlots: z.number().int().min(1).max(MAX_BOARD_SLOTS).optional(),
  rerollsLeft: z.number().int().min(0).max(REROLLS_PER_STAGE).optional(),
  board: savedBoardSchema.optional(),
  bench: savedBenchSchema.optional(),
  /** true when a battle was just completed (win or loss) */
  battleCompleted: z.boolean().optional(),
  /** true when the battle was won */
  battleWon: z.boolean().optional(),
}).strict()

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function levelForExperience(experience: number): number {
  return Math.max(1, Math.floor(experience / 500) + 1)
}

// ── Rate limiter: per-wallet, in-memory ──────────────────────────────────────
// Prevents rapid-fire replay of stage advances from the same wallet.
// Reset every RATE_WINDOW_MS. Allows up to RATE_MAX_CALLS within that window.

const RATE_WINDOW_MS = 60_000 // 1 minute
const RATE_MAX_CALLS = 10      // max endless POSTs per wallet per minute

const rateBucket = new Map<string, { count: number; resetAt: number }>()

function checkEndlessRateLimit(wallet: string, ip: string | null): boolean {
  const now = Date.now()
  // Garbage-collect stale entries opportunistically
  rateBucket.forEach((v, k) => {
    if (v.resetAt <= now) rateBucket.delete(k)
  })

  const key = `${wallet}:${ip ?? 'no-ip'}`
  const entry = rateBucket.get(key)
  if (!entry || entry.resetAt <= now) {
    rateBucket.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= RATE_MAX_CALLS
}

async function incrementTaskProgress(playerId: string, taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) return
  const date = todayKey()
  const defs = await prisma.taskDefinition.findMany({
    where: { id: { in: taskIds }, active: true },
    select: { id: true, total: true },
  })

  for (const def of defs) {
    const progress = await prisma.taskProgress.upsert({
      where:  { playerId_taskId_date: { playerId, taskId: def.id, date } },
      create: {
        playerId,
        taskId: def.id,
        date,
        progress: 1,
        done: def.total <= 1,
      },
      update: { progress: { increment: 1 } },
    })

    const capped = Math.min(progress.progress, def.total)
    const done = capped >= def.total
    if (progress.progress !== capped || progress.done !== done) {
      await prisma.taskProgress.update({
        where: { id: progress.id },
        data: { progress: capped, done },
      })
    }
  }
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req)
  if (error) return error

  // ── Rate limit check ──────────────────────────────────────────────────────
  const clientIp = req.headers.get('x-forwarded-for')
    ?? req.headers.get('x-real-ip')
    ?? null
  if (!checkEndlessRateLimit(auth.walletAddress, clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Slow down.' },
      { status: 429 },
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = endlessProgressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: getZodMessage(parsed.error) }, { status: 400 })
    }

    const current = await prisma.player.findUnique({ where: { id: auth.playerId } })
    if (!current) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const nextStage = Math.max(1, Math.min(parsed.data.stage, current.endlessStage + 1))
    const nextBest = Math.max(current.bestStage, nextStage)
    const stageAdvanced = nextStage > current.endlessStage
    const progress = parsed.data.board && parsed.data.bench
      ? {
          stage: nextStage,
          hp: parsed.data.hp ?? 100,
          gold: parsed.data.gold ?? 0,
          maxBoardSlots: parsed.data.maxBoardSlots ?? INITIAL_BOARD_SLOTS,
          rerollsLeft: parsed.data.rerollsLeft ?? REROLLS_PER_STAGE,
          board: parsed.data.board,
          bench: parsed.data.bench,
        }
      : undefined

    const nextExperience = current.experience + (stageAdvanced ? ENDLESS_STAGE_XP_REWARD : 0)

    await prisma.player.update({
      where: { id: auth.playerId },
      data: {
        endlessStage: { set: nextStage },
        bestStage: { set: nextBest },
        ...(stageAdvanced && {
          experience: { increment: ENDLESS_STAGE_XP_REWARD },
          level:      { set: levelForExperience(nextExperience) },
        }),
        ...(progress && { gameProgress: progress }),
      },
    })

    // Increment play tasks on every completed battle (win or loss)
    if (parsed.data.battleCompleted) {
      const battleTasks = ['play1', 'play3']
      if (parsed.data.battleWon) battleTasks.push('win1')
      await incrementTaskProgress(auth.playerId, battleTasks)
    }

    // ── On-chain reward: re-enabled with idempotency ─────────────────────────
    let pointsAwarded = 0
    let onchainReward: { status: string; txHashes: string[]; error?: string } = {
      status: 'skipped',
      txHashes: [],
    }

    if (stageAdvanced && parsed.data.battleWon) {
      // Idempotency: use playerId + stage as unique claim key
      const claimKey = `endless_stage_${nextStage}`
      const existingClaim = await prisma.pointRedemption.findFirst({
        where: { playerId: auth.playerId, idempotencyKey: claimKey },
        select: { id: true, txHash: true },
      })

      if (existingClaim) {
        // Already claimed this stage — return previous result
        onchainReward = {
          status: 'already_claimed',
          txHashes: existingClaim.txHash ? [existingClaim.txHash] : [],
        }
      } else {
        // Claim reward on-chain
        try {
          const wallet = auth.walletAddress as `0x${string}`
          const txHashes = await grantCetasReward(wallet, ENDLESS_STAGE_CETAS_REWARD)

          // Record idempotency
          await prisma.pointRedemption.create({
            data: {
              playerId: auth.playerId,
              walletAddress: auth.walletAddress,
              idempotencyKey: claimKey,
              points: ENDLESS_STAGE_CETAS_REWARD,
              celoAmount: '0',
              tokenAmountWei: BigInt(0),
              status: 'confirmed',
              txHash: txHashes[0] ?? null,
              submittedAt: new Date(),
              confirmedAt: new Date(),
            },
          })

          pointsAwarded = ENDLESS_STAGE_CETAS_REWARD
          onchainReward = { status: 'success', txHashes }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown on-chain reward error'
          console.error('[POST /api/player/endless] on-chain reward failed:', msg)
          onchainReward = { status: 'failed', txHashes: [], error: msg }
        }
      }
    }

    const player = await prisma.player.findUnique({
      where: { id: auth.playerId },
      select: { endlessStage: true, bestStage: true, gameProgress: true, totalPoints: true, experience: true, level: true },
    })

    return NextResponse.json({
      data: {
        endlessStage: player?.endlessStage ?? parsed.data.stage,
        bestStage: player?.bestStage ?? nextBest,
        gameProgress: player?.gameProgress ?? progress ?? null,
        totalPoints: player?.totalPoints ?? current.totalPoints,
        experience: player?.experience ?? current.experience,
        level: player?.level ?? current.level,
        pointsAwarded,
        experienceAwarded: stageAdvanced ? ENDLESS_STAGE_XP_REWARD : 0,
        onchainReward,
      },
    })
  } catch (err) {
    console.error('[POST /api/player/endless]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
