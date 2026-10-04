# User-supplied Dedaub trace assessment

Received October 4, 2026. Source: pasted partial simulator trace and screenshot, not an independently downloaded full simulation artifact. Block number/hash, sender, overrides, complete terminal status and storage diffs were not supplied with the excerpt.

## Visible excerpt

```text
0x14C228227B6bA5cA48b69B75e83950c4bB2Be69e.earlyWithdraw(_minAmount = 3000000000000)
DELEGATECALL 0x1a2D62379DC9C2ADed1D1B35bDa1C7c9B5B59644.earlyWithdraw(...)
AIDOGE.transfer(to = 0xED8846e0bbA0e2C5a5f706247F733270c519aa86, amount = 564480000000)
CamelotRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn = 32495, amountOutMin = 0, path = [AIDOGE, Wrapped Ether, Arbitrum], to = AIDOGE, ...)
```

The transfer argument is 564480000000 base units, or 564480 AIDOGE at six decimals, NOT 564480000000 whole tokens. The call input 3000000000000 represents 3000000 AIDOGE units if interpreted as a token amount. It is not the historical 0x3125...3fc5 input: that input was 3000000000000000000 base units (3 trillion AIDOGE), a factor of one million larger.

## Supported observations

- The excerpt shows delegation to the recorded implementation address.
- It shows a transfer call to 0xed8846e0bba0e2c5a5f706247f733270c519aa86. This differs from the 0x27ed... recipient in the sampled 2023 AIDOGE receipts. The cause of that difference is unresolved.
- Nested AIDOGE token execution invokes a Camelot swap. This does not prove the vault directly initiates the swap or that the swapped amount is a particular fraction of the withdrawal penalty.
- The screenshot and trace label the parameter _minAmount. A decoded argument name alone does not prove minimum-payout semantics. Need the implementation comparison and execution branch.

## Unsupported conclusions

- Final successful simulation, final payout, principal decrement and full penalty reconciliation: absent from the partial excerpt.
- A 20% allocation: denominator and remaining transfers absent.
- Treasury/dev role, immutable splits, exact decay formula and tax attribution: not established.
- 23 RPC-confirmed AIDOGE successes: only three were re-fetched; 23 CSV entries had blank errors. These are not equivalent.
- Complete payout ranges for either vault: the cited endpoints are sampled observations, not global extrema.

## Required next evidence

Export the full trace including terminal success/revert, sender, block/hash, overrides, before/after locks and token balances. Obtain implementation decompilation around selector 0x6b5b9696, its internal helpers and the comparison involving the argument. Test argument boundaries only in simulation, without broadcasting transactions.

Read verdicts unchanged; all writes HOLD. No complete arithmetic or safety verification inferred.
