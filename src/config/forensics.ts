import { AIDOGE_ADDRESS } from '../abi/aidogeAbi'
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
