export const MIN_REDEEM_POINTS = 100
export const MAX_REDEEM_POINTS = 1_000_000
export const DAILY_REDEEM_LIMIT_POINTS = 5_000
export const CELO_PER_POINT = 0.0001
const CELO_WEI_PER_POINT = BigInt('100000000000000')
export const REDEEM_RATE_LABEL = '1,000 pts = 0.1 CELO'

export function pointsToCeloAmount(points: number): string {
  const celo = points * CELO_PER_POINT
  return celo.toFixed(6).replace(/\.?0+$/, '')
}

export function pointsToTokenAmountWei(points: number): bigint {
  return BigInt(points) * CELO_WEI_PER_POINT
}
