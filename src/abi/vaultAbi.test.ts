import { describe, expect, it } from 'vitest'
import { encodeFunctionData } from 'viem'
import { matchesStorageAddress, vaultAbi, vaultImplementation } from './vaultAbi'

describe('reconstructed vault boundary', () => {
  it('encodes the observed locks selector', () => {
    expect(encodeFunctionData({ abi: vaultAbi, functionName: 'locks', args: ['0x0000000000000000000000000000000000000001'] }).slice(0, 10)).toBe('0x5de9a137')
  })
  it('accepts only the expected padded storage address', () => {
    expect(matchesStorageAddress(`0x${'0'.repeat(24)}${vaultImplementation.slice(2)}`, vaultImplementation)).toBe(true)
    expect(matchesStorageAddress(undefined, vaultImplementation)).toBe(false)
    expect(matchesStorageAddress('0x', vaultImplementation)).toBe(false)
    expect(matchesStorageAddress(`0x${'1'.repeat(64)}`, vaultImplementation)).toBe(false)
  })
})
