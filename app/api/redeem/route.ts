import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { requireAuth } from '@/src/lib/api-auth'
import { getZodMessage, redeemPointsBodySchema } from '@/src/lib/validation'
import type { PointRedemptionDTO, RedeemSummaryDTO } from '@/src/lib/api-types'
import {
  CELO_PER_POINT,
  DAILY_REDEEM_LIMIT_POINTS,
  MIN_REDEEM_POINTS,
  REDEEM_RATE_LABEL,
  pointsToCeloAmount,
  pointsToTokenAmountWei,
} from '@/src/lib/redeem-config'

function toRedemptionDTO(row: {
  id: string
  points: number
  celoAmount: string
  status: string
  txHash: string | null
  createdAt: Date
}): PointRedemptionDTO {
  return {
    id:         row.id,
    points:     row.points,
    celoAmount: row.celoAmount,
    status:     ['mocked', 'pending', 'confirmed', 'failed'].includes(row.status)
      ? row.status as PointRedemptionDTO['status']
      : 'mocked',
    txHash:     row.txHash,
    createdAt:  row.createdAt.toISOString(),
  }
}

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req)
  if (error) return error

  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [player, history, todayRows] = await Promise.all([
      prisma.player.findUnique({
        where:  { id: auth.playerId },
        select: { totalPoints: true },
      }),
      prisma.pointRedemption.findMany({
        where:   { playerId: auth.playerId },
        orderBy: { createdAt: 'desc' },
        take:    10,
      }),
      prisma.pointRedemption.findMany({
        where: {
          playerId: auth.playerId,
          createdAt: { gte: startOfToday },
          status: { not: 'failed' },
        },
        select: { points: true },
      }),
    ])

    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    const redeemedToday = todayRows.reduce((sum, item) => sum + item.points, 0)
    const dailyRemaining = Math.max(0, DAILY_REDEEM_LIMIT_POINTS - redeemedToday)

    const dto: RedeemSummaryDTO = {
      totalPoints: player.totalPoints,
      minPoints:   MIN_REDEEM_POINTS,
      maxPoints:   Math.min(player.totalPoints, dailyRemaining),
      rateLabel:   REDEEM_RATE_LABEL,
      celoPerPoint: CELO_PER_POINT,
      dailyLimit:  DAILY_REDEEM_LIMIT_POINTS,
      redeemedToday,
      mock:        true,
      history:     history.map(toRedemptionDTO),
    }

    return NextResponse.json({ data: dto })
  } catch (err) {
    console.error('[GET /api/redeem]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req)
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = redeemPointsBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: getZodMessage(parsed.error) }, { status: 400 })
    }

    const { points, idempotencyKey } = parsed.data
    const celoAmount = pointsToCeloAmount(points)
    const tokenAmountWei = pointsToTokenAmountWei(points)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [updated, redemption] = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${auth.playerId}))`

      if (idempotencyKey) {
        const existing = await tx.pointRedemption.findUnique({
          where: {
            playerId_idempotencyKey: {
              playerId: auth.playerId,
              idempotencyKey,
            },
          },
        })
        if (existing) {
          const player = await tx.player.findUnique({
            where: { id: auth.playerId },
            select: { totalPoints: true },
          })
          if (!player) throw new Error('PLAYER_NOT_FOUND')
          return [player, existing] as const
        }
      }

      const todayRows = await tx.pointRedemption.findMany({
        where: {
          playerId: auth.playerId,
          createdAt: { gte: startOfToday },
          status: { not: 'failed' },
        },
        select: { points: true },
      })
      const redeemedToday = todayRows.reduce((sum, item) => sum + item.points, 0)
      if (redeemedToday + points > DAILY_REDEEM_LIMIT_POINTS) {
        throw new Error('DAILY_LIMIT_EXCEEDED')
      }

      const update = await tx.player.updateMany({
        where: { id: auth.playerId, totalPoints: { gte: points } },
        data:  { totalPoints: { decrement: points } },
      })

      if (update.count === 0) {
        throw new Error('INSUFFICIENT_POINTS')
      }

      const player = await tx.player.findUnique({
        where:  { id: auth.playerId },
        select: { totalPoints: true, walletAddress: true },
      })

      if (!player) throw new Error('PLAYER_NOT_FOUND')

      const created = await tx.pointRedemption.create({
        data: {
          playerId: auth.playerId,
          walletAddress: player.walletAddress,
          idempotencyKey,
          points,
          celoAmount,
          tokenAmountWei,
          status: 'mocked',
        },
      })

      return [player, created] as const
    })

    return NextResponse.json({
      data: {
        totalPoints: updated.totalPoints,
        redemption:  toRedemptionDTO(redemption),
        mock:        true,
        rateLabel:   REDEEM_RATE_LABEL,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_POINTS') {
      return NextResponse.json({ error: 'Not enough points to redeem.' }, { status: 400 })
    }
    if (err instanceof Error && err.message === 'DAILY_LIMIT_EXCEEDED') {
      return NextResponse.json({ error: 'Daily mock redeem limit reached.' }, { status: 400 })
    }

    console.error('[POST /api/redeem]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
