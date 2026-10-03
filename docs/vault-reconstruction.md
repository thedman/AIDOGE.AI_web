# Vault reconstruction evidence

## Position read integration - 2026-10-03

Read-only RPC validation on Arbitrum One (`eth_chainId = 0xa4b1`) at block `0x1e7b9ac0` confirmed both V2 vaults still resolve to implementation `0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644`. The claim router still resolves to `0x468c849af03e6a9e63cf652be3d700ad2f7683e9`. All three admin slots returned `0xc5723739dd99e85fa7795765b0738e569b7626fe`. This is a point-in-time RPC check, not verified-source or immutability evidence.

Both vaults returned two words for `locks(address)` on the previously investigated account, consistent with the trace project's principal/expiry decoding. The frontend now reads these at a pinned block only after implementation/admin checks. Wrong-chain and disconnected states hide account data; failed checks hide cached results. No wallet transaction was requested.

The ABI is reconstructed, not fetched from verified source. Claimable token amounts remain unavailable, not zero. The router aggregate must not be presented as a multi-token balance. Exact penalties and bounded claim-loop behavior remain unresolved, so no staking, withdrawal, or claim hooks have been enabled. The forensic matrix remains conservative pending complete contract review.

## Sources and limits

- Requested capture: https://web.archive.org/web/20240520131156/https://arbdoge.ai/vault/aidoge
- Preserved project documentation: https://resources.cryptocompare.com/asset-management/10469/1705076004962.pdf (pages 3-4).
- The requested Wayback HTML could not be retrieved in this session. No capture scripts, ABI, or vault address were recovered.
- The PDF is a hosted copy of historical project documentation, not proof of current deployed behavior or provenance for a contract address.

## Historical requirements, not verified contract behavior

The documentation separates legacy Earn v1 withdrawals from the newer Vault. AIDOGE staking rewarded AIDOGE; AICODE staking rewarded AIDOGE, AICODE, and ARB. Lock options were one, three, and six months, one year, and two years. Rewards used veToken weighting and weekly cycles beginning Thursday at 00:00 UTC.

Early withdrawal could incur substantial penalties, including a documented 100% immediate-exit penalty for a two-year lock. Actual units, rounding, caps, and current parameters must be recovered from verified code before displaying an executable withdrawal quote.

The documentation lists different AICODE versions: Arbitrum v1 `0x7C8a1A80FDd00C9Cccd6EbD573E9EcB49BFa2a59` and newer `0x2823f231B8b7121c4bA6B6c0cEEF37b6a5bDa547`. These are leads only, not validated replacements for the current matrix. Neither identifies the vault itself.

## Most useful evidence to contribute

1. A successful historical stake, withdrawal, or reward-claim transaction hash on Arbitrum One. Label whether it used Earn v1, AIDOGE Vault, or AICODE Vault, if known. Public hashes are sufficient; no wallet connection is needed.
2. If the Wayback capture opens for you, save the page with its resources and supply the captured JavaScript bundles. HTML alone may omit contract configuration. Preserve original resource URLs and capture timestamps.
3. Screenshots of each vault tab and position/withdrawal dialog, including lock choices, reward assets, and warnings. Do not sign or submit anything on an archived page.
4. Any linked explorer addresses or historical project repositories. Treat community-supplied addresses as candidates until independently corroborated.

Never supply seed phrases, private keys, signed messages, or browser profiles. Remove authorization headers, cookies, and account identifiers from network exports before sharing.

## Implementation gates

- Resolve separate legacy and current contracts from transaction receipts, calldata, and logs; establish project linkage with independent historical evidence.
- Obtain verified source and ABI; validate bytecode, chain ID, token identity, proxy implementation/admin, roles, pause state, and withdrawal/reward semantics.
- Determine whether positions/rewards are fully on-chain or require a historical API, proof service, or reward distributor. Missing backend data must not become fabricated zero balances.
- Implement read-only position discovery first: disconnected, unsupported-chain, loading, no-position, stale-data, and RPC-failure states. Keep each contract version distinct.
- Validate allowance spender, fee-on-transfer handling, lock units, penalty rounding, claim eligibility, and exit behavior with pinned-block fork tests before proposing any write path.
- Add transaction review, bounded approvals, simulation, rejection/error handling, and receipt confirmation only after separately approving write integration.

No write capability was added by this research. Existing secondary HOLD statuses remain unchanged. A future write-enabled release will also require updating the MetaMask review document, which currently describes a read-only release.
