# NFT Prologue: historical Ethereum references

Recorded from user-supplied instructions on October 4, 2026. These are historical references, not verified recovery procedures or safety endorsements. The chain and contract roles below are user-reported; deployment, current ABI, proxy controls, ownership and payout behavior have not been independently confirmed. Etherscan retrieval was unavailable during this documentation pass.

## Separate network and HOLD matrix

These references concern **Ethereum Mainnet (chain ID 1)**, not Arbitrum One (42161). Do not reuse the dashboard's Arbitrum vault addresses, token decimals or RPC assumptions here. No Ethereum wallet reads or writes are enabled by adding this document.

| Reported role | Address | Read status | Write status |
| --- | --- | --- | --- |
| NFT Prologue unstaking contract | `0x7fc9c19ced994a8ef28df46be4c95772de5eeefd` | HOLD: identity/interface unverified | HOLD |
| Truth AIDOGE Co-Creation reward pool | `0xafccdd2ed152486aac4acc0f44d6cd78c98abc82` | HOLD: identity/interface unverified | HOLD |

Addresses are recorded in lowercase to avoid implying a verified mixed-case checksum. Their address format is valid; that does not establish deployed bytecode or provenance.

## Reported methods and selector discrepancy

| Reference in supplied instructions | Reported method | Supplied selector | Selector computed from signature |
| --- | --- | --- | --- |
| Section 13: NFT unstaking | `unstake(uint256 tokenId)` | `0xe449f341` | **`0x2e17de78`** for `unstake(uint256)` |
| Section 8: reward claim | `claim()` | `0x4e71d92d` | `0x4e71d92d` |

Selectors were computed with viem `toFunctionSelector`. Parameter names do not affect the selector. **Do not encode or send the unstaking call using the supplied selector/signature combination.** Resolve the mismatch against the current implementation's ABI or decompiled dispatcher and historical successful calldata first. A matching claim selector verifies only encoding, not that the target implements the method or that a claim pays tokens. Explorer section numbers are historical UI references and may change.

## Manual investigation references

- [NFT contract on Etherscan](https://etherscan.io/address/0x7fc9c19ced994a8ef28df46be4c95772de5eeefd#code)
- [Reward pool on Etherscan](https://etherscan.io/address/0xafccdd2ed152486aac4acc0f44d6cd78c98abc82#code)
- [Dedaub contract explorer](https://app.dedaub.com/): select Ethereum and look up the full target address.

Before any external interaction, independently confirm chain ID 1, bytecode, provenance, proxy implementation/admin, exact method interface and wallet entitlement. For NFTs, identify the NFT collection contract and token ID and confirm staking custody/position state; do not assume a wallet holds an unstakeable position from a token ID alone. For claims, establish individual claim eligibility and expected reward-token balance changes rather than aggregate pool balances.

Use simulation, not a live write, while investigating. Record block/hash, caller, calldata, overrides, terminal result, NFT ownership and staking state before/after, and reward-token balance deltas. A successful simulation is not proof of a payout or future safety. External explorer writes bypass dashboard protections and may irreversibly move assets or consume gas with no recovery or reward.

All dashboard deposits, claims, withdrawals and NFT actions remain **HOLD**. No approval, signing or transaction control is introduced by these references.
