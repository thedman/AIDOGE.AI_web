import type { Address } from 'viem'

export type ReadinessStatus = 'GO' | 'HOLD' | 'REJECT'

export interface ContractSecurityAudit {
  contractName: string
  address?: Address
  provenance: string
  isVerified: boolean | null
  isProxy: boolean | null
  implementationAddress?: Address
  ownerAddress?: Address
  isOwnerRenounced: boolean | null
  isPaused: boolean | null
  readStatus: ReadinessStatus
  writeStatus: ReadinessStatus
  rationale: string
  verifiedReadMethods: readonly string[]
  verifiedWriteMethods: readonly string[]
  checkedAt?: string
  chainId: number
  bytecodeBytes?: number
}
