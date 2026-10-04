import { expect, it } from 'vitest'
import { contractAudits } from './forensics'
import { vaults, vaultImplementation } from '../abi/vaultAbi'

it('keeps unconfirmed secondary candidates out of read coverage', () => {
  const candidates = contractAudits.filter(audit => audit.bytecodeBytes === 0)
  expect(candidates).toHaveLength(3)
  for (const audit of candidates) {
    expect(audit.readStatus).toBe('HOLD')
    expect(audit.verifiedReadMethods).toEqual([])
    expect(audit.isVerified).toBeNull()
    expect(audit.isProxy).toBeNull()
  }
})

it('keeps every contract write status on HOLD', () => {
  expect(contractAudits.every(audit => audit.writeStatus === 'HOLD' && audit.verifiedWriteMethods.length === 0)).toBe(true)
})

it('maps both V2 vaults to guarded position reads without promoting writes or source verification', () => {
  for (const vault of vaults) {
    const audit = contractAudits.find(item => item.address === vault.address)!
    expect(audit.contractName).toBe(`${vault.name} Vault V2`)
    expect(audit.readStatus).toBe('GO')
    expect(audit.verifiedReadMethods).toEqual(['locks'])
    expect(audit.isProxy).toBe(true)
    expect(audit.implementationAddress).toBe(vaultImplementation)
    expect(audit.isVerified).toBeNull()
    expect(audit.writeStatus).toBe('HOLD')
  }
  expect(contractAudits.find(item => item.address === '0xd648e83d0b02888d1b2c1e41b53cb83c663d70ee')?.contractName).toContain('historical reference')
})

it('limits rewarder GO status to reconstructed reads, not source verification', () => {
  const rewarders = contractAudits.filter(audit => audit.contractName.endsWith('rewarder'))
  expect(rewarders).toHaveLength(3)
  for (const audit of rewarders) {
    expect(audit.readStatus).toBe('GO')
    expect(audit.isVerified).toBeNull()
    expect(audit.verifiedReadMethods).toContain('weekCursorOf')
    expect(audit.verifiedWriteMethods).toEqual([])
  }
  const router = contractAudits.find(audit => audit.contractName.startsWith('Claim router'))!
  expect(router.readStatus).toBe('GO')
  expect(router.verifiedReadMethods).toEqual([])
  expect(router.isVerified).toBeNull()
})

it('does not infer an ecosystem distribution link from ARB identity reads', () => {
  const arb = contractAudits.find(audit => audit.contractName === 'ARB distribution candidate')!
  expect(arb.bytecodeBytes).toBeGreaterThan(0)
  expect(arb.verifiedReadMethods).toContain('symbol')
  expect(arb.readStatus).toBe('HOLD')
  expect(arb.isProxy).toBeNull()
})
