import { AIDOGE_ADDRESS } from '../abi/aidogeAbi'
import { rewarders } from '../abi/rewarderAbi'
import type { ContractSecurityAudit } from '../types/forensics'

const unknown = {
  chainId: 42161, isVerified: null, isProxy: null, isOwnerRenounced: null,
  isPaused: null, writeStatus: 'HOLD', verifiedWriteMethods: [],
} as const

export const contractAudits: ContractSecurityAudit[] = [
  {
    ...unknown, contractName: 'Token info and burn', address: AIDOGE_ADDRESS,
    provenance: 'Existing Arbitrum token reads; bytecode confirmed on two RPC endpoints.',
    readStatus: 'GO', bytecodeBytes: 20732,
    verifiedReadMethods: ['decimals', 'totalSupply', 'balanceOf', 'owner'],
    rationale: 'Public reads implemented. Transfers and other writes are not enabled or approved by this audit.',
    checkedAt: '2026-10-03',
  },
  {
    ...unknown, contractName: 'Claim router (historical routing map)',
    address: '0xb38f360234ec6e79676eea7a766100f82004b6a3',
    isProxy: true, implementationAddress: '0x468c849af03e6a9e63cf652be3d700ad2f7683e9',
    provenance: 'Successful claimAll selector 0xd1058e59 in transaction 0x871bab18ad02db7ec3bbd822be9e005f56a038d097084e9532b955d450ac851d, block 511349453.',
    readStatus: 'GO', verifiedReadMethods: [], checkedAt: '2026-10-03',
    rationale: 'GO for historical routing inspection only; no router reward preview is enabled. Proxy implementation checked separately in prior RPC evidence. Source verification and current write safety remain unconfirmed.',
  },
  ...rewarders.map((rewarder): ContractSecurityAudit => ({
    ...unknown, contractName: `${rewarder.name} rewarder`, address: rewarder.address,
    provenance: 'Direct token payout to the investigated holder in successful transaction 0x871bab18ad02db7ec3bbd822be9e005f56a038d097084e9532b955d450ac851d; weekly cursor reads independently checked at block 511428752.',
    readStatus: 'GO', checkedAt: '2026-10-03',
    verifiedReadMethods: ['weekCursor', 'weekCursorOf', 'tokensPerWeek', 'totalSupplyAt', 'balanceOfAt'],
    rationale: 'GO for reconstructed read-only weekly estimates, not verified claim quotes. Historical payouts corroborate rewarder identity; source, proxy controls and future payout behavior remain unconfirmed. All writes HOLD.',
  })),
  ...([
    ['AICODE token', '0x7c8121661a9222c3d39b8806db6a5e0a02f0b9c7'],
    ['Staking / vault', '0xd648e83d0b02888d1b2c1e41b53cb83c663d70ee'],
    ['Camelot LP candidate', '0x296f8664585e135d7be243fee12180a4e349277a'],
  ] as const).map(([contractName, address]): ContractSecurityAudit => ({
    ...unknown, contractName, address, readStatus: 'HOLD', bytecodeBytes: 0,
    provenance: 'User-supplied candidate; claimed deployment linkage remains unverified.',
    rationale: 'No bytecode on Arbitrum One at this candidate address on either checked RPC endpoint. Contract identity and ABI are unconfirmed.',
    verifiedReadMethods: [], checkedAt: '2026-10-03',
  })),
  {
    ...unknown, contractName: 'ARB distribution candidate', address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
    provenance: 'User-supplied token address; identity reads and bytecode confirmed via RPC. AIDOGE distribution linkage unconfirmed.',
    readStatus: 'HOLD', bytecodeBytes: 2593, checkedAt: '2026-10-03',
    verifiedReadMethods: ['name', 'symbol', 'decimals', 'totalSupply'],
    rationale: 'ARB identity reads succeed. Claimed Lucky Drop / tax linkage remains unverified; no distribution reads are enabled.',
  },
  {
    ...unknown, contractName: 'NFT prologue', provenance: 'No candidate supplied.',
    readStatus: 'HOLD', verifiedReadMethods: [], rationale: 'Pending verified address and mint-condition review.',
  },
]
