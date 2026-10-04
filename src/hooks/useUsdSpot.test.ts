import { describe, expect, it } from 'vitest'
import { deriveUsd, oracleFailure } from './useUsdSpot'
const price = [1n, 2700n * 10n ** 8n, 9900n, 9900n, 1n] as const
const sequencer = [1n, 0n, 100n, 100n, 1n] as const
describe('USD oracle guards', () => {
  it('accepts healthy rounds', () => expect(oracleFailure(8, price, sequencer, 10000n)).toBeUndefined())
  it('rejects decimals, zero, stale and future answers', () => {
    expect(oracleFailure(18, price, sequencer, 10000n)).toBeTruthy()
    for (const [answer, updated] of [[0n, 9900n], [-1n, 9900n], [1n, 0n], [1n, 10001n], [1n, 6399n]]) expect(oracleFailure(8, [1n, answer, updated, updated, 1n], sequencer, 10000n)).toBeTruthy()
  })
  it('rejects down, unknown, uninitialized and recovering sequencers', () => {
    for (const [answer, started] of [[1n, 100n], [2n, 100n], [0n, 0n], [0n, 6400n], [0n, 10001n]]) expect(oracleFailure(8, price, [1n, answer, started, started, 1n], 10000n)).toBeTruthy()
  })
  it('avoids intermediate rounding and floating point', () => {
    expect(deriveUsd(2_000_000n, 10n ** 18n, 2700n * 10n ** 8n)).toBe('$1350')
    expect(deriveUsd(10n ** 24n, 10n ** 18n, 2700n * 10n ** 8n)).toBe('$0.0000000000000027')
    expect(deriveUsd(0n, 1n, 1n)).toBeUndefined()
  })
})
