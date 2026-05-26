'use client'

import { useState, useEffect, useRef } from 'react'
import { playerNameSchema, getZodMessage } from '@/src/lib/validation'

export type NameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export interface CheckNameResult {
  status:  NameStatus
  message: string
}

/**
 * Debounced name availability checker.
 * Validates format with Zod client-side first, then hits the API.
 *
 * @param name        The name string to check
 * @param debounceMs  Debounce delay (default 400ms)
 * @param skip        Set true to skip checking entirely
 */
export function useCheckName(
  name: string,
  debounceMs = 400,
  skip = false,
): CheckNameResult {
  const [result, setResult] = useState<CheckNameResult>({ status: 'idle', message: '' })
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = name.trim()

    if (!trimmed || skip) {
      setResult({ status: 'idle', message: '' })
      return
    }

    // Client-side Zod validation first (instant, no network)
    const zodResult = playerNameSchema.safeParse(trimmed)
    if (!zodResult.success) {
      setResult({ status: 'invalid', message: getZodMessage(zodResult.error) })
      return
    }

    setResult({ status: 'checking', message: '' })

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      try {
        const res = await fetch(
          `/api/player/check-name?name=${encodeURIComponent(trimmed)}`,
          { signal: abortRef.current.signal }
        )
        const json = await res.json() as {
          data?: { available: boolean; name: string; reason?: string }
          error?: string
        }

        if (json.data?.available) {
          setResult({ status: 'available', message: 'Name is available' })
        } else {
          setResult({
            status:  'taken',
            message: json.data?.reason ?? 'Name is already taken',
          })
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setResult({ status: 'idle', message: '' })
        }
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [name, debounceMs, skip])

  return result
}
