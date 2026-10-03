import { useQuery } from '@tanstack/react-query'
import { useConnection, usePublicClient } from 'wagmi'
import { rewarderAbi, rewarders } from '../abi/rewarderAbi'
import { completedWeeks, estimateWeek } from './rewardEstimate'

export function useRewardEstimates() {
  const connection = useConnection()
  const client = usePublicClient({ chainId: 42161 })
  const address = connection.address
  const enabled = connection.isConnected && connection.chainId === 42161 && !!address && !!client
  const query = useQuery({
    queryKey: ['reward-estimates', 42161, address], enabled, gcTime: 0, retry: 1,
    refetchInterval: enabled ? 60_000 : false,
    queryFn: async () => {
      if (!client || !address || await client.getChainId() !== 42161) throw new Error('Arbitrum RPC unavailable')
      const block = await client.getBlock()
      const results = await Promise.all(rewarders.map(async rewarder => {
        try {
          const code = await client.getCode({ address: rewarder.address, blockNumber: block.number })
          if (!code || code === '0x') throw new Error('Rewarder code unavailable')
          const base = { address: rewarder.address, abi: rewarderAbi, blockNumber: block.number } as const
          const [cursor, globalCursor] = await Promise.all([
            client.readContract({ ...base, functionName: 'weekCursorOf', args: [address] }),
            client.readContract({ ...base, functionName: 'weekCursor' }),
          ])
          const weeks = completedWeeks(cursor, globalCursor, block.timestamp)
          let amount = 0n
          // Sequential weeks bound concurrent RPC load; tokens remain independent.
          for (const week of weeks) {
            const [tokens, supply, balance] = await Promise.all([
              client.readContract({ ...base, functionName: 'tokensPerWeek', args: [week] }),
              client.readContract({ ...base, functionName: 'totalSupplyAt', args: [week] }),
              client.readContract({ ...base, functionName: 'balanceOfAt', args: [address, week] }),
            ])
            amount += estimateWeek(tokens, balance, supply)
          }
          return { ...rewarder, amount, error: undefined, weeks: weeks.length }
        } catch (error) {
          return { ...rewarder, amount: undefined, error: error instanceof Error ? error.message : 'Reward reads failed', weeks: undefined }
        }
      }))
      return { results, blockNumber: block.number }
    },
  })
  return { ...query, enabled, data: enabled && !query.isError ? query.data : undefined }
}
