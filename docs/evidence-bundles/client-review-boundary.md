# Client early exit review boundary

The AIDOGE-only review utility models the runtime reconstruction in
`aidoge_vault_math_spec.md`. It does not authorize transactions.

- Uses remaining weekly periods, checked uint256 arithmetic, current fee rates,
  and residual-recipient rounding. Expired locks and over-principal deductions
  fail rather than being clamped to a fictional zero payout.
- Pins reads and execution simulation to one block; checks chain, proxy/admin
  storage and implementation runtime hash against the recorded reconstruction.
- Review is invalidated on account/network/input changes and after 30 seconds.
- A nominal token transfer is not a measured wallet balance delta. Token taxes,
  accumulated reward routing and callbacks need separate reconciliation.
- `simulateContract` does not supply receipt logs or payout state diffs. Its
  success is only an execution check, not independent accounting verification.
- An advisory frontend minimum cannot enforce the minimum at mining time.
  Acknowledgment never enables a transaction; the module has no send/sign API.

Pending before evaluating any executable integration: fresh fork accounting,
recipient/configuration evidence, tax/exemption behavior, expiry/gas edge cases,
and a defensible solution to state changes between review and mining. Unit
tests passing does not resolve the absence of a contract-enforced payout floor.
