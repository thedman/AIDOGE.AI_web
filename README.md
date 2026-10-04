# ArbDoge.AI website reconstruction

React and TypeScript reconstruction of the former `arbdoge.ai` homepage using recovered visual assets, with a read-only Arbitrum dashboard.

## Run locally

From this directory:

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Then open `http://127.0.0.1:5173/AIDOGE.AI_web/`. Run `npm run build` for TypeScript validation and a production build. `npm run preview` serves the build at the same repository subpath.

## Optional GA4 analytics

Set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in an ignored `.env.local` for local builds, or add the same repository variable under GitHub Settings > Secrets and variables > Actions > Variables for Pages. Rebuild/redeploy after changing it; Vite embeds this public ID at build time. Missing or invalid IDs disable analytics entirely.

Before enabling, turn OFF Enhanced Measurement in the GA4 web data stream. This app sends pageviews manually; automatic history pageviews would duplicate them, and automatic outbound-click/form events could collect URLs or state outside the intended scope. Do not add another Google tag, Google Signals, user-provided data collection, or automatic event rules that collect wallet information.

Only the initial page and changes between allowlisted hash sections generate pageviews. Query strings, unknown hashes and referrers are excluded; titles are fixed section labels. Wallet addresses, balances, account/network changes, approvals and transaction data are never passed by the tracker. Referrer omission deliberately limits referral attribution. Analytics remains third-party tracking: GA4 may use cookies and browser/device metadata. `anonymize_ip: true` is included, but GA4 already does not log/store IP addresses; this setting is not a consent or compliance guarantee. Arrange appropriate privacy disclosure and consent controls for your audience before enabling analytics.

Use GA4 Realtime/DebugView or Tag Assistant after deployment to verify receipt. No measurement ID is configured by default, and unit tests mock the tag queue without contacting Google. Ad blockers may prevent collection. All dashboard writes remain on HOLD.

## Google Search Console

Create a URL-prefix property for `https://thedman.github.io/AIDOGE.AI_web/` and select HTML tag verification. Set just the tag's `content` value as `VITE_GSC_VERIFICATION_TOKEN` in `.env.local` or the GitHub Actions repository variables. Vite inserts it into the static HTML head at build time, without requiring JavaScript execution. Empty tokens omit the tag. Rebuild and deploy, check View Source for `google-site-verification`, then click Verify in Search Console. Keep the token configured for future verification checks.

Submit `https://thedman.github.io/AIDOGE.AI_web/sitemap.xml` directly in Search Console. It lists the canonical homepage only: hash anchors such as `#vaults` do not represent separate pages. A sitemap helps discovery but does not guarantee indexing.

`public/robots.txt` permits crawling and references the sitemap. Important: this project deploys it at `/AIDOGE.AI_web/robots.txt`, whereas crawlers use `https://thedman.github.io/robots.txt`. The subpath file does NOT override domain-root crawl rules. If root rules block this project, update the root site's robots file separately; submitting the sitemap does not override a Disallow rule.

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
- Supplied AICODE, staking/vault, and Camelot LP candidates returned no bytecode on two Arbitrum RPC endpoints and remain on HOLD. NFT address is unconfirmed. See [candidate evidence](docs/secondary-forensics.md) for block numbers, limitations, and provenance requirements.
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
