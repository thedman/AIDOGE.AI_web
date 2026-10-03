# ArbDoge.AI website reconstruction

React and TypeScript reconstruction of the former `arbdoge.ai` homepage using recovered visual assets, with a read-only Arbitrum dashboard.

## Run locally

From this directory:

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Then open `http://127.0.0.1:5173/AIDOGE.AI_web/`. Run `npm run build` for TypeScript validation and a production build. `npm run preview` serves the build at the same repository subpath.

## Scope

- Reconstructs the public homepage, navigation, token overview, tokenomics, statistics, ecosystem cards, and footer.
- Uses archived public imagery recovered from the former website.
- Adds read-only Arbitrum One contract checks for the AIDOGE token dashboard.
- Connects injected browser wallets for public ETH and AIDOGE balance reads on Arbitrum One. Does not execute transactions, sign messages, purchase tokens, or provide staking functionality.
- External links are preserved only where their historical destination is known and useful.

## Contract forensics status

- AIDOGE token: `0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b`
- Verified read calls in this reconstruction: `decimals()`, `totalSupply()`, `balanceOf(0x000000000000000000000000000000000000dEaD)`, and `owner()`.
- `owner()` currently returns the zero address when read from Arbitrum One.
- Secondary AICODE, staking/vault, and NFT contract addresses were not present in the local static archive and remain on HOLD until extracted from an original bundle or verified source.
- Wagmi/viem multicall uses fallback transports at `https://arb1.arbitrum.io/rpc` and `https://arbitrum-one-rpc.publicnode.com`.
- TanStack Query polls every 12 seconds while active; this is a refresh interval, not an Arbitrum block-time claim. The refresh button requests an immediate update.
- Failed reads remain unavailable. Previously successful data is retained and marked stale when refresh fails.
- Circulating supply is derived from total supply minus the dead-wallet balance, not a contract-reported or full economic circulating supply.
- Zero-address ownership describes the owner getter only; it does not guarantee the absence of other permissions or proxies.

## Component architecture

- `src/abi/aidogeAbi.ts`: typed read-only ABI and addresses.
- `src/config/`: Arbitrum One and injected-wallet Wagmi configuration, including EIP-6963 wallet discovery.
- `src/hooks/useAidogeStats.ts`: batched reads and derived supply.
- `src/components/`: TokenDashboard, MetricCard, and ContractMatrix.
- `src/App.tsx`: archived page, React navigation, and native dialog.
- `src/styles/`: page styling and dashboard controls.

## Wallet connectivity

Open the Vite URL in a browser with MetaMask, Rabby, or Frame and choose Connect Wallet. Wallet connection requests account access only. Switching networks is explicitly initiated with Switch to Arbitrum One. ETH and AIDOGE reads are pinned to chain 42161 and disabled on other networks; cached personal values are hidden immediately on disconnect or unsupported-chain changes. Personal queries are keyed by address and expire when unused.

Injected wallets work without a WalletConnect project ID. Remote QR connections and standalone Coinbase SDK connections are not configured; Coinbase's injected browser extension can be discovered like other browser wallets.

The 12-second polling interval is an application refresh policy, not Arbitrum's block cadence. No contract write, simulation, transaction-send, or signing hooks are used. Run `npm test` for account, network, disconnect, and failure-state tests using mocked hook responses. Actual extension authorization and switching still require a browser wallet.

## GitHub Pages deployment

Public URL: https://thedman.github.io/AIDOGE.AI_web/

The deployment workflow installs locked dependencies with Node 24, runs all tests, builds, and uploads `dist` before deploying with GitHub Pages. Pushes to `main` and manual workflow runs deploy; pull requests only validate. The deploy job alone receives Pages and OIDC write permissions. Repository Settings > Pages must use GitHub Actions as its source.

Manual browser-wallet verification remains pending: account discovery, wrong-network switching, disconnect, and polling need a real extension. Automated tests exercise the injected connector with a test EIP-1193 provider and check personal-read isolation. Disconnect clears the active Wagmi connection; it does not erase browser-wallet authorization or all application storage.

## Archival basis

- Internet Archive capture: `2024-11-14 00:32:27 UTC`
- Common Crawl captures from September-December 2023
- Public project documentation and exchange/project listings
