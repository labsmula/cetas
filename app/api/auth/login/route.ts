/**
 * POST /api/auth/login
 *
 * Called after the wallet signs the short auth challenge from
 * /api/auth/challenge. New wallets get a wallet-only session; /api/player
 * creates the profile after onboarding submits a valid name.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { prisma } from '@/src/lib/db'
import {
  clearChallengeCookie,
  getAuthChallengeFromRequest,
  signSession,
  setSessionCookie,
} from '@/src/lib/session'
import { loginBodySchema, getZodMessage } from '@/src/lib/validation'
import { toPlayerDTO } from '@/src/lib/player-dto'
import type { LoginResponseDTO } from '@/src/lib/api-types'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function expectedMessage(walletAddress: string, nonce: string): string {
  return [
    'Sign in to CETAS.',
    '',
    `Address: ${walletAddress}`,
    `Nonce: ${nonce}`,
  ].join('\n')
}

export async function POST(req: NextRequest) {
  try {
    // ── Validate input ─────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}))
    const parsed = loginBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: getZodMessage(parsed.error) },
        { status: 400 }
      )
    }
    const { wallet, message, signature } = parsed.data

    const challenge = await getAuthChallengeFromRequest(req)
    const allowDevBypass = process.env.NODE_ENV === 'development' && !signature && !message

    if (!allowDevBypass) {
      if (!challenge || challenge.walletAddress !== wallet) {
        return NextResponse.json({ error: 'Auth challenge expired. Please try again.' }, { status: 401 })
      }

      const expected = expectedMessage(wallet, challenge.nonce)
      if (message !== expected || !signature) {
        return NextResponse.json({ error: 'Invalid auth challenge.' }, { status: 401 })
      }

      const valid = await verifyMessage({
        address: wallet as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
      if (!valid) {
        return NextResponse.json({ error: 'Invalid wallet signature.' }, { status: 401 })
      }
    }

    // ── Load existing player ───────────────────────────────────────────────
    let player = await prisma.player.findUnique({ where: { walletAddress: wallet } })
    const isNewPlayer = !player

    if (player) {
      const lastLogin = player.lastLoginAt.toISOString().slice(0, 10)
      const today     = todayKey()
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

      let streakDays = player.streakDays
      if (lastLogin === yesterday)     streakDays += 1
      else if (lastLogin !== today)    streakDays = 1

      player = await prisma.player.update({
        where: { id: player.id },
        data:  { lastLoginAt: new Date(), streakDays },
      })

      if (streakDays >= 3) {
        const streakTask = await prisma.taskDefinition.findUnique({ where: { id: 'streak' } })
        if (streakTask) {
          await prisma.taskProgress.upsert({
            where: {
              playerId_taskId_date: {
                playerId: player.id,
                taskId:   'streak',
                date:     today,
              },
            },
            create: {
              playerId: player.id,
              taskId:   'streak',
              date:     today,
              progress: Math.min(streakDays, streakTask.total),
              done:     true,
            },
            update: {
              progress: Math.min(streakDays, streakTask.total),
              done:     true,
            },
          })
        }
      }
    }

    // ── Issue session JWT ──────────────────────────────────────────────────
    const token = await signSession({
      ...(player && { playerId: player.id }),
      walletAddress: wallet,
    })

    const dto: LoginResponseDTO = {
      walletAddress: wallet,
      isNewPlayer,
      player: player ? toPlayerDTO(player) : null,
    }

    const res = NextResponse.json({ data: dto })
    setSessionCookie(res, token)
    clearChallengeCookie(res)
    return res

  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
