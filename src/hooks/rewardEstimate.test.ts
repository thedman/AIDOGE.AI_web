import { expect, it } from 'vitest'
import { completedWeeks, estimateWeek, WEEK } from './rewardEstimate'

it('excludes the active week even if the checkpoint cursor is ahead', () => {
  expect(completedWeeks(10n * WEEK, 13n * WEEK, 12n * WEEK + 500n)).toEqual([10n * WEEK, 11n * WEEK])
})
it('starts at the user claim cursor and stops at the checkpoint cursor', () => {
  expect(completedWeeks(10n * WEEK, 11n * WEEK, 15n * WEEK)).toEqual([10n * WEEK])
  expect(completedWeeks(10n * WEEK, 10n * WEEK, 15n * WEEK)).toEqual([])
})
it.each([[0n, WEEK], [WEEK + 1n, 3n * WEEK], [2n * WEEK, WEEK], [WEEK, 60n * WEEK]])('rejects unresolved/inconsistent or excessive history %s %s', (cursor, global) => {
  expect(() => completedWeeks(cursor, global, 100n * WEEK)).toThrow()
})
it('floors each weekly payout using bigint precision', () => {
  expect(estimateWeek(100n, 1n, 3n)).toBe(33n)
  expect(estimateWeek(60300939507684098072n, 10n, 10n)).toBe(60300939507684098072n)
})
it('preserves zero without manufacturing it for an invalid snapshot', () => {
  expect(estimateWeek(0n, 0n, 0n)).toBe(0n)
  expect(() => estimateWeek(1n, 0n, 0n)).toThrow()
  expect(() => estimateWeek(1n, 2n, 1n)).toThrow()
})
