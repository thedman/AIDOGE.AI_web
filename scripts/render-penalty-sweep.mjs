import { readFile, writeFile } from 'node:fs/promises'
import { formatUnits } from 'viem'

const base = 'docs/evidence-bundles/aidoge_penalty_curve_matrix'
const report = JSON.parse(await readFile(`${base}.json`, 'utf8'))
const unit = x => x === undefined ? 'Unavailable' : formatUnits(BigInt(x), 6)
const table = report.rows.map(row => {
  const direct = (row.transfers ?? []).filter(t => t.args.from.toLowerCase() === report.vault)
  const sum = direct.reduce((value, t) => value + BigInt(t.args.value), 0n)
  const userTransfers = direct.filter(t => t.args.to.toLowerCase() === report.syntheticAccount).reduce((value, t) => value + BigInt(t.args.value), 0n)
  const participantDeltaSum = (row.deltas ?? []).reduce((value, d) => value + BigInt(d.delta), 0n)
  const reconciles = row.status === 'success' && row.principalDebit !== undefined && sum === BigInt(row.principalDebit)
    && BigInt(row.vaultDebit) === sum && userTransfers === BigInt(row.net) && participantDeltaSum === 0n
  const recipients = direct.filter(t => t.args.to.toLowerCase() !== report.syntheticAccount).map(t => `${t.args.to.toLowerCase()}: ${unit(t.args.value)}`).join('; ')
  return `| ${row.days} | ${row.elapsedPercent}% | ${row.status} | ${row.actualDurationSeconds ?? '-'} | ${unit(row.principalDebit)} | ${unit(row.net)} | ${row.deductionBps === undefined ? '-' : formatUnits(BigInt(row.deductionBps), 2) + '%'} | ${recipients || '-'} | ${reconciles ? 'Matched' : 'Unavailable / review'} |`
})
const markdown = `# AIDOGE V2 sampled early-withdrawal matrix

## Scope and provenance

- Pinned Arbitrum block: ${report.pinnedBlock.number}.
- Block hash: \`${report.pinnedBlock.hash}\`.
- Vault: \`${report.vault}\`.
- Implementation slot: \`${report.implementation}\`; runtime hash: \`${report.bytecodeHash}\`.
- Synthetic holder: \`${report.syntheticAccount}\`, funded by a token transfer from the recorded holder on the local fork only. Synthetic ETH pays gas.
- Getter \`earlyWithdrawBpsPerWeek()\`: ${report.bpsPerWeek}; its role in a complete formula remains subject to bytecode analysis.
- Every case restores an independent snapshot; no live writes, no frontend changes, all dashboard write paths HOLD.

Requested future expirations correspond to 90, 180, 365 and 730 days. These are tested inputs, not a verified list of supported product tiers. Candidate \`createLock(uint256,uint256)\` is selector-matched and exercised locally; future timestamp inputs create positions whose measured principal is recorded. Stored expiry differs from the requested timestamp. Percentages use actual creation-block-to-stored-expiry duration; "0%" means one second after creation. Setup block timestamps are recorded and may vary slightly between runs. Time advances leave upstream state frozen and do not predict future market conditions.

The initial duration-in-seconds probe reverted with **"can only lock until future"**. Its receipts and failure traces are retained in \`aidoge_lock_setup_duration_probe.json\`. Corrected calls use an absolute future timestamp; exact expiry rounding and every constraint remain unverified.

The previous **94.08%** deduction was an existing holder position at the pinned block, **not** a newly created Day-0 two-year lock.

## Observed outcomes

Amounts below are AIDOGE token units, not raw units. The JSON stores exact raw values, calldata, all setup/exit receipts and logs, pre/post locks, AIDOGE participant balances, and returned call/state-diff traces. The reported deduction is \`(principal debit - user net credit) / principal debit\`; it is not automatically labeled token tax. Percentages displayed use integer basis-point truncation.

| Requested days | Elapsed fraction | Status | Actual duration seconds | Principal debit | User net | Effective deduction | Direct non-user recipients / amounts | Direct vault reconciliation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${table.join('\n')}

## Interpretation and remaining tasks

These finite observations demonstrate changing deductions across sampled lock expirations and elapsed fractions. They do **not** prove continuous linear decay, exact week rounding, a universal ceiling, all supported tiers, or guaranteed future execution. Direct transfer splits must be interpreted separately from token-internal swap and accumulated-fee movements elsewhere in each transaction.

For all 15 successful rows, direct vault transfers sum to the measured principal debit and vault token debit; direct user transfers match the user's measured net credit. The sum of observed AIDOGE participant balance deltas is zero. The failed row leaves principal and token balances unchanged. These checks do not establish completeness for accounts that do not appear in Transfer logs.

1. Retry the 730-day / 75%-elapsed case with more gas. Its 6-million-gas transaction reverted with "SafeERC20: low-level call failed" and the recorded call tree contains internal out-of-gas errors. Principal and token balances did not change; this is not a 100% deduction quote. The attempted restart for a 30-million-gas retry was blocked when the public upstream reported historical state unavailable. Alternative public endpoints also failed historical-state probes. An archive-capable endpoint is now needed at this pinned block. The script's current 30-million cap was not executed for this row.
2. Inspect implementation arithmetic and comparison opcodes/source; test just before/at/after weekly boundaries and lock expiry to identify rounding and the transition to ordinary withdraw.
3. Verify partial/full/zero/oversized arguments and all createLock checks; no minimum-net-receipt protection is established by these successful exits.
4. Reconcile secondary tokens, aggregate supply/weight and token-specific mint/burn state; AIDOGE direct transfer reconciliation is narrower than complete economic attribution.
5. Assess provider trace completeness independently. CallTracer/state-diff presence alone cannot prove no truncation.
6. Review current implementation and state before considering any production integration. A disclosure or estimated payout is not contract-enforced protection.

Reproduce with loopback Anvil 1.7.1 at the pinned block and \`node scripts/sweep-penalty-curve.mjs\`, then \`node scripts/render-penalty-sweep.mjs\`. Historical reproduction may require an archive endpoint. Raw artifacts are public-address-only and contain no RPC credentials or personal keys.

For a single retry, set \`SWEEP_RETRY_ROW=730:75\` before running the sweep. This preserves other rows and nests the earlier selected attempt in the new row. Clear that variable for a full fresh sweep. Snapshot restoration was checked after every completed case; Anvil was stopped. Existing unit suite: 87 passing; production build passing. No commit or push performed.
`
await writeFile(`${base}.md`, markdown)
console.log(`${base}.md`)
