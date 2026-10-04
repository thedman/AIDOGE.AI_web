import { describe, expect, it } from 'vitest'
import { calculateEarlyWithdrawPenalty as calculate } from './vaultCalculator'

describe('reconstructed early exit arithmetic', () => {
  const week = 604800n
  const principal = 1000000000n
  // Successful sweep observations plus the original existing-position observation.
  it.each([13, 10, 7, 4, 26, 20, 13, 7, 52, 39, 26, 13, 104, 78, 52, 98])('matches observed %i-week nominal allocation', weeks => {
    const result = calculate(principal, BigInt(weeks) * week - 1n, 0n)
    const penalty = principal * BigInt(weeks) * 96n / 10000n
    expect(result.weeksRemaining).toBe(BigInt(weeks))
    expect(result.netPayoutEstimate).toBe(principal - penalty)
    expect(result.rewarderShare).toBe(penalty / 2n)
    expect(result.burnShare).toBe(penalty * 3n / 10n)
    expect(result.residualRecipientShare).toBe(penalty / 5n)
  })
  it('steps down after, not at, an exact weekly boundary', () => {
    expect(calculate(principal, week, 0n).weeksRemaining).toBe(2n)
    expect(calculate(principal, week, 1n).weeksRemaining).toBe(1n)
  })
  it('rejects expired locks and zero or negative input', () => {
    expect(() => calculate(principal, 10n, 10n)).toThrow('expired')
    expect(() => calculate(0n, week, 0n)).toThrow('positive')
    expect(() => calculate(-1n, week, 0n)).toThrow('underflow')
  })
  it('rejects over-principal penalties instead of inventing a zero payout', () => {
    expect(() => calculate(principal, 105n * week - 1n, 0n)).toThrow('underflow')
  })
  it('assigns rounding dust to the residual recipient', () => {
    const result = calculate(105n, week - 1n, 0n)
    expect(result.totalPenalty).toBe(1n)
    expect(result.residualRecipientShare).toBe(1n)
  })
  it('uses mutable rates and rejects invalid splits', () => {
    expect(calculate(principal, week - 1n, 0n, 50n, 6000n, 1000n).penaltyBps).toBe(50n)
    expect(() => calculate(principal, week, 0n, 97n)).toThrow('configuration')
    expect(() => calculate(principal, week, 0n, 96n, 9000n, 2000n)).toThrow('configuration')
  })
  it('mirrors checked intermediate overflow', () => {
    expect(() => calculate((1n << 256n) - 1n, week, 0n)).toThrow('overflow')
  })
})
