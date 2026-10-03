import { parseAbi } from 'viem'

// Modeling only: return types and semantics still require implementation traces.
// These interfaces are deliberately not imported by wallet hooks or UI controls.
export const ENABLE_VAULT_WRITES = false as const
export const V2_VAULT_CANDIDATE_ABI = parseAbi([
  'function withdraw()',
  'function earlyWithdraw(uint256 _amount)',
  'function increaseLockAmount(uint256 _amount)',
  'function increaseUnlockTime(uint256 _unlockTime)',
])
export const CLAIM_ROUTER_CANDIDATE_ABI = parseAbi([
  'function claimAll()',
])
