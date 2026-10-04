import { parseAbi, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { arbitrum } from '../config/chains'

export const poolAddress = '0x6a78e84fa0edad4d99eb90edc041cdbf85925961'
const aidoge = '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b'
const weth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const factory = '0x6eccab422d763ac031210895c81787e87b43a652'
const abi = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function factory() view returns (address)',
  'function getPair(address,address) view returns (address)',
  'function getReserves() view returns (uint112,uint112,uint16,uint16)',
])
const contract = { address: poolAddress, abi, chainId: arbitrum.id } as const

export function poolSpotPrice(reserve0: bigint, reserve1: bigint) {
  if (reserve0 <= 0n || reserve1 <= 0n) return undefined
  // Thirty decimal places retain useful precision for this low-unit-price token.
  return formatUnits(reserve1 * 10n ** 18n / reserve0, 30)
}

export function usePoolStats() {
  const query = useReadContracts({
    contracts: [
      { ...contract, functionName: 'token0' },
      { ...contract, functionName: 'token1' },
      { ...contract, functionName: 'factory' },
      { ...contract, address: factory, functionName: 'getPair', args: [aidoge, weth] },
      { ...contract, functionName: 'getReserves' },
    ],
    query: { refetchInterval: 12_000, staleTime: 10_000, retry: 1 },
  })
  const expected = [aidoge, weth, factory, poolAddress]
  const valid = !query.isError && expected.every((address, i) => {
    const read = query.data?.[i]
    return read?.status === 'success' && typeof read.result === 'string' && read.result.toLowerCase() === address
  })
  const read = query.data?.[4]
  const reserves = valid && read?.status === 'success' ? read.result : undefined
  return { ...query, reserves, price: reserves ? poolSpotPrice(reserves[0], reserves[1]) : undefined }
}
