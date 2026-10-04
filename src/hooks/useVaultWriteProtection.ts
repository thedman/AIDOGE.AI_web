import { useEffect, useRef, useState } from 'react'
import { useConnection, usePublicClient } from 'wagmi'
import { encodeFunctionData, keccak256, parseAbi } from 'viem'
import { adminSlot, expectedAdmin, implementationSlot, matchesStorageAddress, vaultImplementation, vaults } from '../abi/vaultAbi'
import { calculateEarlyWithdrawPenalty } from '../utils/vaultCalculator'

const abi = parseAbi([
  'function locks(address) view returns (uint256 principal, uint256 end)',
  'function earlyWithdraw(uint256 amount)',
  'function earlyWithdrawBpsPerWeek() view returns (uint256)',
  'function redistributeBps() view returns (uint256)',
  'function burnBps() view returns (uint256)',
  'function breaker() view returns (bool)',
])
const runtimeHash = '0x5ac6b5587499f43b3651444c1155101f9f247bbd798bd04a788cc075840505a3'
export function useVaultWriteProtection() {
  const connection = useConnection()
  const client = usePublicClient({ chainId: 42161 })
  const [review, setReview] = useState<null | {
    account: string; createdAt: number; amount: bigint; minimum: bigint;
    blockNumber: bigint; blockHash: string; calldata: string;
    math: ReturnType<typeof calculateEarlyWithdrawPenalty>;
  }>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const generation = useRef(0)
  useEffect(() => { generation.current++; setReview(null); setError(''); setPending(false) }, [connection.address, connection.chainId, connection.isConnected])
  useEffect(() => {
    if (!review) return
    const timeout = window.setTimeout(() => setReview(null), Math.max(0, 30000 - (Date.now() - review.createdAt)))
    return () => window.clearTimeout(timeout)
  }, [review])
  const enabled = connection.isConnected && connection.chainId === 42161 && !!connection.address && !!client
  async function inspect(amount: bigint, minimum: bigint) {
    const request = ++generation.current
    setReview(null); setError(''); setPending(true)
    try {
      if (!enabled || !client || !connection.address) throw new Error('Connect on Arbitrum One first.')
      if (minimum < 0n) throw new Error('Minimum must not be negative.')
      if (await client.getChainId() !== 42161) throw new Error('RPC chain mismatch.')
      const block = await client.getBlock()
      if (!block.hash || block.number === null) throw new Error('Pinned block unavailable.')
      const address = vaults[0].address
      const options = { address, blockNumber: block.number }
      const implementation = await client.getStorageAt({ ...options, slot: implementationSlot })
      const admin = await client.getStorageAt({ ...options, slot: adminSlot })
      const code = await client.getCode({ address: vaultImplementation, blockNumber: block.number })
      if (!matchesStorageAddress(implementation, vaultImplementation) || !matchesStorageAddress(admin, expectedAdmin) || !code || keccak256(code) !== runtimeHash) throw new Error('Proxy or implementation differs from the reconstruction.')
      const position = await client.readContract({ ...options, abi, functionName: 'locks', args: [connection.address] })
      const weekly = await client.readContract({ ...options, abi, functionName: 'earlyWithdrawBpsPerWeek' })
      const redistribute = await client.readContract({ ...options, abi, functionName: 'redistributeBps' })
      const burn = await client.readContract({ ...options, abi, functionName: 'burnBps' })
      const breaker = await client.readContract({ ...options, abi, functionName: 'breaker' })
      if (breaker || amount > position[0]) throw new Error('Breaker active or principal insufficient.')
      const math = calculateEarlyWithdrawPenalty(amount, position[1], block.timestamp, weekly, redistribute, burn)
      if (math.netPayoutEstimate < minimum) throw new Error('Nominal return violates your advisory minimum.')
      await client.simulateContract({ ...options, abi, functionName: 'earlyWithdraw', args: [amount], account: connection.address })
      const pinned = await client.getBlock({ blockNumber: block.number })
      if (pinned.hash !== block.hash) throw new Error('Pinned block changed.')
      if (request === generation.current) setReview({ account: connection.address, createdAt: Date.now(), amount, minimum, blockNumber: block.number, blockHash: block.hash, calldata: encodeFunctionData({ abi, functionName: 'earlyWithdraw', args: [amount] }), math })
    } catch {
      if (request === generation.current) setError('Review blocked: invalid inputs, changed contract state, or unsuccessful RPC/simulation. No transaction was submitted.')
    } finally { if (request === generation.current) setPending(false) }
  }
  const visible = enabled && review && review.account === connection.address && Date.now() - review.createdAt < 30000 ? review : null
  return { inspect, review: visible, error, pending, enabled, reset: () => { generation.current++; setReview(null); setError(''); setPending(false) }, canWrite: false as const }
}
