import { createConfig, fallback, http, injected } from 'wagmi'
import { arbitrum } from './chains'

export const config = createConfig({
  chains: [arbitrum],
  connectors: [injected()],
  transports: {
    [arbitrum.id]: fallback([
      http('https://arb1.arbitrum.io/rpc', { timeout: 8_000, retryCount: 0 }),
      http('https://arbitrum-one-rpc.publicnode.com', { timeout: 8_000, retryCount: 0 }),
    ]),
  },
})
