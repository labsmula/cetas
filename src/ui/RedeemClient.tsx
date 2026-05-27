'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Coins,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
} from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { EmptyState } from '@/src/components/ui/EmptyState'
import { LoadingRows } from '@/src/components/ui/LoadingState'
import { StatTile } from '@/src/components/ui/StatTile'
import { usePlayer } from '@/src/hooks/usePlayer'
import { useRedeemPoints, useRedeemSummary } from '@/src/hooks/useRedeem'
import { useWallet } from '@/src/providers/WalletProvider'
import { cn } from '@/src/lib/utils'
import type { PointRedemptionDTO } from '@/src/lib/api-types'
import { formatCelo, formatPoints, formatShortDate } from '@/src/lib/format'
import {
  CELO_PER_POINT,
  DAILY_REDEEM_LIMIT_POINTS,
  MIN_REDEEM_POINTS,
  REDEEM_RATE_LABEL,
} from '@/src/lib/redeem-config'

const QUICK_PRESETS = [250, 500, 1000, 2500]

export default function RedeemClient() {
  const { authStatus, player: walletPlayer } = useWallet()
  const { data: queryPlayer, isLoading: playerLoading } = usePlayer(authStatus === 'authenticated')
  const isReady = authStatus === 'authenticated'
  const { data: summary, isLoading: redeemLoading, isFetching: redeemFetching, refetch } = useRedeemSummary(isReady)
  const redeemMutation = useRedeemPoints()
  const player = queryPlayer ?? walletPlayer

  const [amount, setAmount] = useState('500')
  const [toast, setToast] = useState<string | null>(null)
  const pointsBalance = summary?.totalPoints ?? player?.totalPoints ?? 0
  const minPoints = summary?.minPoints ?? MIN_REDEEM_POINTS
  const maxPoints = summary?.maxPoints ?? pointsBalance
  const rateLabel = summary?.rateLabel ?? REDEEM_RATE_LABEL
  const celoPerPoint = summary?.celoPerPoint ?? CELO_PER_POINT
  const dailyLimit = summary?.dailyLimit ?? DAILY_REDEEM_LIMIT_POINTS
  const redeemedToday = summary?.redeemedToday ?? 0

  const parsedAmount = Math.max(0, Number.parseInt(amount.replace(/\D/g, ''), 10) || 0)
  const estimate = useMemo(() => parsedAmount * celoPerPoint, [parsedAmount, celoPerPoint])
  const dailyRemaining = Math.max(0, dailyLimit - redeemedToday)
  const clampedMax = Math.min(pointsBalance || maxPoints, maxPoints, dailyRemaining || maxPoints)
  const progressPct = dailyLimit > 0
    ? Math.min(100, Math.round((redeemedToday / dailyLimit) * 100))
    : 0

  const validationMessage =
    authStatus !== 'authenticated' ? 'Connect your wallet to prepare a redeem request.'
    : parsedAmount < minPoints ? `Minimum redeem is ${formatPoints(minPoints)} pts.`
    : pointsBalance > 0 && parsedAmount > pointsBalance ? 'You do not have enough points.'
    : parsedAmount > maxPoints ? `Redeem cap is ${formatPoints(maxPoints)} pts right now.`
    : dailyRemaining > 0 && parsedAmount > dailyRemaining ? 'This exceeds the mock daily limit.'
    : null

  const canRedeem = !validationMessage && parsedAmount > 0 && !redeemMutation.isPending

  async function handleRedeem() {
    if (!canRedeem) return

    setToast(null)
    try {
      await redeemMutation.mutateAsync(parsedAmount)
      setToast('Redeem request queued for contract settlement.')
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Redeem failed.')
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-shrink-0 items-center gap-2 px-1">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(200,146,42,0.3)] bg-[rgba(200,146,42,0.08)]">
          <Image
            src="/assets/celo/logo-symbol.png"
            alt=""
            width={18}
            height={18}
            loading="eager"
            unoptimized
            className="object-contain"
            aria-hidden
          />
        </div>
        <div>
          <h1 className="font-display text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--gold-hi)]">
            Redeem Vault
          </h1>
          <p className="text-[9px] uppercase tracking-wider text-[var(--text-3)]">
            Points to CELO
          </p>
        </div>
        <Badge className={cn(
          'ml-auto rounded-full border px-2 py-1 font-display text-[8px] font-bold uppercase tracking-wider',
          summary
            ? 'border-[rgba(61,186,106,0.35)] bg-[rgba(61,186,106,0.1)] text-[var(--ok)]'
            : 'border-[rgba(224,128,32,0.35)] bg-[rgba(224,128,32,0.1)] text-[var(--warn)]'
        )}>
          {redeemLoading || redeemFetching ? 'Syncing' : summary ? 'Mock live' : 'Mock mode'}
        </Badge>
      </div>

      <div className="game-scroll flex flex-1 flex-col gap-3 overflow-y-auto">
        <section className="relic-frame overflow-hidden px-4 py-4">
          <div className="relative z-[1] flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-gold)] bg-[rgba(200,146,42,0.1)] shadow-[0_0_24px_rgba(200,146,42,0.12)]">
              <Sparkles className="h-5 w-5 text-[var(--gold-hi)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold-mid)]">
                Contract not armed yet
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-2)]">
                This screen previews the redeem flow. Requests are mock records until the CETAS redeem contract is deployed.
              </p>
            </div>
          </div>
        </section>

        <section className="grid flex-shrink-0 grid-cols-2 gap-2">
          <StatTile
            icon={<Coins className="h-4 w-4 text-[var(--gold-hi)]" />}
            label="Points"
            value={playerLoading && !player ? '...' : formatPoints(pointsBalance)}
          />
          <StatTile
            icon={ <Image
            src="/assets/celo/logo-symbol.png"
            alt=""
            width={18}
            height={18}
            loading="eager"
            unoptimized
            className="object-contain"
            aria-hidden
          />}
            label="Est. CELO"
            value={formatCelo(estimate)}
          />
        </section>

        <section className="relic-frame flex flex-col gap-3 px-4 py-4">
          <div className="relative z-[1] flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[var(--gold-mid)]" />
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-[var(--gold-hi)]">
              Redeem Amount
            </span>
            <span className="ml-auto text-[9px] uppercase tracking-wider text-[var(--text-3)]">
              {rateLabel}
            </span>
          </div>

          <div className="relative z-[1] rounded-xl border border-[var(--border)] bg-[rgba(4,16,33,0.78)] px-3 py-3">
            <label htmlFor="redeem-points" className="text-[9px] uppercase tracking-wider text-[var(--text-3)]">
              Points to redeem
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="redeem-points"
                inputMode="numeric"
                name="redeem-points"
                type="text"
                pattern="[0-9]*"
                autoComplete="off"
                value={amount}
                onChange={event => setAmount(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="min-w-0 flex-1 rounded-md bg-transparent font-display text-[30px] font-black leading-none tabular-nums text-[var(--gold-hi)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-hi)]"
                aria-describedby="redeem-validation"
              />
              <Button
                type="button"
                variant="pixelGhost"
                size="sm"
                onClick={() => setAmount(String(Math.max(minPoints, clampedMax)))}
                className="h-8 px-2.5 font-display text-[9px] uppercase tracking-wider text-[var(--gold-hi)]"
              >
                Max
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {QUICK_PRESETS.map(preset => (
                <Button
                  key={preset}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAmount(String(Math.min(preset, maxPoints)))}
                  className={cn(
                    'h-8 rounded-lg border px-2 py-1.5 font-display text-[9px] font-bold tabular-nums transition-[background-color,border-color,color,transform]',
                    parsedAmount === preset
                      ? 'border-[var(--gold-hi)] bg-[var(--gold-hi)] text-[var(--bg-deep)]'
                      : 'border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--text-2)]'
                  )}
                >
                  {formatPoints(preset)}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative z-[1] grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <MiniQuote label="Spend" value={`${formatPoints(parsedAmount)} pts`} />
            <ChevronRight className="h-4 w-4 text-[var(--gold-mid)]" />
            <MiniQuote label="Receive" value={`${formatCelo(estimate)} CELO`} accent />
          </div>

          <div className="relative z-[1]">
            <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-wider text-[var(--text-3)]">
              <span>Mock daily limit</span>
              <span>{formatPoints(redeemedToday)} / {formatPoints(dailyLimit)}</span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill bg-gradient-to-r from-[var(--ally)] to-[#8fffe0]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {validationMessage && (
            <p id="redeem-validation" className="relative z-[1] flex items-center gap-1.5 text-[10px] text-[var(--warn)]">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              {validationMessage}
            </p>
          )}

          {toast && (
            <p className="relative z-[1] flex items-center gap-1.5 rounded-lg border border-[rgba(61,186,106,0.25)] bg-[rgba(61,186,106,0.08)] px-3 py-2 text-[10px] text-[var(--ok)]">
              <Check className="h-3 w-3 flex-shrink-0" />
              {toast}
            </p>
          )}

          <Button
            variant="pixelGold"
            size="lg"
            onClick={handleRedeem}
            disabled={!canRedeem}
            className="relative z-[1] w-full font-display text-[12px] font-black uppercase tracking-[0.16em]"
          >
            {redeemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            Queue Mock Redeem
          </Button>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--ally)]" />
            <p className="font-display text-[10px] uppercase tracking-wider text-[var(--text-3)]">
              Redeem History
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { redeemMutation.reset(); void refetch() }}
              className="ml-auto h-7 w-7 rounded-lg p-0 text-[var(--text-3)]"
              aria-label="Refresh redeem history"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {redeemLoading ? (
            <LoadingRows count={3} />
          ) : (summary?.history.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Wallet className="h-8 w-8" />}
              title="No redeem requests yet"
              description="Queue a mock redeem to preview the flow."
            />
          ) : (
            summary?.history.map(item => <HistoryRow key={item.id} item={item} />)
          )}
        </section>
      </div>
    </div>
  )
}

function MiniQuote({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[rgba(4,16,33,0.65)] px-3 py-2 text-center">
      <p className="text-[8px] uppercase tracking-wider text-[var(--text-3)]">{label}</p>
      <p className={cn(
        'mt-0.5 font-display text-[12px] font-bold tabular-nums',
        accent ? 'text-[#8fffe0]' : 'text-[var(--text-1)]'
      )}>
        {value}
      </p>
    </div>
  )
}

function HistoryRow({ item }: { item: PointRedemptionDTO }) {
  const statusStyle = {
    pending: 'border-[rgba(224,128,32,0.35)] bg-[rgba(224,128,32,0.1)] text-[var(--warn)]',
    mocked: 'border-[rgba(160,216,255,0.28)] bg-[rgba(160,216,255,0.08)] text-[var(--ally)]',
    confirmed: 'border-[rgba(61,186,106,0.35)] bg-[rgba(61,186,106,0.1)] text-[var(--ok)]',
    failed: 'border-[rgba(224,48,48,0.35)] bg-[rgba(224,48,48,0.1)] text-[var(--enemy)]',
  }[item.status]

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[rgba(4,16,33,0.72)] px-3 py-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(200,146,42,0.25)] bg-[rgba(200,146,42,0.08)]">
         <Image
            src="/assets/celo/logo-symbol.png"
            alt=""
            width={18}
            height={18}
            loading="eager"
            unoptimized
            className="object-contain"
            aria-hidden
          />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[12px] font-bold text-[var(--text-1)]">
          {formatPoints(item.points)} pts {'->'} {formatCelo(Number(item.celoAmount))} CELO
        </p>
        <p className="text-[9px] text-[var(--text-3)]">
          {formatShortDate(item.createdAt)}
        </p>
      </div>
      <Badge className={cn('rounded-md px-2 py-1 font-display text-[8px] font-bold uppercase tracking-wider', statusStyle)}>
        {item.status}
      </Badge>
    </div>
  )
}
