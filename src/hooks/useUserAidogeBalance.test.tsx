// @vitest-environment jsdom
import { renderHook, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserAidogeBalance } from './useUserAidogeBalance'

const mocks = vi.hoisted(() => ({ connection: { address: '0x1111111111111111111111111111111111111111', isConnected: true, chainId: 42161 }, token: vi.fn(), gas: vi.fn() }))
vi.mock('wagmi', () => ({ useConnection: () => mocks.connection, useReadContracts: mocks.token, useBalance: mocks.gas }))
afterEach(cleanup)
beforeEach(() => {
  mocks.connection = { address: '0x1111111111111111111111111111111111111111', isConnected: true, chainId: 42161 }
  mocks.token.mockReset().mockReturnValue({ data: [{ result: 0n, status: 'success' }, { result: 6, status: 'success' }], isPending: false, isError: false })
  mocks.gas.mockReset().mockReturnValue({ data: { value: 1n, decimals: 18 }, isPending: false, isError: false })
})
describe('personal balance isolation', () => {
  it('pins both reads to Arbitrum and preserves a real zero balance', () => {
    const { result } = renderHook(useUserAidogeBalance)
    expect(result.current.tokenBalance).toBe(0n)
    expect(mocks.token.mock.lastCall?.[0].contracts[0].chainId).toBe(42161)
    expect(mocks.gas.mock.lastCall?.[0]).toMatchObject({ chainId: 42161, query: { enabled: true } })
  })
  it.each([1, 137, 11155111])('hides cached balances and stops reads on chain %s', chainId => {
    const { result, rerender } = renderHook(useUserAidogeBalance)
    mocks.connection.chainId = chainId
    rerender()
    expect(result.current.tokenBalance).toBeUndefined()
    expect(result.current.gasBalance).toBeUndefined()
    expect(mocks.token.mock.lastCall?.[0].query).toMatchObject({ enabled: false, refetchInterval: false })
    expect(mocks.gas.mock.lastCall?.[0].query.enabled).toBe(false)
  })
  it('disables and hides personal reads after disconnect', () => {
    const { result, rerender } = renderHook(useUserAidogeBalance)
    mocks.connection.isConnected = false
    rerender()
    expect(result.current.enabled).toBe(false)
    expect(result.current.tokenBalance).toBeUndefined()
    expect(mocks.gas.mock.lastCall?.[0].query.enabled).toBe(false)
  })
  it('changes the query address on account change', () => {
    const { rerender } = renderHook(useUserAidogeBalance)
    mocks.connection.address = '0x2222222222222222222222222222222222222222'
    rerender()
    expect(mocks.token.mock.lastCall?.[0].contracts[0].args).toEqual([mocks.connection.address])
    expect(mocks.gas.mock.lastCall?.[0].address).toBe(mocks.connection.address)
  })
  it('does not manufacture decimals or a zero balance from failed calls', () => {
    mocks.token.mockReturnValue({ data: [{ status: 'failure' }, { status: 'failure' }], isPending: false, isError: false })
    const { result } = renderHook(useUserAidogeBalance)
    expect(result.current.tokenError).toBe(true)
    expect(result.current.tokenBalance).toBeUndefined()
    expect(result.current.decimals).toBeUndefined()
  })
})
