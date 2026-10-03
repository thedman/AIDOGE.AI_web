// @vitest-environment jsdom
import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decodeFunctionResult, encodeAbiParameters, formatUnits } from 'viem'
import { adminSlot, expectedAdmin, vaultAbi, vaultImplementation, vaults } from '../abi/vaultAbi'
import { useVaultPositions } from './useVaultPositions'

const mocks = vi.hoisted(() => ({
  connection: { address: '0x1111111111111111111111111111111111111111', isConnected: true, chainId: 42161 },
  client: { getChainId: vi.fn(), getBlock: vi.fn(), getStorageAt: vi.fn(), getCode: vi.fn(), readContract: vi.fn() },
}))
vi.mock('wagmi', () => ({ useConnection: () => mocks.connection, usePublicClient: () => mocks.client }))
const clients: QueryClient[] = []
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  clients.push(client)
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  return { ...renderHook(useVaultPositions, { wrapper }), client }
}
const padded = (address: string) => `0x${'0'.repeat(24)}${address.slice(2)}`
const payload = (principal: bigint, end: bigint) => encodeAbiParameters([{ type: 'uint256' }, { type: 'uint256' }], [principal, end])
function reads(principal: bigint, end: bigint) {
  mocks.client.readContract.mockImplementation(async () => decodeFunctionResult({ abi: vaultAbi, functionName: 'locks', data: payload(principal, end) }))
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.connection = { address: '0x1111111111111111111111111111111111111111', isConnected: true, chainId: 42161 }
  mocks.client.getChainId.mockResolvedValue(42161)
  mocks.client.getBlock.mockResolvedValue({ number: 42n, timestamp: 1700000000n })
  mocks.client.getStorageAt.mockImplementation(async ({ slot }) => padded(slot === adminSlot ? expectedAdmin : vaultImplementation))
  mocks.client.getCode.mockResolvedValue('0x6000')
  reads(1234567n, 1700000060n)
})
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()) })

describe('vault position reads', () => {
  it('decodes both vaults, formats precision and exposes UTC expiry at a pinned block', async () => {
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.isProxyValid).toBe(true)
    const positions = result.current.data!.positions
    expect(positions.map(p => p.status)).toEqual(['active', 'active'])
    expect(positions.map(p => formatUnits(p.principal, p.decimals))).toEqual(['1.234567', '0.000000000001234567'])
    expect(new Date(Number(positions[0].end) * 1000).toISOString()).toBe('2023-11-14T22:14:20.000Z')
    for (const [call] of mocks.client.readContract.mock.calls) expect(call.blockNumber).toBe(42n)
    expect(mocks.client.readContract.mock.calls.map(([call]) => call.address)).toEqual(vaults.map(v => v.address))
  })
  it.each([1699999999n, 1700000000n])('marks lock expired at or before chain timestamp: %s', async end => {
    reads(1n, end)
    const { result } = mount()
    await waitFor(() => expect(result.current.data?.positions[0].status).toBe('expired'))
  })
  it('preserves genuine zero positions', async () => {
    reads(0n, 0n)
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.data?.positions.every(p => p.status === 'empty' && p.principal === 0n)).toBe(true)
  })
  it('rejects timestamps outside the supported date range', async () => {
    reads(1n, 8640000000001n)
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error?.message).toBe('Invalid lock timestamp')
    expect(result.current.data).toBeUndefined()
  })
  it('does not expose the previous account while a new account loads', async () => {
    const { result, rerender } = mount()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    mocks.client.readContract.mockImplementation(() => new Promise(() => {}))
    mocks.connection.address = '0x2222222222222222222222222222222222222222'
    rerender()
    expect(result.current.status).toBe('loading')
    expect(result.current.data).toBeUndefined()
  })
  it.each(['0x', '0x1234', `0x${'0'.repeat(64)}`] as const)('contains malformed/truncated ABI errors: %s', async data => {
    mocks.client.readContract.mockImplementation(async () => decodeFunctionResult({ abi: vaultAbi, functionName: 'locks', data }))
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeInstanceOf(Error)
  })
  it.each(['implementation', 'admin'])('blocks every position read on a %s mismatch', async field => {
    mocks.client.getStorageAt.mockImplementation(async ({ slot }) => padded((slot === adminSlot) === (field === 'admin') ? '0x2222222222222222222222222222222222222222' : slot === adminSlot ? expectedAdmin : vaultImplementation))
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('blocked'))
    expect(result.current.isProxyValid).toBe(false)
    expect(mocks.client.readContract).not.toHaveBeenCalled()
    expect(mocks.client.getChainId).toHaveBeenCalledTimes(1)
  })
  it('blocks an RPC serving a different chain', async () => {
    mocks.client.getChainId.mockResolvedValue(1)
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('blocked'))
    expect(mocks.client.getBlock).not.toHaveBeenCalled()
  })
  it('retries a failed call once then reports error, not zero', async () => {
    mocks.client.readContract.mockRejectedValue(new Error('RPC timeout'))
    const { result } = mount()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(mocks.client.getChainId).toHaveBeenCalledTimes(2)
    expect(result.current.error?.message).toBe('RPC timeout')
    expect(result.current.data).toBeUndefined()
  })
  it.each([1, 11155111, 421614])('hides cached data and disables new calls on chain %s', async chainId => {
    const { result, rerender, client } = mount()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    const calls = mocks.client.readContract.mock.calls.length
    mocks.connection.chainId = chainId
    rerender()
    expect(result.current.status).toBe('wrong_network')
    expect(result.current.wrong_network).toBe(true)
    expect(result.current.data).toBeUndefined()
    await client.invalidateQueries()
    expect(mocks.client.readContract).toHaveBeenCalledTimes(calls)
  })
  it('clears visible positions immediately on disconnect', async () => {
    const { result, rerender } = mount()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    mocks.connection.isConnected = false
    rerender()
    expect(result.current.status).toBe('disconnected')
    expect(result.current.data).toBeUndefined()
    expect(result.current.isProxyValid).toBe(false)
  })
  it('hides old data when a refresh fails', async () => {
    const { result, client } = mount()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    mocks.client.readContract.mockRejectedValue(new Error('RPC timeout'))
    await client.invalidateQueries()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.data).toBeUndefined()
  })
})
