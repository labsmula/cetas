const pointsFormatter = new Intl.NumberFormat('en-US')

const celoFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
})

const shortDateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPoints(value: number): string {
  return pointsFormatter.format(value)
}

export function formatCelo(value: number): string {
  return celoFormatter.format(value)
}

export function formatShortDate(value: string | Date): string {
  return shortDateFormatter.format(typeof value === 'string' ? new Date(value) : value)
}
