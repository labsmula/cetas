/**
 * Session management — httpOnly JWT cookie.
 *
 * Auth flow:
 * - /api/auth/challenge sets a short-lived httpOnly challenge cookie
 * - wallet signs the challenge
 * - /api/auth/login verifies the signature and issues this session cookie
 * - httpOnly cookie prevents XSS from stealing the token
 *
 * Uses `jose` (Edge-compatible, no Node.js crypto dependency).
 */
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'cetas_session'
const CHALLENGE_COOKIE_NAME = 'cetas_auth_challenge'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30  // 30 days
const CHALLENGE_MAX_AGE = 60 * 5 // 5 minutes

export interface SessionPayload {
  playerId?:     string
  walletAddress: string
  /** issued-at (unix seconds) */
  iat?: number
  /** expiry (unix seconds) */
  exp?: number
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET env var is not set')
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters')
  return new TextEncoder().encode(secret)
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

export async function signSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function signAuthChallenge(payload: { walletAddress: string; nonce: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifyAuthChallenge(token: string): Promise<{ walletAddress: string; nonce: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.walletAddress !== 'string' || typeof payload.nonce !== 'string') return null
    return { walletAddress: payload.walletAddress, nonce: payload.nonce }
  } catch {
    return null
  }
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Cookie helpers (Server Components / Route Handlers) ─────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  })
}

export function setChallengeCookie(res: NextResponse, token: string): void {
  res.cookies.set(CHALLENGE_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   CHALLENGE_MAX_AGE,
    path:     '/',
  })
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
}

export function clearChallengeCookie(res: NextResponse): void {
  res.cookies.set(CHALLENGE_COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
}

// ─── Middleware helper — read session from request ────────────────────────────

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export async function getAuthChallengeFromRequest(
  req: NextRequest
): Promise<{ walletAddress: string; nonce: string } | null> {
  const token = req.cookies.get(CHALLENGE_COOKIE_NAME)?.value
  if (!token) return null
  return verifyAuthChallenge(token)
}
