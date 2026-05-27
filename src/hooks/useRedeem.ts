'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RedeemResponseDTO, RedeemSummaryDTO } from '@/src/lib/api-types'
import { syncPlayerQuery } from './usePlayer'

export const redeemKeys = {
  summary: () => ['redeem'] as const,
}

async function fetchRedeemSummary(): Promise<RedeemSummaryDTO> {
  const res = await fetch('/api/redeem', { credentials: 'include' })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to fetch redeem data')
  return json.data
}

async function redeemPoints(points: number) {
  const idempotencyKey = crypto.randomUUID()
  const res = await fetch('/api/redeem', {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify({ points, idempotencyKey }),
  })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to redeem points')
  return json.data as RedeemResponseDTO
}

export function useRedeemSummary(enabled = true) {
  return useQuery({
    queryKey:  redeemKeys.summary(),
    queryFn:   fetchRedeemSummary,
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useRedeemPoints() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: redeemPoints,
    scope: { id: 'redeem-points' },
    onSuccess: async (data) => {
      qc.setQueryData<RedeemSummaryDTO>(redeemKeys.summary(), (old) =>
        old ? {
          ...old,
          totalPoints: data.totalPoints,
          maxPoints:   Math.min(
            data.totalPoints,
            Math.max(0, old.dailyLimit - old.redeemedToday - data.redemption.points),
          ),
          redeemedToday: old.redeemedToday + data.redemption.points,
          history:     [data.redemption, ...old.history]
            .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
            .slice(0, 10),
        } : old
      )
      await syncPlayerQuery(qc, { totalPoints: data.totalPoints })
      await qc.invalidateQueries({ queryKey: redeemKeys.summary() })
      await qc.refetchQueries({ queryKey: redeemKeys.summary(), type: 'active' })
    },
  })
}
