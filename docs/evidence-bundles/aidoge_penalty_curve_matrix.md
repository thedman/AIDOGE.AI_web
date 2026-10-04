# AIDOGE V2 sampled early-withdrawal matrix

## Scope and provenance

- Pinned Arbitrum block: 511692613.
- Block hash: `0x774dfc058258281738e1c32a93372c7b58e57f4123c7623ca1e1eaaafbc822e0`.
- Vault: `0x14c228227b6ba5ca48b69b75e83950c4bb2be69e`.
- Implementation slot: `0x0000000000000000000000001a2d62379dc9c2aded1d1b35bda1c7c9b5b59644`; runtime hash: `0x5ac6b5587499f43b3651444c1155101f9f247bbd798bd04a788cc075840505a3`.
- Synthetic holder: `0x000000000000000000000000000000000000beef`, funded by a token transfer from the recorded holder on the local fork only. Synthetic ETH pays gas.
- Getter `earlyWithdrawBpsPerWeek()`: 96; its role in a complete formula remains subject to bytecode analysis.
- Every case restores an independent snapshot; no live writes, no frontend changes, all dashboard write paths HOLD.

Requested future expirations correspond to 90, 180, 365 and 730 days. These are tested inputs, not a verified list of supported product tiers. Candidate `createLock(uint256,uint256)` is selector-matched and exercised locally; future timestamp inputs create positions whose measured principal is recorded. Stored expiry differs from the requested timestamp. Percentages use actual creation-block-to-stored-expiry duration; "0%" means one second after creation. Setup block timestamps are recorded and may vary slightly between runs. Time advances leave upstream state frozen and do not predict future market conditions.

The initial duration-in-seconds probe reverted with **"can only lock until future"**. Its receipts and failure traces are retained in `aidoge_lock_setup_duration_probe.json`. Corrected calls use an absolute future timestamp; exact expiry rounding and every constraint remain unverified.

The previous **94.08%** deduction was an existing holder position at the pinned block, **not** a newly created Day-0 two-year lock.

## Observed outcomes

Amounts below are AIDOGE token units, not raw units. The JSON stores exact raw values, calldata, all setup/exit receipts and logs, pre/post locks, AIDOGE participant balances, and returned call/state-diff traces. The reported deduction is `(principal debit - user net credit) / principal debit`; it is not automatically labeled token tax. Percentages displayed use integer basis-point truncation.

| Requested days | Elapsed fraction | Status | Actual duration seconds | Principal debit | User net | Effective deduction | Direct non-user recipients / amounts | Direct vault reconciliation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 90 | 0% | success | 7535921 | 1000 | 875.2 | 12.48% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 24.96; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 62.4; 0x000000000000000000000000000000000000dead: 37.44 | Matched |
| 90 | 25% | success | 7535933 | 1000 | 904 | 9.6% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 19.2; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 48; 0x000000000000000000000000000000000000dead: 28.8 | Matched |
| 90 | 50% | success | 7535933 | 1000 | 932.8 | 6.72% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 13.44; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 33.6; 0x000000000000000000000000000000000000dead: 20.16 | Matched |
| 90 | 75% | success | 7535933 | 1000 | 961.6 | 3.84% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 7.68; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 19.2; 0x000000000000000000000000000000000000dead: 11.52 | Matched |
| 180 | 0% | success | 15398333 | 1000 | 750.4 | 24.96% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 49.92; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 124.8; 0x000000000000000000000000000000000000dead: 74.88 | Matched |
| 180 | 25% | success | 15398333 | 1000 | 808 | 19.2% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 38.4; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 96; 0x000000000000000000000000000000000000dead: 57.6 | Matched |
| 180 | 50% | success | 15398333 | 1000 | 875.2 | 12.48% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 24.96; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 62.4; 0x000000000000000000000000000000000000dead: 37.44 | Matched |
| 180 | 75% | success | 15398333 | 1000 | 932.8 | 6.72% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 13.44; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 33.6; 0x000000000000000000000000000000000000dead: 20.16 | Matched |
| 365 | 0% | success | 31123133 | 1000 | 500.8 | 49.92% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 99.84; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 249.6; 0x000000000000000000000000000000000000dead: 149.76 | Matched |
| 365 | 25% | success | 31123134 | 1000 | 625.6 | 37.44% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 74.88; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 187.2; 0x000000000000000000000000000000000000dead: 112.32 | Matched |
| 365 | 50% | success | 31123133 | 1000 | 750.4 | 24.96% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 49.92; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 124.8; 0x000000000000000000000000000000000000dead: 74.88 | Matched |
| 365 | 75% | success | 31123133 | 1000 | 875.2 | 12.48% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 24.96; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 62.4; 0x000000000000000000000000000000000000dead: 37.44 | Matched |
| 730 | 0% | success | 62572733 | 1000 | 1.6 | 99.84% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 199.68; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 499.2; 0x000000000000000000000000000000000000dead: 299.52 | Matched |
| 730 | 25% | success | 62572728 | 1000 | 251.2 | 74.88% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 149.76; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 374.4; 0x000000000000000000000000000000000000dead: 224.64 | Matched |
| 730 | 50% | success | 62572728 | 1000 | 500.8 | 49.92% | 0xed8846e0bba0e2c5a5f706247f733270c519aa86: 99.84; 0x78a0baa38c1859133ea8bb979e7150bca8d0c410: 249.6; 0x000000000000000000000000000000000000dead: 149.76 | Matched |
| 730 | 75% | reverted | 62572730 | 0 | 0 | - | - | Unavailable / review |

## Interpretation and remaining tasks

These finite observations demonstrate changing deductions across sampled lock expirations and elapsed fractions. They do **not** prove continuous linear decay, exact week rounding, a universal ceiling, all supported tiers, or guaranteed future execution. Direct transfer splits must be interpreted separately from token-internal swap and accumulated-fee movements elsewhere in each transaction.

For all 15 successful rows, direct vault transfers sum to the measured principal debit and vault token debit; direct user transfers match the user's measured net credit. The sum of observed AIDOGE participant balance deltas is zero. The failed row leaves principal and token balances unchanged. These checks do not establish completeness for accounts that do not appear in Transfer logs.

1. Retry the 730-day / 75%-elapsed case with more gas. Its 6-million-gas transaction reverted with "SafeERC20: low-level call failed" and the recorded call tree contains internal out-of-gas errors. Principal and token balances did not change; this is not a 100% deduction quote. The attempted restart for a 30-million-gas retry was blocked when the public upstream reported historical state unavailable. Alternative public endpoints also failed historical-state probes. An archive-capable endpoint is now needed at this pinned block. The script's current 30-million cap was not executed for this row.
2. Inspect implementation arithmetic and comparison opcodes/source; test just before/at/after weekly boundaries and lock expiry to identify rounding and the transition to ordinary withdraw.
3. Verify partial/full/zero/oversized arguments and all createLock checks; no minimum-net-receipt protection is established by these successful exits.
4. Reconcile secondary tokens, aggregate supply/weight and token-specific mint/burn state; AIDOGE direct transfer reconciliation is narrower than complete economic attribution.
5. Assess provider trace completeness independently. CallTracer/state-diff presence alone cannot prove no truncation.
6. Review current implementation and state before considering any production integration. A disclosure or estimated payout is not contract-enforced protection.

Reproduce with loopback Anvil 1.7.1 at the pinned block and `node scripts/sweep-penalty-curve.mjs`, then `node scripts/render-penalty-sweep.mjs`. Historical reproduction may require an archive endpoint. Raw artifacts are public-address-only and contain no RPC credentials or personal keys.

For a single retry, set `SWEEP_RETRY_ROW=730:75` before running the sweep. This preserves other rows and nests the earlier selected attempt in the new row. Clear that variable for a full fresh sweep. Snapshot restoration was checked after every completed case; Anvil was stopped. Existing unit suite: 87 passing; production build passing. No commit or push performed.
