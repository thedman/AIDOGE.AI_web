// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { adminSlot, expectedAdmin, vaultImplementation } from '../abi/vaultAbi'
import { useVaultWriteProtection } from './useVaultWriteProtection'

const state = vi.hoisted(() => ({
  connection: { isConnected: true, chainId: 42161, address: '0x1111111111111111111111111111111111111111' },
  client: { getChainId: vi.fn(), getBlock: vi.fn(), getStorageAt: vi.fn(), getCode: vi.fn(), readContract: vi.fn(), simulateContract: vi.fn() },
}))
vi.mock('wagmi', () => ({ useConnection: () => state.connection, usePublicClient: () => state.client }))
vi.mock('viem', async importOriginal => ({ ...await importOriginal<typeof import('viem')>(), keccak256: () => '0x5ac6b5587499f43b3651444c1155101f9f247bbd798bd04a788cc075840505a3' }))
beforeEach(() => {
  vi.resetAllMocks()
  state.connection.isConnected = true; state.connection.chainId = 42161
  state.connection.address = '0x1111111111111111111111111111111111111111'
  state.client.getChainId.mockResolvedValue(42161)
  state.client.getBlock.mockResolvedValue({ number: 42n, hash: '0x1234', timestamp: 1000n })
  state.client.getStorageAt.mockImplementation(({ slot }) => Promise.resolve(`0x${(slot === adminSlot ? expectedAdmin : vaultImplementation).slice(2).padStart(64, '0')}`))
  state.client.getCode.mockResolvedValue('0x6000')
  state.client.readContract.mockImplementation(({ functionName }) => Promise.resolve(({ locks: [1000000000n, 605799n], earlyWithdrawBpsPerWeek: 96n, redistributeBps: 5000n, burnBps: 3000n, breaker: false } as Record<string, unknown>)[functionName]))
  state.client.simulateContract.mockResolvedValue({ result: undefined })
})
afterEach(cleanup)
it('pins every call and exposes only a HOLD review, never a write request', async () => {
  const { result } = renderHook(useVaultWriteProtection)
  await act(() => result.current.inspect(1000000000n, 0n))
  expect(result.current.review?.math.netPayoutEstimate).toBe(990400000n)
  expect(result.current.canWrite).toBe(false)
  expect(state.client.simulateContract.mock.calls[0][0]).toMatchObject({ blockNumber: 42n, functionName: 'earlyWithdraw', args: [1000000000n] })
  expect(result.current).not.toHaveProperty('writeContract')
})
it.each(['floor', 'simulation', 'proxy', 'breaker', 'chain'])('blocks %s failures', async failure => {
  if (failure === 'simulation') state.client.simulateContract.mockRejectedValue(new Error('out of gas'))
  if (failure === 'proxy') state.client.getStorageAt.mockResolvedValue('0x00')
  if (failure === 'breaker') state.client.readContract.mockImplementation(({ functionName }) => Promise.resolve(functionName === 'breaker' ? true : functionName === 'locks' ? [1000000000n, 605799n] : 96n))
  if (failure === 'chain') state.client.getChainId.mockResolvedValue(1)
  const { result } = renderHook(useVaultWriteProtection)
  await act(() => result.current.inspect(1000000000n, failure === 'floor' ? 1000000000n : 0n))
  expect(result.current.review).toBeNull()
  expect(result.current.error).toContain('blocked')
  expect(result.current.canWrite).toBe(false)
})
it('clears a successful review on account change', async () => {
  const { result, rerender } = renderHook(useVaultWriteProtection)
  await act(() => result.current.inspect(1000000000n, 0n))
  state.connection.address = '0x2222222222222222222222222222222222222222'
  rerender()
  expect(result.current.review).toBeNull()
})
it('does not restore a review after inputs reset during a pending simulation', async () => {
  let finish!: () => void
  state.client.simulateContract.mockImplementation(() => new Promise<void>(resolve => { finish = resolve }))
  const { result } = renderHook(useVaultWriteProtection)
  let request!: Promise<void>
  await act(async () => { request = result.current.inspect(1000000000n, 0n); await new Promise(resolve => setTimeout(resolve, 0)) })
  act(() => result.current.reset())
  await act(async () => { finish(); await request })
  expect(result.current.review).toBeNull()
})
