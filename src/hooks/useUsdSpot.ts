import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { formatUnits, parseAbi } from 'viem'

export const ethUsdFeed = '0x639fe6ab55c921f74e7fac1ee960c0b6293ba612'
// https://docs.chain.link/data-feeds/l2-sequencer-feeds
export const sequencerFeed = '0xfdb631f5ee196f0ed6faa767959853a9f217697d'
const abi = parseAbi(['function decimals() view returns (uint8)', 'function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)'])
type Round = readonly [bigint, bigint, bigint, bigint, bigint]
export function oracleFailure(decimals: number, price: Round, sequencer: Round, now: bigint) {
  if (sequencer[1] !== 0n || sequencer[2] <= 0n || sequencer[2] > now || now - sequencer[2] <= 3600n) return 'Sequencer unavailable or recovery grace period active'
  if (decimals !== 8 || price[0] <= 0n || price[1] <= 0n || price[3] <= 0n || price[3] > now || now - price[3] > 3600n || price[4] < price[0]) return 'Invalid or stale ETH/USD oracle round'
  return undefined
}
export function deriveUsd(reserve0: bigint, reserve1: bigint, answer: bigint) {
  if (reserve0 <= 0n || reserve1 <= 0n || answer <= 0n) return undefined
  return `$${formatUnits(reserve1 * answer * 10n ** 10n / reserve0, 30)}`
}
export function useUsdSpot(reserves: readonly [bigint, bigint, number, number] | undefined) {
  const client = usePublicClient({ chainId: 42161 })
  const query = useQuery({
    queryKey: ['eth-usd-oracle', 42161], enabled: !!client, retry: 1, refetchInterval: 12_000,
    queryFn: async () => {
      if (!client || await client.getChainId() !== 42161) throw new Error('Unexpected RPC chain')
      const block = await client.getBlock()
      const blockNumber = block.number
      const [decimals, price, sequencer] = await Promise.all([
        client.readContract({ address: ethUsdFeed, abi, functionName: 'decimals', blockNumber }),
        client.readContract({ address: ethUsdFeed, abi, functionName: 'latestRoundData', blockNumber }),
        client.readContract({ address: sequencerFeed, abi, functionName: 'latestRoundData', blockNumber }),
      ])
      const reason = oracleFailure(decimals, price, sequencer, block.timestamp)
      if (reason) throw new Error(reason)
      return { answer: price[1], updatedAt: price[3], blockNumber }
    },
  })
  // Hide cached quotes on RPC errors or if polling has stopped for over a minute.
  const data = !query.isError && Date.now() - query.dataUpdatedAt <= 60_000 ? query.data : undefined
  return { ...query, usd: reserves && data ? deriveUsd(reserves[0], reserves[1], data.answer) : undefined }
}
