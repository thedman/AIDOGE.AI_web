export const WEEK = 604800n
export function completedWeeks(cursor: bigint, globalCursor: bigint, timestamp: bigint) {
  if (cursor <= 0n || cursor % WEEK !== 0n || globalCursor % WEEK !== 0n) throw new Error('Unresolved or invalid claim cursor')
  const activeWeek = timestamp / WEEK * WEEK
  const end = globalCursor < activeWeek ? globalCursor : activeWeek
  if (cursor > activeWeek) throw new Error('Claim cursor is in the future')
  if (cursor > globalCursor) throw new Error('Claim cursor exceeds checkpoint cursor')
  if ((end - cursor) / WEEK > 52n) throw new Error('Reward history exceeds 52-week read limit')
  const weeks: bigint[] = []
  for (let week = cursor; week < end; week += WEEK) weeks.push(week)
  return weeks
}
export function estimateWeek(tokens: bigint, balance: bigint, supply: bigint) {
  if (tokens < 0n || balance < 0n || supply < 0n || balance > supply) throw new Error('Invalid reward snapshot')
  if (supply === 0n) {
    if (tokens !== 0n || balance !== 0n) throw new Error('Funded week has no supply snapshot')
    return 0n
  }
  return tokens * balance / supply
}
