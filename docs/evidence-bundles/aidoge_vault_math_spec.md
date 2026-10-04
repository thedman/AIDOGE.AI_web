# AIDOGE V2 vault mathematics: runtime reconstruction

## Audit status and provenance

**No verified Solidity source was retrieved.** Arbiscan's implementation Code tab explicitly presents "Verify and Publish", not verified Solidity. Sourcify API v2 returns no match for either proxy or implementation. The implementation's embedded IPFS metadata CID is `QmWmSy7aZdeywq1nazr3qb4Bvm7qr2MXBtm3oNe3KxnY8g`; metadata retrieval failed/timed out. Dedaub exposes reconstructed ABI and disassembly, not verified source. Therefore the pseudocode below is a manual reconstruction from runtime instructions, NOT a quotation of original Solidity or a complete security audit.

- Network: Arbitrum One, chain ID 42161.
- Proxy: `0x14c228227b6ba5ca48b69b75e83950c4bb2be69e`.
- Implementation: `0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644`.
- Runtime keccak256: `0x5ac6b5587499f43b3651444c1155101f9f247bbd798bd04a788cc075840505a3`.
- Historical observations: block 511692613, hash `0x774dfc058258281738e1c32a93372c7b58e57f4123c7623ca1e1eaaafbc822e0`.
- Separate configuration read: block 511701057, hash `0x0e1fb0e0a0772f7c641f413c331328bcd3a11b084b000deeae554ce9b3d0f274`.
- Runtime at that configuration block exactly matches the historical observation bytecode. Configuration reads are not retroactively presented as historical storage reads.

[Arbiscan implementation](https://arbiscan.io/address/0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644#code), [Dedaub disassembly](https://app.dedaub.com/arbitrum/address/0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644/disassembled), [Dedaub reconstructed getter interface](https://app.dedaub.com/arbitrum/address/0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644/read).

The implementation's own storage is not the vault state. Read configuration through the proxy. Dedaub's direct implementation view displays zero/uninitialized values for several state fields; those are not proxy configuration.

Machine-readable evidence: [selected disassembly and pinned configuration](aidoge_vault_math_bytecode.json), [original execution](aidoge_earlyWithdraw.json), [synthetic sweep](aidoge_penalty_curve_matrix.json).

## Constants and state layout

| Symbol / getter | Value at configuration block | Bytecode / proxy storage |
| --- | --- | --- |
| `W = WEEK()` | 604800 seconds | Constant; selector `0xf4359ce5` |
| `D` | 10000 | Literal `0x2710` in fee math |
| `MAX_LOCK()` | 63503999 seconds | `105 * W - 1`, routine `0x12a9` |
| `p = earlyWithdrawBpsPerWeek()` | 96 | Slot `0xa2`, bits 8..71 |
| `r = redistributeBps()` | 5000 | Slot `0xa2`, bits 72..135 |
| `b = burnBps()` | 3000 | Slot `0xa2`, bits 136..199 |
| Token decimals | 6 | Low 8 bits of slot `0xa2` |
| `token()` | `0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b` | Slot `0x97` |
| Principal `supply()` | 2095138673917658137149 raw | Slot `0x98`; distinct from decaying voting-weight `totalSupply()` |
| `locks(user)` | Amount and unlock timestamp | Mapping seed `0x99`; signed int128 amount in low 128 bits, expiry in next struct slot |
| `breaker()` | false | Slot `0x9f` |
| `accumRedistribute()` | 0 | Slot `0xa3` |
| `treasuryAddr()` | `0xed8846e0bba0e2c5a5f706247f733270c519aa86` | Slot `0xa4` |
| `redistributeAddr()` | `0x78a0baa38c1859133ea8bb979e7150bca8d0c410` | Slot `0xa5` |
| `DEAD()` | `0x000000000000000000000000000000000000dead` | Hardcoded address |
| Vault `owner()` | `0x1d817c31123531259d30a867c39a86cfdb9ad0c1` | Slot `0x33` |

For `q = uint256(SLOAD(0xa2))`, the packed fields are:

```text
decimals = q & 255
p = (q >> 8)   & (2^64 - 1)
r = (q >> 72)  & (2^64 - 1)
b = (q >> 136) & (2^64 - 1)
```

The token's displayed renounced owner status does not imply this vault is ownerless. The owner-controlled configuration path at `0x07bf` checks `p <= 96`, `r <= 10000`, and `b <= 10000 - r`, then updates packed rates and recipient addresses. Thus 96/5000/3000 and the addresses are mutable configuration, not universal immutable rules. The breaker setter accepts only 0 or 1.

## Lock creation and duration bounds

The candidate selector for `createLock(uint256,uint256)` is `0xb52c05fe`, entering `0x1c92`. The runtime normalizes its second argument with routine `0x2abc`:

```text
E = floor(requestedUnlockTimestamp / W) * W
```

Checks include positive requested principal, no existing positive lock, permitted caller, and:

```text
E > block.timestamp
E <= block.timestamp + (105 * W - 1)
```

The maximum duration constant is approximately 735 days minus one second, not exactly 730 days. EVM timestamps aligned to integer weeks are Thursday 00:00 UTC. The checked expiry is the rounded expiry, not the user's unrounded timestamp. A short future input can round into the past and revert.

**No discrete 3-month / 6-month / 1-year / 2-year penalty-tier lookup is present in the inspected createLock and earlyWithdraw paths.** Duration labels are UI/documentation conventions. These paths accept a future, week-rounded expiry satisfying their bounds; penalty depends on that expiry's remaining time. This does not claim that every unrelated contract path or caller restriction has been audited.

The principal-update path credits the requested amount and calls token `transferFrom`; it does not in that routine derive credited principal from a measured before/after token balance delta. Tax exemptions and token behavior remain a separate integration concern.

## Exact reconstructed early-withdrawal arithmetic

Let:

- `A` be the uint256 calldata argument, in token base units.
- `L` be current locked principal.
- `E` be its stored expiry before reduction.
- `t` be the executing block timestamp.

Entry `0x12c6` invokes the reentrancy guard, checks `A > 0`, checks `t < E`, and requires the breaker to be disabled. Principal reduction routine `0x26a3` checks `A <= L`, reduces principal and global principal supply, and clears expiry if the full position is removed. The fee calculation still uses the saved pre-reduction expiry.

At `0x13b1..0x1411`:

```text
n = floor((E + W - t) / W)
  = floor((E - t) / W) + 1        // valid early-exit branch: t < E

P = floor(A * n * p / D)
N = A - P
```

The runtime uses checked uint256 addition, subtraction and multiplication helpers (`0x3acf`, `0x3ae2`, `0x3af5`), and unsigned integer division (`0x3b22`). Multiplication occurs before the final division. Overflow/underflow reverts, rather than wrapping. `P` truncates downward in raw token units; no round-up instruction is present in this calculation.

**This is a weekly staircase, not continuous smooth time decay.** At an exact remaining duration of `k * W`, `n = k + 1`; one second after that timestamp it becomes `k`. It is not generally equivalent to `ceil((E - t) / W)` at exact weekly boundaries. At expiry the early-exit branch is rejected; ordinary withdrawal is a separate path.

The input is used as principal quantity in the reduction and fee multiplication. It is not compared against final net transfer as a minimum-received floor in this inspected path. Both the original partial withdrawal and synthetic full withdrawals agree with that interpretation. This conclusion concerns the inspected runtime, not future proxy implementations.

## Distribution formula and destinations

At `0x1412..0x1489`, and the residual subtraction/transfer code at `0x1490..0x14f3`:

```text
R = floor(P * r / D)       // redistribution allocation
B = floor(P * b / D)       // dead-address allocation
T = P - R - B             // configured treasury residual
N = A - P                 // requested token transfer to caller
```

Current settings yield nominal 50% / 30% / 20% of `P`. Independent integer rounding puts the residual rounding dust into `T`; it is not necessarily exactly `floor(P * 2000 / 10000)` for arbitrary raw amounts.

Transfer order in this path:

Principal reduction and adding `R` to the accumulator occur before these external token transfers.

1. Send `T` to the configured `treasuryAddr`.
2. Send `N` to `msg.sender`.
3. Routine `0x29f9` resets `accumRedistribute` and transfers its entire accumulated value (already including `R`) to `redistributeAddr`.
4. Send `B` to the hardcoded dead address.

If a pre-existing accumulator is nonzero, the redistribution transfer includes it in addition to this call's `R`. Current sampled state has accumulator zero. Treasury is the getter/variable label, not proof of the recipient's beneficial ownership. Sending tokens to the dead address does not by itself prove a reduction in token `totalSupply()`.

The conservation equation for this call's nominal allocations is:

```text
A = N + T + R + B
```

`N` is the amount passed to the token contract, not a contract-enforced lower bound on the recipient's measured balance increase. Token taxes, exemptions, callbacks, secondary swaps and accumulated token fees can affect broader transaction accounting. The vault does not enforce an additional minimum-wallet-credit check here.

## Bounds and ordinary withdrawal

There is **no explicit `min(P, A)` clamp** in the inspected fee path. At `p = 96`:

```text
n = 104 -> nominal penalty factor 99.84%
n = 105 -> nominal penalty factor 100.80%
```

The maximum lock bound can permit `n = 105` for some rounded expiries/timestamps. If computed `P > A`, checked subtraction for `N` reverts. For sufficiently small raw amounts, integer truncation can change that condition. Therefore do not advertise a guaranteed 100% ceiling, a universal 50% ceiling, or an always-executable maximum-duration early exit. This 105-period case is a static-path implication, not an executed fork observation.

`withdraw()` selector `0x3ccfd60b` enters `0x0c47`. Its reconstructed principal path is:

```text
require(breaker != 0 || t >= E)
A = nonnegativeUint(lockedPrincipal)
reducePrincipal(A)
token.safeTransfer(msg.sender, A)
```

No early-exit penalty calculation is invoked in this inspected ordinary-withdrawal path. The breaker permits ordinary withdrawal before expiry while earlyWithdraw rejects breaker mode. This is an owner-controlled emergency behavior, not a user-controlled free-exit option. Actual user credit may still depend on the underlying token; this static analysis does not establish universally tax-free withdrawals.

## Evidence cross-check and residual audit work

`node scripts/check-vault-math.mjs` compares the reconstruction with the original successful partial withdrawal plus 15 successful synthetic full withdrawals. All 16 match the recorded user credit and direct rewarder/burn/treasury amounts. `node scripts/inspect-vault-math.mjs` produces pinned current-state reads and selected disassembly; it fails if the runtime differs from the saved evidence.

The sweep's 730-day / 75%-elapsed transaction reverted with an internal out-of-gas failure under its 6-million gas limit. Its missing successful result is not supplied by a formula prediction. A higher-gas retry remains blocked on archive access at the historical pin.

Remaining work before a production write review:

- Independently review reconstruction/control flow or retrieve original source and compiler settings with a runtime match.
- Execute exact weekly-boundary, expiry, near-MAX_LOCK, tiny-amount, partial/full, invalid-amount, breaker and configuration-change cases.
- Audit proxy administration, external token behavior, aggregate weight/checkpoint state, recipient callbacks, and full transaction gas requirements.
- Reconcile secondary tokens and assess trace completeness independently.
- Define meaningful user payout protection; estimates and acknowledgements are not a substitute for enforced bounds.

All dashboard writes remain **HOLD**. No frontend/configuration changes or live writes were made for this specification.
