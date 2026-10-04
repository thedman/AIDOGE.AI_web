# Candidate action verification

## Observational harness

`npm run observe:fork` runs `scripts/fork-observation.mjs` separately from the frontend. Requires Anvil and a fresh Arbitrum fork. A Windows Anvil 1.7.1 observation was completed at block 511692613; see [the evidence bundle](evidence-bundles/aidoge_earlyWithdraw.md) and its adjacent raw JSON.

Start Anvil bound only to loopback, with mining only on submitted transactions:

```powershell
anvil --host 127.0.0.1 --port 8545 --fork-url <ARBITRUM_RPC> --fork-block-number <BLOCK>
```

In a second PowerShell terminal:

```powershell
$env:ANVIL_RPC_URL = 'http://127.0.0.1:8545'
$env:FORK_TARGET = 'aidoge' # or aicode
$env:FORK_HOLDER = '<PUBLIC_HOLDER_ADDRESS>'
$env:FORK_BLOCK = '<BLOCK>'
$env:FORK_AMOUNT_RAW = '<POSITIVE_BASE_UNIT_AMOUNT>'
npm run observe:fork
```

The harness checks loopback URL, Anvil identity, fork chain/block metadata, fresh head block and the recorded vault implementation before impersonating. Incompatible Anvil metadata is rejected, not silently accepted. It funds only the impersonated account on the local fork, observes an early withdrawal, and restores the snapshot. No personal signing key is required.

Reports under ignored `reports/fork/` include implementation bytecode, pre/post lock state, token-specific Transfer logs, token balance deltas for observed transfer participants, receipt, and attempted call/state-diff traces. Missing trace support is recorded as unavailable, not treated as complete evidence. Other-token movements and recipients not reflected in token Transfer logs require separate trace review. Balance deltas use ERC-20 balanceOf, not native ETH getBalance.

This first harness covers only earlyWithdraw. The other action profiles below are requirements for subsequent cases, not implemented fork tests. Guard unit tests do not verify fork execution, penalties, or contract safety.

Status: HOLD. Candidate interfaces are modeling-only and are not wired to transaction controls. A successful eth_call is not a payout or penalty verification. Return signatures are tentative; selectors alone do not establish semantics.

## Evidence to collect first

### Observed early-exit risk and UI integration requirements

At pinned block 511692613, an AIDOGE V2 local-fork call with input 1000000000 raw units reduced principal by 1000 AIDOGE and credited only 59.2 AIDOGE to the holder. Direct non-user transfers totaled 940.8 AIDOGE: an observed 94.08% deduction. Do not label the entire spread as token tax, assume a universal penalty ceiling, or extrapolate this sampled result to other holders or timestamps.

In this run the input matched gross principal unstaked, not minimum net tokens received: the call succeeded despite user credit being below the input. General parameter semantics and all bytecode checks still require implementation analysis; a decompiler parameter label is not authoritative.

All vault exit methods remain HOLD. Before any future earlyWithdraw UI integration is considered, its specification must require an explicit Net Received Warning showing an evidence-backed expected net payout, principal debit, deductions and uncertainty. A warning or client-side calculation alone is not payout protection: review verified contract-enforced bounds (if available), timestamp sensitivity, proxy/current-state changes, and any absence of minimum-received enforcement. No executable control is enabled by this specification.

The user-supplied October 4 Dedaub excerpt labels earlyWithdraw's uint256 argument `_minAmount`. Its semantics remain unverified: do not treat the candidate ABI's parameter name as proof that it is a withdrawal quantity or minimum payout. The excerpt is incomplete and does not establish final execution success or balance/state reconciliation. Local assessments and raw receipts remain under ignored `reports/`; full traces must include block, sender and override metadata. Historical calldata 3000000000000000000 is not interchangeable with the simulator input 3000000000000.

Obtain Dedaub implementation decompilation and full simulation traces for both V2 proxies and the claim router. Record chain ID, pinned block/hash, proxy implementation/admin slots, runtime code hashes, caller, target, calldata, value, logs and state diffs. Existing historical receipts can validate claims but cannot replace current-state checks.

## Fork protocol

Use a local Anvil fork pinned to that evidence block. Impersonation and test funding must be restricted to a verified local fork, never a production RPC. Snapshot and revert between cases. Do not use personal private keys. Re-read proxy configuration and runtime hashes before each modeled action.

- Withdraw: compare wallet/vault token balances and lock principal before/after, reconcile every fee destination, and test immediately before/at/after expiry. Do not infer fee-free eligibility from the timestamp alone.
- Early withdraw: test partial/full amounts and weekly boundaries, identify rounding and caps from traces, and reconcile wallet payout, principal reduction, burn and redistribution. Never infer an exact curve from a successful call.
- Increase principal: reconcile wallet debit, vault net receipt and lock credit. Do not assume the historical 8% token tax applies to these particular vault interactions; exemptions and current configuration must be measured.
- Extend lock: measure principal preservation, exact resulting expiry, week rounding, maximum duration and reward snapshot changes.
- Claim all: reconcile actual balance deltas with Transfer logs for each expected token and the caller. Distinguish revert, confirmed zero payout and nonzero payout; gas costs remain separate. Do not treat a success receipt or zero Transfer events alone as proof of zero balance change.

The reference wallet and synthetic accounts should cover active/expired/empty positions, zero rewards, mixed-token rewards, and failed rewarders. Tests validate sampled states, not future proxy behavior or complete contract safety.

The saved evidence bundle contains a successful local transaction, available call/state-diff trees and balance reconciliation. It does not prove trace completeness, the full arithmetic or future contract safety. No write capability was enabled. A subsequent write release requires explicit review and an updated MetaMask submission.
