import { useBalance, useConnection, useReadContracts } from 'wagmi'
import { AIDOGE_ADDRESS, aidogeAbi } from '../abi/aidogeAbi'
import { arbitrum } from '../config/chains'

export function useUserAidogeBalance() {
  const connection = useConnection()
  const enabled = connection.isConnected && connection.chainId === arbitrum.id && !!connection.address
  const token = useReadContracts({
    contracts: [
      { address: AIDOGE_ADDRESS, abi: aidogeAbi, chainId: arbitrum.id, functionName: 'balanceOf', args: [connection.address!] },
      { address: AIDOGE_ADDRESS, abi: aidogeAbi, chainId: arbitrum.id, functionName: 'decimals' },
    ],
    query: { enabled, refetchInterval: enabled ? 12_000 : false, gcTime: 0, retry: 1 },
  })
  const gas = useBalance({
    address: connection.address, chainId: arbitrum.id,
    query: { enabled, refetchInterval: enabled ? 12_000 : false, gcTime: 0, retry: 1 },
  })
  return {
    ...connection, enabled,
    tokenBalance: enabled ? token.data?.[0].result : undefined,
    decimals: enabled ? token.data?.[1].result : undefined,
    gasBalance: enabled ? gas.data : undefined,
    tokenLoading: enabled && token.isPending,
    gasLoading: enabled && gas.isPending,
    tokenError: enabled && (token.isError || !!token.data?.some(read => read.status === 'failure')),
    gasError: enabled && gas.isError,
  }
}
