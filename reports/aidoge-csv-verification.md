# AIDOGE early withdrawals - CSV follow-up

Source: user-supplied export-0x14C228227B6bA5cA48b69B75e83950c4bB2Be69e (1).csv.
5,000 rows, November 1, 2023 through January 24, 2024. This export is not assumed to contain all lifetime interactions.

109 rows labeled Early Withdraw: 86 marked errors (85 Error(1), one Error(0)); 23 have blank Status/ErrCode. Blank status alone is not RPC-confirmed success.

Three blank-status entries were independently fetched from public Arbitrum RPC and confirmed successful, targeting the recorded AIDOGE V2 vault with selector 0x6b5b9696:
- 0x3c988a819ecc466e902acb383ac575b31a9e22d2fb7fb459183178bff6bf319c
- 0xb364dce82657dbb483e638925bd104640bbe9f06fd20f227c7e75b66099f01b7
- 0x3125d0f873ebead797bb866549a6f6c79e841aa73ac8373e4ccff2839a633fc5

Raw receipts and inputs: aidoge-early-withdraw-receipts.json.

## Exact example

Transaction https://arbiscan.io/tx/0x3125d0f873ebead797bb866549a6f6c79e841aa73ac8373e4ccff2839a633fc5 at block 149505850.

Calldata amount: 3000000000000000000 base units (3,000,000,000,000 AIDOGE at 6 decimals).

| Vault-origin destination | Base units | AIDOGE |
| --- | ---: | ---: |
| Caller 0x9a646c6365b1aa2b6bd4399679255b6573355c38 | 2625600000000000000 | 2625600000000 |
| 0x27ed92336078231c6b6ac48da4c563e304a6db79 | 74880000000000000 | 74880000000 |
| Rewarder 0x78a0baa38c1859133ea8bb979e7150bca8d0c410 | 187200000000000000 | 187200000000 |
| 0x000000000000000000000000000000000000dead | 112320000000000000 | 112320000000 |

Vault-origin transfers sum exactly to the calldata amount. User-transfer shortfall: 374400000000000000 (12.48%). Observed non-user allocation: 20% other recipient, 50% rewarder, 30% dead. Other recipient role unverified.

The receipt ALSO contains AIDOGE-token-origin transfers. These are retained separately and must not automatically be attributed to withdrawal tax. Neither a full balanceOf delta nor position-storage decrement was measured. This sample does not prove the formula, cap, exemption status, current implementation semantics or a universal 8% surcharge.

## Matrix amendment

AIDOGE V2: GO for existing guarded position reads / HOLD for writes. Historical earlyWithdraw execution and destinations now observed; exact penalty arithmetic and balance/state reconciliation unresolved. This supersedes the earlier bounded-search statement that no AIDOGE early-withdraw example was located, without changing its historical search result.

No production configuration, wallet writes or deployment changed. Reports remain ignored by Git.
