import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const math = JSON.parse(await readFile('docs/evidence-bundles/aidoge_vault_math_bytecode.json', 'utf8'))
const sweep = JSON.parse(await readFile('docs/evidence-bundles/aidoge_penalty_curve_matrix.json', 'utf8'))
const original = JSON.parse(await readFile('docs/evidence-bundles/aidoge_earlyWithdraw.json', 'utf8'))
const week = BigInt(math.getters.WEEK)
const bps = BigInt(math.getters.earlyWithdrawBpsPerWeek)
const observations = sweep.rows.filter(row => row.status === 'success').map(row => ({
  amount: BigInt(row.principalDebit), expiry: BigInt(row.preLock[1]), time: BigInt(row.exitBlock.timestamp), net: BigInt(row.net), transfers: row.transfers,
}))
observations.push({ amount: BigInt(original.preLock[0]) - BigInt(original.postLock[0]), expiry: BigInt(original.preLock[1]), time: BigInt(original.receipt.logs[0].blockTimestamp), net: BigInt(original.deltas.find(d => d.address === original.holder).delta), transfers: original.transfers })
for (const observation of observations) {
  const periods = (observation.expiry + week - observation.time) / week
  const penalty = observation.amount * periods * bps / 10000n
  const redistribute = penalty * BigInt(math.getters.redistributeBps) / 10000n
  const burn = penalty * BigInt(math.getters.burnBps) / 10000n
  const treasury = penalty - redistribute - burn
  assert.equal(observation.net, observation.amount - penalty)
  const direct = observation.transfers.filter(t => t.args.from.toLowerCase() === math.vault)
  for (const [recipient, expected] of [[math.getters.redistributeAddr, redistribute], ['0x000000000000000000000000000000000000dead', burn], [math.getters.treasuryAddr, treasury]]) {
    assert.equal(direct.filter(t => t.args.to.toLowerCase() === recipient.toLowerCase()).reduce((sum, t) => sum + BigInt(t.args.value), 0n), expected)
  }
}
assert.equal(BigInt(math.getters.MAX_LOCK), 105n * week - 1n)
console.log(`Reconstructed formula matches ${observations.length} successful observations and direct recipient amounts. This is evidence consistency, not verified source or exhaustive boundary coverage.`)
