// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { createConfig, http, injected } from 'wagmi'
import { connect, disconnect, getConnection, switchChain } from 'wagmi/actions'
import { arbitrum } from './chains'

it('connects an injected provider on an unsupported chain and switches only on request', async () => {
  let chainId = '0x1'
  const calls: string[] = []
  const listeners = new Map<string, Set<(value: unknown) => void>>()
  const address = '0x1111111111111111111111111111111111111111'
  const provider = {
    on(event: string, listener: (value: unknown) => void) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event)!.add(listener) },
    removeListener(event: string, listener: (value: unknown) => void) { listeners.get(event)?.delete(listener) },
    async request({ method, params }: { method: string; params?: [{ chainId: string }] }) {
      calls.push(method)
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [address]
      if (method === 'eth_chainId') return chainId
      if (method === 'wallet_switchEthereumChain') {
        chainId = params![0].chainId
        listeners.get('chainChanged')?.forEach(listener => listener(chainId))
        return null
      }
      throw new Error(`Unexpected wallet method: ${method}`)
    },
  }
  const config = createConfig({
    chains: [arbitrum], storage: null, multiInjectedProviderDiscovery: false,
    connectors: [injected({ target: { id: 'test-wallet', name: 'Test Wallet', provider: provider as never } })],
    transports: { [arbitrum.id]: http() },
  })
  await connect(config, { connector: config.connectors[0] })
  expect(getConnection(config).chainId).toBe(1)
  expect(calls).not.toContain('wallet_switchEthereumChain')
  await switchChain(config, { chainId: arbitrum.id })
  expect(getConnection(config).chainId).toBe(42161)
  await disconnect(config)
  expect(getConnection(config).isConnected).toBe(false)
  expect(calls.filter(method => !['eth_requestAccounts', 'eth_accounts', 'eth_chainId', 'wallet_switchEthereumChain', 'wallet_requestPermissions', 'wallet_revokePermissions'].includes(method))).toEqual([])
})
