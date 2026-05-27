import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { walletAddressSchema, getZodMessage } from '@/src/lib/validation'
import { setChallengeCookie, signAuthChallenge } from '@/src/lib/session'

function buildMessage(walletAddress: string, nonce: string): string {
  return [
    'Sign in to CETAS.',
    '',
    `Address: ${walletAddress}`,
    `Nonce: ${nonce}`,
  ].join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = walletAddressSchema.safeParse(body.wallet)
    if (!parsed.success) {
      return NextResponse.json({ error: getZodMessage(parsed.error) }, { status: 400 })
    }

    const walletAddress = parsed.data
    const nonce = randomUUID()
    const message = buildMessage(walletAddress, nonce)
    const token = await signAuthChallenge({ walletAddress, nonce })

    const res = NextResponse.json({ data: { message, nonce } })
    setChallengeCookie(res, token)
    return res
  } catch (err) {
    console.error('[POST /api/auth/challenge]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
