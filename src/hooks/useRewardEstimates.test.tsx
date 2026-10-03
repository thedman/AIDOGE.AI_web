// @vitest-environment jsdom
import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { rewarders } from '../abi/rewarderAbi'
import { WEEK } from './rewardEstimate'
import { useRewardEstimates } from './useRewardEstimates'

const mocks = vi.hoisted(() => ({
  connection: { address: '0x1111111111111111111111111111111111111111', isConnected: true, chainId: 42161 },
  client: { getChainId: vi.fn(), getBlock: vi.fn(), getCode: vi.fn(), readContract: vi.fn() },
}))
vi.mock('wagmi', () => ({ useConnection: () => mocks.connection, usePublicClient: () => mocks.client }))
let client: QueryClient
beforeEach(() => {
  vi.resetAllMocks()
  mocks.connection.isConnected = true
  mocks.connection.chainId = 42161
  mocks.client.getChainId.mockResolvedValue(42161)
  mocks.client.getBlock.mockResolvedValue({ number: 42n, timestamp: WEEK * 12n })
  mocks.client.getCode.mockResolvedValue('0x6000')
  mocks.client.readContract.mockImplementation(async ({ functionName }) => ({
    weekCursorOf: WEEK * 10n, weekCursor: WEEK * 13n,
    tokensPerWeek: 100n, totalSupplyAt: 10n, balanceOfAt: 1n,
  })[functionName as 'weekCursor'])
  client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
})
afterEach(() => { cleanup(); client.clear() })
function mount() {
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  return renderHook(useRewardEstimates, { wrapper })
}
it('pins every token read and returns distinct completed-week estimates', async () => {
  const { result } = mount()
  await waitFor(() => expect(result.current.data?.results).toHaveLength(3))
  expect(result.current.data?.results.map(r => r.amount)).toEqual([20n, 20n, 20n])
  for (const [call] of mocks.client.readContract.mock.calls) {
    expect(call.blockNumber).toBe(42n)
    if (call.functionName === 'tokensPerWeek') expect(call.args[0]).toBeLessThan(WEEK * 12n)
  }
})
it('isolates a failed rewarder without converting it to zero', async () => {
  const normal = mocks.client.readContract.getMockImplementation()!
  mocks.client.readContract.mockImplementation(async args => {
    if (args.address === rewarders[0].address) throw new Error('Decode failed')
    return normal(args)
  })
  const { result } = mount()
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data?.results[0]).toMatchObject({ amount: undefined, error: 'Decode failed' })
  expect(result.current.data?.results[1].amount).toBe(20n)
})
it.each(['disconnect', 'network'])('hides cached estimates after %s', async change => {
  const { result, rerender } = mount()
  await waitFor(() => expect(result.current.data).toBeDefined())
  const count = mocks.client.readContract.mock.calls.length
  if (change === 'disconnect') mocks.connection.isConnected = false
  else mocks.connection.chainId = 1
  rerender()
  expect(result.current.data).toBeUndefined()
  expect(result.current.enabled).toBe(false)
  await client.invalidateQueries()
  expect(mocks.client.readContract).toHaveBeenCalledTimes(count)
})
