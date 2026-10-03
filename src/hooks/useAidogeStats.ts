import { useReadContracts } from 'wagmi'
import { AIDOGE_ADDRESS, BURN_ADDRESS, aidogeAbi } from '../abi/aidogeAbi'
import { arbitrum } from '../config/chains'

const contract = { address: AIDOGE_ADDRESS, abi: aidogeAbi, chainId: arbitrum.id } as const

export function useAidogeStats() {
  const query = useReadContracts({
    contracts: [
      { ...contract, functionName: 'totalSupply' },
      { ...contract, functionName: 'balanceOf', args: [BURN_ADDRESS] },
      { ...contract, functionName: 'decimals' },
      { ...contract, functionName: 'owner' },
    ],
    query: { refetchInterval: 12_000, staleTime: 10_000, retry: 1 },
  })
  const totalSupply = query.data?.[0].result
  const burnBalance = query.data?.[1].result
  const decimals = query.data?.[2].result
  const owner = query.data?.[3].result
  const circulatingSupply = totalSupply !== undefined && burnBalance !== undefined && burnBalance <= totalSupply
    ? totalSupply - burnBalance : undefined
  const incomplete = query.data?.some(read => read.status === 'failure') ?? false
  return { ...query, totalSupply, burnBalance, decimals, owner, circulatingSupply, incomplete }
}
