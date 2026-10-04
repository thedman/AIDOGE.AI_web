import { describe, expect, it } from 'vitest'
import { poolSpotPrice } from './usePoolStats'

describe('pool spot ratio', () => {
  it('accounts for six and eighteen decimals', () => {
    expect(poolSpotPrice(2_000_000n, 10n ** 18n)).toBe('0.5')
  })
  it('preserves low token price precision', () => {
    expect(poolSpotPrice(23_240_394_956_885_417_514_874n, 92_873_515_926_993_803_818n)).toMatch(/^0\.000000000000003/)
  })
  it('does not quote empty reserves', () => {
    expect(poolSpotPrice(0n, 1n)).toBeUndefined()
    expect(poolSpotPrice(1n, 0n)).toBeUndefined()
  })
})
