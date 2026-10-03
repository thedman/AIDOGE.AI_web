import { expect, it } from 'vitest'
import { encodeFunctionData, parseUnits } from 'viem'
import { CLAIM_ROUTER_CANDIDATE_ABI, ENABLE_VAULT_WRITES, V2_VAULT_CANDIDATE_ABI } from './candidateActionsAbi'

it('keeps candidate writes disabled', () => {
  expect(ENABLE_VAULT_WRITES).toBe(false)
})
it('encodes the observed parameterless withdrawal and router claim', () => {
  expect(encodeFunctionData({ abi: V2_VAULT_CANDIDATE_ABI, functionName: 'withdraw' })).toBe('0x3ccfd60b')
  expect(encodeFunctionData({ abi: CLAIM_ROUTER_CANDIDATE_ABI, functionName: 'claimAll' })).toBe('0xd1058e59')
})
it.each([
  ['earlyWithdraw', '0x6b5b9696'],
  ['increaseLockAmount', '0x403f4447'],
  ['increaseUnlockTime', '0x7c616fe6'],
] as const)('encodes observed %s selector with one uint256', (functionName, selector) => {
  const data = encodeFunctionData({ abi: V2_VAULT_CANDIDATE_ABI, functionName, args: [1n] })
  expect(data.slice(0, 10)).toBe(selector)
  expect(data.length).toBe(74)
})
it.each([6, 18])('encodes exact token precision at %s decimals without calculating a fee', decimals => {
  const amount = parseUnits('1.25', decimals)
  const data = encodeFunctionData({ abi: V2_VAULT_CANDIDATE_ABI, functionName: 'earlyWithdraw', args: [amount] })
  expect(BigInt(`0x${data.slice(10)}`)).toBe(125n * 10n ** BigInt(decimals - 2))
})
