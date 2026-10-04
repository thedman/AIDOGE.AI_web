# Early withdrawal evidence - 2026-10-04

## Address identity

Public Arbitrum One RPC returned empty latest bytecode for the newly supplied addresses:
- 0x14c228a2a5f57321685e130dfc52edaa9b7be69e
- 0x3a6d601d36beed38e8a6042db6290740a128cbd7

The project-recorded addresses both returned 2,333 bytes of runtime code:
- AIDOGE: 0x14c228227b6ba5ca48b69b75e83950c4bb2be69e
- AICODE v2: 0x3a6d60bc404523f281da5b5d6fd9beb2b348cbd7

Empty latest code does not prove an address never had historical code. No configuration was replaced with the supplied addresses.

## Re-fetched receipt evidence

46 historical AICODE early-withdrawal transactions discovered in the prior trace archive were re-fetched from https://arb1.arbitrum.io/rpc. Raw transaction inputs, complete receipts and decoded Transfer logs are in early-withdraw-receipts.json. Selector: 0x6b5b9696. Token: 0x2823f231b8b7121c4ba6b6c0ceef37b6a5bda547 (18 decimals).

Example: https://arbiscan.io/tx/0x5a3dca7c64b8949c05f78b9cf4d917317b9573741338d124d963eb65b1cfd5da

Block 331158794, success, caller 0x77393c16be4263f68ff31115d69e46795dc6df33. Calldata amount: 1000000 base units. This is 0.000000000001 AICODE, not one million whole tokens.

| Destination | Vault-origin Transfer value (base units) |
| --- | ---: |
| Caller | 404800 |
| 0xed8846e0bba0e2c5a5f706247f733270c519aa86 | 119040 |
| Rewarder 0x6365b66997502a49c89ced0e81d553dbc24101ec | 297600 |
| 0x000000000000000000000000000000000000dead | 178560 |

Sum: 1000000. Non-user allocation: 595200 (59.52%). Of this spread, 20% went to the other recipient, 50% to the rewarder and 30% to dead. The other recipient's organizational role is unverified; do not label it a fee collector without supporting implementation/configuration evidence.

Counterexample: https://arbiscan.io/tx/0x0d6d65f5e9f96b1637fe38cf6917e8e61bb1107b4850ebdcee5366664825e087

Calldata amount: 2150000000000000000000. User Transfer: 2129360000000000000000. Other recipient: 4128000000000000000. Rewarder: 10320000000000000000. Dead: 6192000000000000000. Total reconciles exactly with calldata amount; spread is 0.96%.

## Conclusions and limits

- A universal flat 50% deduction is contradicted by the sampled AICODE receipts.
- A universal 50% plus fixed transaction tax is likewise unsupported. These receipts show variable allocations, not an invariant 50% component.
- Variable deductions are consistent with time-dependent penalties, but the exact time-decay function, cap, week rounding and integer-operation order are NOT verified here.
- Transfer event accounting is not an independently measured pre/post balanceOf delta or position principal decrement. Calldata amount is not proof of storage decrement. Archive state or execution state diffs are still required for those claims.
- Token-origin transfers elsewhere in a receipt must not be counted as vault principal penalties. Raw reports retain these separately.
- No implementation decompiled snippet was obtained. Arbiscan web access returned 403; Dedaub's application did not expose decompiled content through web extraction. No arithmetic is invented from selectors or receipts.
- AIDOGE log search covered blocks 411601995 through 511601995 (400 logs). Direct matching withdrawal transactions used withdraw(), not earlyWithdraw(). This is a bounded search, not proof that no early withdrawals exist. AIDOGE-specific penalty and token-tax behavior remain unresolved.

## Contract matrix disposition

| Contract | Read | Write | Evidence boundary |
| --- | --- | --- | --- |
| AICODE V2 recorded vault | GO (existing guarded positions) | HOLD | Variable historical early-withdraw allocations observed; exact arithmetic and current implementation semantics unverified |
| AIDOGE V2 recorded vault | GO (existing guarded positions) | HOLD | Withdraw history found; early-withdraw penalty/tax not verified |
| Newly supplied address strings | HOLD | HOLD | Empty latest bytecode; not substituted for recorded vaults |

No production code, transaction controls, commits or deployments changed. These local reports are ignored by Git.
