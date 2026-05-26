import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/db'
import { requireAuth } from '@/src/lib/api-auth'
import { z } from 'zod'
import { getZodMessage } from '@/src/lib/validation'

const endlessProgressSchema = z.object({
  stage: z.number().int().min(1).max(10_000),
})

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req)
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = endlessProgressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: getZodMessage(parsed.error) }, { status: 400 })
    }

    await prisma.player.updateMany({
      where: {
        id: auth.playerId,
        endlessStage: { lt: parsed.data.stage },
      },
      data: { endlessStage: parsed.data.stage },
    })

    const player = await prisma.player.findUnique({
      where: { id: auth.playerId },
      select: { endlessStage: true },
    })

    return NextResponse.json({
      data: {
        endlessStage: player?.endlessStage ?? parsed.data.stage,
      },
    })
  } catch (err) {
    console.error('[POST /api/player/endless]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
