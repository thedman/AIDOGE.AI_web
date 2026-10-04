# Archived project documentation review

Reviewed October 4, 2026 through the Wayback browser interface. Scope: seven pages covering AIDOGE, AICODE, Vault, NFT, NFT Rewards Hub, Transparency and FAQ. This is a targeted technical review, not a complete crawl of every documentation page or archive capture.

## Provenance and interpretation

These captures preserve statements published under the historical project documentation domain. They support historical design intent and address provenance, not current implementation safety or proof of ongoing operations. Wayback redirected linked pages to nearby captures; dates below are the actual loaded snapshots, not a single synchronized November 14 snapshot. Relative labels such as "1 year ago" are not reliable publication timestamps.

Follow-up source precedence: prefer the newest inspected relevant project documentation capture for its specific token/version and operation. The February 12, 2025 tokenomics pages below supersede November captures as the preferred documentary references for AIDOGE/AICODE. A later capture date does not by itself prove the underlying article was updated, and a newer AICODE page does not automatically supersede a Vault/NFT page on a different subject. Current bytecode/state and receipts remain necessary for executable behavior. User-reported experience of no more than 8% and apparently untaxed CEX trading is recorded as contextual observation, not a universal on-chain ceiling.

| Page | Actual capture | Source |
| --- | --- | --- |
| AIDOGE | 2024-11-14 00:33:57 UTC | [Tokenomics](https://web.archive.org/web/20241114003357/https://docs.arbdoge.ai/tokenomics/aidoge) |
| Vault | 2024-11-11 12:55:35 UTC | [Vault](https://web.archive.org/web/20241111125535/https://docs.arbdoge.ai/products/vault) |
| AICODE | 2024-11-19 04:44:01 UTC | [Tokenomics](https://web.archive.org/web/20241119044401/https://docs.arbdoge.ai/tokenomics/aicode) |
| NFT | 2024-11-22 20:43:09 UTC | [NFT](https://web.archive.org/web/20241122204309/https://docs.arbdoge.ai/products/nft) |
| NFT Rewards Hub | 2024-11-17 19:35:22 UTC | [Rewards](https://web.archive.org/web/20241117193522/https://docs.arbdoge.ai/products/nft-rewards-hub) |
| Transparency | 2024-11-17 01:21:06 UTC | [Addresses](https://web.archive.org/web/20241117012106/https://docs.arbdoge.ai/others/transparency) |
| FAQ | 2024-11-24 22:22:24 UTC | [FAQ](https://web.archive.org/web/20241124222224/https://docs.arbdoge.ai/others/faq) |
| AICODE (preferred follow-up) | 2025-02-12 09:38:35 UTC | [Tokenomics](https://web.archive.org/web/20250212093835/https://docs.arbdoge.ai/tokenomics/aicode) |
| AIDOGE (preferred follow-up) | 2025-02-12 10:49:34 UTC | [Tokenomics](https://web.archive.org/web/20250212104934/https://docs.arbdoge.ai/tokenomics/aidoge) |

## February 2025 follow-up

Both later tokenomics captures continue to document an 8% token tax. The AICODE capture retains the v1/v2 addresses, 21-million supply and staking/LP/whitelist exemption note reviewed in November. These inspected details are consistent across the two dates; this review has not identified a tax-rate change between those captures. Treat 8% as the preferred documented historical baseline, not 15% from the older FAQ. No claim is made that all transfer paths must charge exactly 8% or that 8% is a verified current maximum.

Apparently untaxed CEX order-book trading is compatible with a taxed on-chain token: exchange ledger trades need not execute ERC-20 transfers. Deposits/withdrawals and exchange-controlled on-chain transfers are separate operations whose taxes, exemptions and exchange fees require their own evidence. Vault exit deductions are likewise separate from transfer tax.

## Vault: documented exit model, not verified executable arithmetic

The Vault page describes a migration from the earlier staking system and directs legacy withdrawals to Earn v1. It lists lock choices of 1/3/6 months and 1/2 years, with veToken weight based on principal and lock length. AIDOGE staking earns AIDOGE; AICODE staking earns AIDOGE, AICODE and ARB.

Its exit-fee explanation implies **remaining weeks multiplied by 0.96%**: a four-week remaining period incurs 3.84%. It also says an immediate exit from a two-year lock deducts 100%. The published fee allocation is **50% to other stakers, 30% burn, 20% team**.

This is historical documentary support for the weekly-rate model and receipt split, not proof of current logic. The examples do not specify week rounding, timestamp alignment, multiplication/division order, maximum clamp, tax exemptions, destination addresses or `_minAmount` semantics. Even 104 weeks times 0.96% is 99.84%, so the prose's 100% statement must not become an assumed exact cap or formula.

Rewards use Thursday 00:00 UTC boundaries and require a complete cycle. Current read estimates must still be validated against actual accounting and claim cursors.

## AIDOGE: token identity and historical tax allocation

The AIDOGE page links `0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b`, states an original supply of 210 quadrillion, and describes initial distribution as 95% airdrop pool and 5% invitation allocation.

Its 8% tax table assigns 1% burn, 0.7% staking rewards, 3% temporary ARB deposit, 1% Camelot liquidity, 0.8% flexible funds and 1.5% development. The temporary deposit address is `0xa67b4Bf837B77da3D11AA1bb0b7bCdDE995279D8`. These are published allocations, not a guarantee every current transfer follows them. In particular, the 8% token tax is distinct from the vault exit fee.

## AICODE: separate versions and networks

The AICODE page explicitly announces v2 and lists:

| Historical identity | Documented address |
| --- | --- |
| Old AICODE, Arbitrum | `0x7C8a1A80FDd00C9Cccd6EbD573E9EcB49BFa2a59` |
| Old AICODE, Ethereum | `0x10B3AAF66D90Cb54fca62Dd37d17022555399EE1` |
| New AICODE, Arbitrum | `0x2823f231B8b7121c4bA6B6c0cEEF37b6a5bDa547` |

The v2 narrative specifies 21 million supply, approximately 1:6 old/new exchange, and a four-year 40/30/20/10 emission schedule rather than a universal Bitcoin-like halving assumption. It describes an 8% tax split as 2% burn, 2% flexible treasury and 4% stakers, with official staking/LP and whitelist interactions exempt. Exemption status still requires current contract inspection.

These addresses are documentary provenance leads, not replacements authorized for the UI. Do not confuse them with the zero-bytecode candidate or the separate V2 vault addresses. Burning-pool participation is described as irreversible; availability of former website exchange/mining flows is not established.

## NFT and royalty accounting

The NFT page explicitly states AIDO is issued on **Ethereum Mainnet**, documenting the L1/L2 distinction independently of the supplied recovery instructions. It describes a maximum 10,000 mint with unminted supply destroyed and 500 community co-created avatars; these are historical plans, not current supply reads.

The Rewards Hub describes 3,650 base multiplier points per NFT plus one bonus point every 144 minutes, with bonus points reset on unstaking. It describes staking royalties apportioned by multiplier points and 50% royalty funding on Monday 00:00 UTC boundaries. A separate section assigns creators 50% of royalties from the 500 community co-created avatars. Do not combine these differently scoped percentages into an assumed single payout formula.

Neither inspected NFT page supplies the two recovery contract addresses or proves their ABI/selectors. L1 issuance is documented; provenance for `0x7fc9...eefd` and `0xafcc...bc82` remains unresolved. See [the recovery-reference guide](nft-prologue-mainnet-reference.md).

## Transparency: useful legacy address provenance

The Transparency page warns against direct transfers to its listed addresses and identifies:

| Published role | Address |
| --- | --- |
| AIDOGE airdrop collection | `0x7c20acfd25467dE0B92d03E4C4d304f18B8408E1` |
| Lucky Drop collection/distribution | `0xa67b4Bf837B77da3D11AA1bb0b7bCdDE995279D8` |
| ARB ecosystem-development incentives | `0x0c7E8eD197a2eDa73A594F5d75CCd4bfDC62eE60` |
| ARB voting participation with time lock | `0x5D40f52f8e9d91c84ca6d81bD9DfF1f10e0DBE89` |
| AIDOGE Earn reward pool | `0x5845696F6031BFd57B32e6Ce2DdeA19A486fa5e5` |

This corroborates the legacy Earn address in our manual guide. It does not identify active V2 vault implementations, the claim router, or NFT recovery contracts. Labels do not independently establish current recipient ownership or permissions.

## Documentation conflicts and remaining work

The older FAQ says a 15% trading tax and recommends at least 20% slippage; the preferred February 2025 AIDOGE/AICODE tokenomics pages document 8%. The FAQ is lower-priority conflicting guidance, not evidence of a current 15% rate. Do not reproduce its slippage instruction as current advice or conflate token tax with an exit fee. The precise historical date of a tax change is not established by these snapshots.

Next evidence targets: current implementation arithmetic for the documented weekly fee, week rounding and cap; `_minAmount` use; pre/post principal and token reconciliation; current tax exemptions; reward-cycle eligibility; exact NFT staking/reward contract provenance. Documentation narrows the hypotheses but does not satisfy these checks.

No runtime/UI contract configuration or write capability was changed by this review. All writes remain **HOLD**. No archive page was used to initiate a wallet action.
