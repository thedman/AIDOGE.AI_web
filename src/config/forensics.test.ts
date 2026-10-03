import { expect, it } from 'vitest'
import { contractAudits } from './forensics'

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

it('does not infer an ecosystem distribution link from ARB identity reads', () => {
  const arb = contractAudits.find(audit => audit.contractName === 'ARB distribution candidate')!
  expect(arb.bytecodeBytes).toBeGreaterThan(0)
  expect(arb.verifiedReadMethods).toContain('symbol')
  expect(arb.readStatus).toBe('HOLD')
  expect(arb.isProxy).toBeNull()
})
