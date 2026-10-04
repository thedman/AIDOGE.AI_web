const UINT256_MAX = (1n << 256n) - 1n
const WEEK = 604800n
function checked(value: bigint) {
  if (value < 0n || value > UINT256_MAX) throw new Error('Arithmetic would overflow or underflow uint256.')
  return value
}

export function calculateEarlyWithdrawPenalty(
  principal: bigint, lockExpiryTimestamp: bigint, currentTimestamp: bigint,
  weeklyBps = 96n, redistributeBps = 5000n, burnBps = 3000n,
) {
  for (const value of [principal, lockExpiryTimestamp, currentTimestamp, weeklyBps, redistributeBps, burnBps]) checked(value)
  if (principal === 0n) throw new Error('Principal must be positive.')
  if (currentTimestamp >= lockExpiryTimestamp) throw new Error('Lock expired; early withdrawal is not applicable.')
  if (weeklyBps > 96n || redistributeBps + burnBps > 10000n) throw new Error('Unsupported fee configuration.')
  const weeksRemaining = checked(checked(lockExpiryTimestamp + WEEK) - currentTimestamp) / WEEK
  const penaltyBps = checked(weeksRemaining * weeklyBps)
  const totalPenalty = checked(checked(principal * weeksRemaining) * weeklyBps) / 10000n
  const netPayoutEstimate = checked(principal - totalPenalty)
  const rewarderShare = checked(totalPenalty * redistributeBps) / 10000n
  const burnShare = checked(totalPenalty * burnBps) / 10000n
  const residualRecipientShare = totalPenalty - rewarderShare - burnShare
  return { weeksRemaining, grossPrincipal: principal, penaltyBps, totalPenalty, netPayoutEstimate, rewarderShare, burnShare, residualRecipientShare }
}
