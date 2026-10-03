import { useState } from "react"
import { TokenDashboard } from "./components/TokenDashboard"
import { WalletConnect } from "./components/WalletConnect"

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
  <a className="skip-link" href="#main">Skip to content</a>

  <header className="site-header" id="home">
    <a className="brand" href="#home" aria-label="ArbDoge home">
      <img src="assets/logo.svg" alt="" width="52" height="52" />
      <span>ARBDOGE</span>
    </a>

    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} type="button" aria-expanded={menuOpen} aria-controls="primary-nav">
      <span className="sr-only">Toggle navigation</span>
      <span></span><span></span><span></span>
    </button>

    <nav className={menuOpen ? "primary-nav open" : "primary-nav"} onClick={() => setMenuOpen(false)} id="primary-nav" aria-label="Primary navigation">
      <a className="active" href="#home">Home</a>
      <a href="#token">AIDOGE</a>
      <a href="#forensics">Forensics</a>
      <a href="#tokenomics">Tokenomics</a>
      <a href="#ecosystem">Ecosystem</a>
      <a href="#resources">Resources</a>
    </nav>

    <WalletConnect />
  </header>

  <main id="main">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-background" aria-hidden="true"></div>
      <div className="hero-content">
        <p className="eyebrow">Proudly launched on Arbitrum</p>
        <h1 id="hero-title">Co-built by AI creatures and our community</h1>
        <p className="hero-copy">ArbDoge.AI was an experimental community ecosystem built around AIDOGE, AICODE, NFTs, staking and on-chain applications.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#token">Explore AIDOGE</a>
          <a className="button button-secondary" href="https://web.archive.org/web/20241114003227/https://arbdoge.ai/" target="_blank" rel="noopener noreferrer">View archived site</a>
        </div>
        <p className="archive-note"><span aria-hidden="true">●</span> Local archival reconstruction — read-only wallet balances</p>
      </div>
    </section>

    <section className="status-band" aria-labelledby="airdrop-title">
      <div>
        <p className="section-label">Airdrop status</p>
        <h2 id="airdrop-title">The original AIDOGE airdrop has ended</h2>
      </div>
      <p>The archived experience described 210,000,000,000,000,000 AIDOGE tokens for eligible Arbitrum community members. This reconstruction now performs read-only Arbitrum checks, but does not check eligibility or submit transactions.</p>
      <span className="status-pill">Ended</span>
    </section>

    <section className="content-section token-section" id="token" aria-labelledby="token-title">
      <div className="section-heading">
        <p className="section-label">The ecosystem token</p>
        <h2 id="token-title">What is AIDOGE?</h2>
        <p>AIDOGE is a deflationary token created for applications in the ArbDoge.AI ecosystem. Its original supply was 210 quadrillion tokens, distributed around a community-first experiment on Arbitrum.</p>
      </div>

      <div className="token-layout">
        <figure className="token-art">
          <img src="assets/img_2@2x.png" alt="Archived AIDOGE token artwork" loading="lazy" />
        </figure>
        <div className="token-copy">
          <p>The original site positioned AIDOGE as the key to future ecosystem chapters. Buying AIDOGE generated Lucky Drop entries, while staking connected holders to community rewards.</p>
          <p>The archived implementation also described an 8% transaction tax distributed across development, liquidity, rewards, staking dividends and token burning.</p>
          <div className="contract-block" aria-label="AIDOGE contract address">
            <span>Arbitrum contract</span>
            <code>0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b</code>
          </div>
          <div className="button-row">
            <a className="button button-primary" href="https://arbiscan.io/token/0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b" target="_blank" rel="noopener noreferrer">View on Arbiscan</a>
            <a className="button button-secondary" href="https://web.archive.org/web/20241114003228/https://docs.arbdoge.ai/tokenomics/aidoge" target="_blank" rel="noopener noreferrer">Archived docs</a>
          </div>
        </div>
      </div>
    </section>

    <section className="content-section tokenomics-section" id="tokenomics" aria-labelledby="tokenomics-title">
      <div className="section-heading compact">
        <p className="section-label">Original transaction model</p>
        <h2 id="tokenomics-title">8% allocated across the ecosystem</h2>
        <p>The archived homepage presented the following transaction-tax allocation.</p>
      </div>

      <div className="tokenomics-layout">
        <div className="donut" role="img" aria-label="Token tax allocation chart: development 1.5%, flexible funds 0.8%, liquidity 1%, Lucky Drop rewards 3%, staking dividends 0.7%, burn 1%">
          <div className="donut-center"><strong>8%</strong><span>transaction tax</span></div>
        </div>
        <dl className="allocation-list">
          <div><dt><span className="swatch cyan"></span>Development</dt><dd>1.5%</dd></div>
          <div><dt><span className="swatch green"></span>Flexible funds</dt><dd>0.8%</dd></div>
          <div><dt><span className="swatch mint"></span>Liquidity pool</dt><dd>1.0%</dd></div>
          <div><dt><span className="swatch orange"></span>Lucky Drop rewards</dt><dd>3.0%</dd></div>
          <div><dt><span className="swatch violet"></span>Staker dividends</dt><dd>0.7%</dd></div>
          <div><dt><span className="swatch gold"></span>Burn</dt><dd>1.0%</dd></div>
        </dl>
      </div>
    </section>

    <TokenDashboard />

    <section className="content-section ecosystem-section" id="ecosystem" aria-labelledby="ecosystem-title">
      <div className="section-heading">
        <p className="section-label">Products and experiments</p>
        <h2 id="ecosystem-title">The ArbDoge.AI ecosystem</h2>
        <p>The original experience connected token holders to staking, governance, NFTs and planned AI-native products.</p>
      </div>

      <div className="product-grid">
        <article className="product-card">
          <img src="assets/card_1.png" alt="AIDOGE product artwork" loading="lazy" />
          <div><span className="card-index">01</span><h3>AIDOGE</h3><p>The ecosystem’s community token and original entry point.</p><a href="#token">Explore token</a></div>
        </article>
        <article className="product-card">
          <img src="assets/card_2.png" alt="AICODE product artwork" loading="lazy" />
          <div><span className="card-index">02</span><h3>AICODE</h3><p>A governance-oriented token with a Bitcoin-style halving mechanism.</p><a href="https://web.archive.org/web/20241114003227/https://arbdoge.ai/aicode" target="_blank" rel="noopener noreferrer">Open archive</a></div>
        </article>
        <article className="product-card">
          <img src="assets/card_3.png" alt="NFT Prologue artwork" loading="lazy" />
          <div><span className="card-index">03</span><h3>NFT Prologue</h3><p>AI-themed collectibles and rewards for early ecosystem participants.</p><a href="https://web.archive.org/web/20241114003227/https://arbdoge.ai/nft" target="_blank" rel="noopener noreferrer">Open archive</a></div>
        </article>
        <article className="product-card">
          <img src="assets/card_4.png" alt="AIDOGE Vault artwork" loading="lazy" />
          <div><span className="card-index">04</span><h3>AIDOGE Vault</h3><p>Token locking, veToken weight and community reward distribution.</p><a href="https://web.archive.org/web/20241114003227/https://arbdoge.ai/vault/aidoge" target="_blank" rel="noopener noreferrer">Open archive</a></div>
        </article>
        <article className="product-card muted-card">
          <img src="assets/card_5.png" alt="AI Lab concept artwork" loading="lazy" />
          <div><span className="card-index">05</span><h3>AI Lab</h3><p>A planned experimental surface for AI and Web3 concepts.</p><span className="coming-soon">Archived as coming soon</span></div>
        </article>
        <article className="product-card muted-card">
          <img src="assets/card_6.png" alt="Build concept artwork" loading="lazy" />
          <div><span className="card-index">06</span><h3>Build</h3><p>A planned home for community-built ecosystem applications.</p><span className="coming-soon">Archived as coming soon</span></div>
        </article>
      </div>
    </section>

    <section className="community-section" id="resources" aria-labelledby="community-title">
      <div className="community-image" aria-hidden="true"></div>
      <div className="community-content">
        <p className="section-label">Community first</p>
        <h2 id="community-title">“The secret weapon that humans have over AI is intuition.”</h2>
        <p>The original homepage closed with an invitation to join its community. These links point to the project’s historical public channels and archives.</p>
        <div className="resource-links">
          <a href="https://x.com/ArbDoge_AI" target="_blank" rel="noopener noreferrer">X / Twitter</a>
          <a href="https://medium.com/@ArbDogeAI" target="_blank" rel="noopener noreferrer">Medium</a>
          <a href="https://web.archive.org/web/20241114003228/https://docs.arbdoge.ai/" target="_blank" rel="noopener noreferrer">Whitepaper archive</a>
        </div>
      </div>
    </section>
  </main>

  <footer className="site-footer">
    <div className="footer-brand">
      <a className="brand" href="#home"><img src="assets/logo.svg" alt="" width="44" height="44" /><span>ARBDOGE</span></a>
      <p>ArbDogeAI, an experiment in the Arbitrum ecosystem.</p>
    </div>
    <div>
      <h2>Resources</h2>
      <a href="https://web.archive.org/web/20241114003228/https://docs.arbdoge.ai/" target="_blank" rel="noopener noreferrer">Whitepaper</a>
      <a href="https://web.archive.org/web/20241114003228/https://docs.arbdoge.ai/others/faq" target="_blank" rel="noopener noreferrer">FAQs</a>
    </div>
    <div>
      <h2>Products</h2>
      <a href="#ecosystem">Ecosystem</a>
      <a href="#token">AIDOGE</a>
    </div>
    <div>
      <h2>Archive</h2>
      <a href="https://web.archive.org/web/20241114003227/https://arbdoge.ai/" target="_blank" rel="noopener noreferrer">Original capture</a>
      <a href="https://arbiscan.io/token/0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b" target="_blank" rel="noopener noreferrer">Contract</a>
    </div>
    <p className="copyright">© 2023 Arbitrum Doge Paradise. Archival reconstruction for local reference.</p>
  </footer>


  
</>
}
