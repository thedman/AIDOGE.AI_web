import { formatUnits } from 'viem'

export function formatTokenAmount(value: bigint, decimals: number): string {
  const whole = value / (10n ** BigInt(decimals))
  for (const [unit, suffix] of [[10n ** 15n, 'Q'], [10n ** 12n, 'T'], [10n ** 9n, 'B'], [10n ** 6n, 'M']] as const) {
    if (whole >= unit) {
      const hundredths = whole * 100n / unit
      return `${hundredths / 100n}.${(hundredths % 100n).toString().padStart(2, '0')}${suffix}`
    }
  }
  return formatUnits(value, decimals)
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div><strong title={detail}>{value}</strong><span>{label}</span></div>
}
