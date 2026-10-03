import { useQuery } from '@tanstack/react-query'
import { useConnection, usePublicClient } from 'wagmi'
import { adminSlot, expectedAdmin, implementationSlot, matchesStorageAddress, vaultAbi, vaultImplementation, vaults } from '../abi/vaultAbi'

class VaultBlockedError extends Error {}

export function useVaultPositions() {
  const connection = useConnection()
  const client = usePublicClient({ chainId: 42161 })
  const address = connection.address
  const enabled = connection.isConnected && connection.chainId === 42161 && !!address && !!client
  const query = useQuery({
    queryKey: ['vault-positions', 42161, address],
    enabled, gcTime: 0, retry: (count, error) => !(error instanceof VaultBlockedError) && count < 1,
    refetchInterval: enabled ? 12_000 : false,
    queryFn: async () => {
      if (!client || !address) throw new Error('Wallet unavailable')
      if (await client.getChainId() !== 42161) throw new VaultBlockedError('Unexpected RPC chain')
      const block = await client.getBlock()
      const blockNumber = block.number
      await Promise.all(vaults.map(async vault => {
        const implementation = await client.getStorageAt({ address: vault.address, slot: implementationSlot, blockNumber })
        const admin = await client.getStorageAt({ address: vault.address, slot: adminSlot, blockNumber })
        if (!matchesStorageAddress(implementation, vaultImplementation) || !matchesStorageAddress(admin, expectedAdmin)) {
          throw new VaultBlockedError(`${vault.name}: proxy changed or unavailable; reads blocked`)
        }
        const code = await client.getCode({ address: vaultImplementation, blockNumber })
        if (!code || code === '0x') throw new VaultBlockedError('Vault implementation has no code')
      }))
      const positions = await Promise.all(vaults.map(async vault => {
        const [principal, end] = await client.readContract({ address: vault.address, abi: vaultAbi, functionName: 'locks', args: [address], blockNumber })
        if (end > 8640000000000n) throw new Error('Invalid lock timestamp')
        const status = principal === 0n ? 'empty' : end <= block.timestamp ? 'expired' : 'active'
        return { ...vault, principal, end, status, expired: status === 'expired' }
      }))
      return { positions, blockNumber }
    },
  })
  const data = enabled && !query.isError ? query.data : undefined
  const wrong_network = connection.isConnected && connection.chainId !== 42161
  const status = !connection.isConnected ? 'disconnected' : wrong_network ? 'wrong_network'
    : query.error instanceof VaultBlockedError ? 'blocked' : query.isError ? 'error' : data ? 'ready' : 'loading'
  return { ...query, enabled, isConnected: connection.isConnected, data, status, wrong_network, isProxyValid: !!data }
}
