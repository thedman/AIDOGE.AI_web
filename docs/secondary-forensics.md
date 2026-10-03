# Secondary candidate verification - 2026-10-03

## Historical claim routing corroboration

Receipt and transaction re-read for `0x871bab18ad02db7ec3bbd822be9e005f56a038d097084e9532b955d450ac851d` confirmed success at block 511349453, router target `0xb38f360234ec6e79676eea7a766100f82004b6a3`, and selector `0xd1058e59`. ERC-20 Transfer logs to the investigated holder recorded 13173127778561914195 raw AIDOGE from `0x78a0baa38c1859133ea8bb979e7150bca8d0c410`, 217840326254894071474 raw AICODE v2 from `0x6365b66997502a49c89ced0e81d553dbc24101ec`, and 96622180127909694720 raw ARB from `0xd7c78a327513c1ae16ff991a624a4c2820762cb6`.

Matrix GO status is limited to historical router mapping and reconstructed rewarder reads already used for unverified weekly estimates. This does not establish verified source, absence of admin controls, general claim safety, or withdrawal mechanics. All writes remain HOLD. Router GO mapping does not enable a router claimable-balance query.

Intermediate zero ARB Transfer logs run from the AIDOGE token contract to distribution recipients, not from the ARB rewarder to the holder. They therefore do not by themselves prove an individual rewarder returned a zero payout. Swap-related and LP Transfer logs exist, but exact internal caller sequencing and venue attribution require trace/source evidence. Historical receipt events are not pre/post balance-diff verification.

Chain: Arbitrum One (42161). Endpoints: https://arb1.arbitrum.io/rpc and https://arbitrum-one-rpc.publicnode.com.

At blocks 511406052 (primary) and 511406057 (backup), `eth_getCode` returned:

| Claimed feature | Supplied address | Runtime bytecode bytes |
| --- | --- | --- |
| AIDOGE control | 0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b | 20732 |
| AICODE candidate | 0x7C8121f80c39fA106632c80425a1B66B3ae910dD | 0 |
| Staking candidate | 0xD648E83D0b02888D1b2C1E41B53cB83C663D70eE | 0 |
| Camelot LP candidate | 0xC4722E30DBaC42a51A9e172eFE2565691F605e5D | 0 |

Both providers agreed on all four code checks. No bytecode means these addresses cannot currently serve the proposed deployed-contract reads. It does not prove they never hosted contracts historically or establish whether they are EOAs.

The supplied deployment hash `0xd36111005f0393f9c636736209b5eb0f3b0e3e2d6b38c0378875323a78bc5ffc` returned a null transaction receipt on the primary RPC. The backup rejected the receipt query with an archive-token requirement. Creation provenance, the claimed deployer, verified source, proxy status, ownership, and pause status therefore remain unconfirmed. Explorer pages were unavailable through the research tool; absence from search results is not evidence of absence on-chain.

Decision: all three supplied secondary candidates remain HOLD for reads and writes. No secondary ABI or dashboard polling was added. The existing AIDOGE public reads remain GO; its write status remains HOLD. Unknown audit fields use null or omitted values, not false/zero defaults.

Next evidence needed: corrected addresses linked to verified project sources or factory events, and a valid creation transaction with an accessible receipt. Pool provenance must include factory, token0/token1, and creation-event checks; holdings alone do not establish an official ecosystem contract.

## Replacement candidates checked

The subsequent proposed canonical addresses were checked on the same two endpoints. Both reported chain ID 42161. Primary block: 511407254; backup block: 511407374. The backup bytecode reads were pinned to its reported block.

| Proposed role | Replacement address | Runtime bytes on both endpoints | Result |
| --- | --- | --- | --- |
| AICODE | 0x7C8121661A9222c3D39B8806dB6A5e0a02F0B9C7 | 0 | HOLD; identity and source unconfirmed |
| Camelot AIDOGE/WETH | 0x296f8664585e135D7bE243fEE12180A4e349277A | 0 | HOLD; token0/token1/factory/reserves unconfirmed |
| ARB | 0x912CE59144191C1204E64559FE8253a0e49E6548 | 2593 | Identity reads succeed; distribution linkage HOLD |

The AIDOGE control again returned 20732 runtime bytes. AICODE name/symbol/decimals/totalSupply and the proposed pool token0/token1/factory/getReserves calls failed on the primary. ARB returned name `Arbitrum`, symbol `ARB`, decimals `18`, and totalSupply `9999998977610261816650915825` base units; the backup independently confirmed the symbol. No source-verification, proxy, owner, or pause claims were inferred from successful identity reads. No evidence establishes the proposed ARB Lucky Drop/tax relationship.

The matrix now records the replacement AICODE and LP candidates while preserving the earlier evidence above. Readiness remains GO/HOLD/REJECT; ACTIVE describes runtime state and is not a substitute for validated read readiness. Secondary polling remains disabled.

Address casing does not change EVM address bytes, although an invalid mixed-case checksum can be rejected by client tooling. Empty code establishes current absence of runtime code at the queried address, not the historical reason. An implementation upgrade does not normally remove the proxy's runtime code. No self-destruction or wrong-chain explanation was established by these checks.
