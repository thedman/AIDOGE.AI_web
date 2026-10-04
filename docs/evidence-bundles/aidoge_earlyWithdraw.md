# AIDOGE V2 earlyWithdraw: local fork evidence

## Scope and provenance

Executed on Windows on October 4, 2026 using Anvil 1.7.1 and the public upstream https://arb1.arbitrum.io/rpc. No live transaction was broadcast. Dashboard writes remain HOLD.

- Chain: Arbitrum One, 42161.
- Pinned block: 511692613.
- Pinned hash: `0x774dfc058258281738e1c32a93372c7b58e57f4123c7623ca1e1eaaafbc822e0`.
- Vault: `0x14c228227b6ba5ca48b69b75e83950c4bb2be69e`.
- Implementation checked: `0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644`.
- Holder: `0x125d9b63de41f6dbbc138522b87f23ca190722fe`.
- Operation: `earlyWithdraw(uint256)`, input 1000000000 raw units.
- Selector: `0x6b5b9696`.
- Calldata: `0x6b5b9696000000000000000000000000000000000000000000000000000000003b9aca00`.
- Local transaction: `0x6931cfac7cb1c802303aec4558ce9d418bdb270c3f32611501216582717234e3` (not an Arbiscan transaction).

The adjacent `aidoge_earlyWithdraw.json` contains implementation bytecode, all receipt logs/topics, receipt status/gas fields, callTracer output with logs requested, prestateTracer diff, locks, and pre/post balance accounting. These are raw provider outputs; completeness is not independently proven by log counts.

Receipt: success; gasUsed 1544006; effectiveGasPrice 1013480170 wei; 143 logs. The local execution block is 511692614. Gas is paid using synthetic local ETH funding, not the holder's live wallet.

## Accounting reconciliation

All quantities below are raw AIDOGE units (6 decimals).

- Principal before: 19278288644511375357; after: 19278288643511375357; reduction: 1000000000.
- Unlock timestamp remains 1850083200.
- Vault token balance reduction: 1000000000.
- User token credit: 59200000 (59.2 AIDOGE), 5.92% of principal reduction.

Direct vault-origin Transfer events:

| Recipient | Raw amount |
| --- | ---: |
| Holder | 59200000 |
| `0xed8846e0bba0e2c5a5f706247f733270c519aa86` | 188160000 |
| AIDOGE rewarder `0x78a0baa38c1859133ea8bb979e7150bca8d0c410` | 470400000 |
| `0x000000000000000000000000000000000000dead` | 282240000 |

These four amounts sum to 1000000000. Direct non-user transfers total 940800000, so user credit equals vault reduction minus direct non-user transfers exactly. The observed direct non-user allocation is 20% / 50% / 30%; this single execution does not establish an immutable rule.

The transaction also processes pre-existing token-held balances through swaps and secondary distributions. Aggregate burn-address delta is therefore NOT the withdrawal's direct burn amount. The sum of observed AIDOGE participant balance deltas is zero. Other ERC20 Transfer participants are recorded separately in `tokenAccounting`, including historical pre-call reads obtained retrospectively at the pinned block. This is not a claim that every state-mutated account emitted a Transfer event or that every accounting invariant of each other token is verified.

Across the 19 recorded token/address pairs, every balance read succeeded. Observed participant delta sums for AIDOGE, WETH, and ARB are each zero. Camelot pair LP-token balances increase by 27183215749619 raw units; receipt Transfer events from the zero address sum to that exact amount (including LP minted to the zero address). This explains the LP balance-sum change, but aggregate totalSupply was not independently queried. Secondary routing is not additional principal debited from this vault.

## Parameter semantics and pending protection checks

For this execution, the supplied uint256 equals the observed principal reduction, while user credit is strictly smaller than the input. Execution nevertheless succeeds. Thus this observation contradicts treating this input as an enforced minimum of the holder's net AIDOGE credit. A decompiler label `_minAmount` is not sufficient evidence of that interpretation.

Pending tasks:

1. Inspect opcode-level branch arithmetic or exact implementation source to identify all input comparisons, amount semantics, rounding, and bounds. CallTracer alone does not expose internal arithmetic/comparisons.
2. Run controlled input and timestamp boundary cases before generalizing parameter semantics or a penalty formula/ceiling.
3. Validate individual per-address log-to-balance reconciliation and aggregate totalSupply changes for secondary tokens; determine the economic attribution of pre-existing token balances and swaps.
4. Independently assess trace completeness. Returned call/state-diff trees are present, but truncation cannot be disproved merely by comparing event counts.
5. Verify total staked/weight storage semantics; locks principal and token custody balances are recorded, but no verified aggregate-staked getter has been assumed.

## Reproduction and cleanup

Launch loopback Anvil with `--fork-url https://arb1.arbitrum.io/rpc --fork-block-number 511692613 --host 127.0.0.1 --port 8545`. Later reproduction may require an archive-capable upstream.

Set ANVIL_RPC_URL to http://127.0.0.1:8545, FORK_BLOCK=511692613, FORK_TARGET=aidoge, FORK_HOLDER to the holder above, and FORK_AMOUNT_RAW=1000000000; run `npm run observe:fork`.

The harness impersonates/funds only the local account. Snapshot rollback completed and the pinned block hash was checked after restoration. Local transaction hashes may differ between runs. Anvil was stopped after collection.

Harness fixes made during collection: Anvil 1.7.1 metadata chain-ID compatibility, verification of rollback by block hash rather than a nonexistent Viem boolean return, and multi-token participant accounting. Unit suite: 87 passing. Production build: passing. No commit, push, or dashboard write-status changes were made.
