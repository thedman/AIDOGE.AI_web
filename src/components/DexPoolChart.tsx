import { ExternalLink } from 'lucide-react'
import { poolAddress } from '../hooks/usePoolStats'

export const poolChartUrl = `https://www.geckoterminal.com/arbitrum/pools/${poolAddress}`

export function DexPoolChart() {
  return <section className="dex-chart" aria-labelledby="dex-chart-title">
    <div className="pool-heading">
      <div><p className="section-label">DEX chart</p><h3 id="dex-chart-title">AIDOGE / WETH · Camelot V2</h3></div>
      <a href={poolChartUrl} target="_blank" rel="noopener noreferrer">GeckoTerminal <ExternalLink size={16} aria-hidden="true" /></a>
    </div>
    <iframe src={`${poolChartUrl}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`} title="AIDOGE/WETH Camelot V2 GeckoTerminal chart" loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin" />
    <p className="markets-disclosure">Third-party pool chart; data may be delayed or unavailable. Not an execution quote. Transfer taxes, vault deductions and slippage are not included. If the embed is blocked, open GeckoTerminal using the link above. Dashboard writes remain on HOLD.</p>
  </section>
}
