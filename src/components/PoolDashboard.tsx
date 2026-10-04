import { formatUnits } from 'viem'
import { ExternalLink } from 'lucide-react'
import { poolAddress, usePoolStats } from '../hooks/usePoolStats'
import { MetricCard, formatTokenAmount } from './MetricCard'
import { useUsdSpot } from '../hooks/useUsdSpot'

export function PoolDashboard() {
  const stats = usePoolStats()
  const oracle = useUsdSpot(stats.reserves)
  const unavailable = stats.isPending ? 'Loading' : 'Unavailable'
  return <div className="pool-metrics">
    <div className="pool-heading">
      <div><p className="section-label">Camelot V2 pool</p><h2>AIDOGE / WETH</h2></div>
      <span className="pool-read-status" data-state={stats.price ? 'ok' : 'neutral'}>{stats.price ? 'RPC reserve spot' : stats.isPending ? 'Loading RPC' : 'Unavailable'}</span>
    </div>
    <div className="stats-grid" aria-busy={stats.isFetching}>
      <MetricCard label="AIDOGE pool reserve" value={stats.reserves ? formatTokenAmount(stats.reserves[0], 6) : unavailable} detail={stats.reserves ? formatUnits(stats.reserves[0], 6) : undefined} />
      <MetricCard label="WETH pool reserve" value={stats.reserves ? formatTokenAmount(stats.reserves[1], 18) : unavailable} detail={stats.reserves ? formatUnits(stats.reserves[1], 18) : undefined} />
      <MetricCard label="Indicative USD spot per AIDOGE" value={oracle.usd ?? (oracle.isPending ? 'Loading' : 'Unavailable')} />
    </div>
    <p className="pool-disclosure">Indicative WETH per AIDOGE: <span className="pool-raw-ratio">{stats.price ?? unavailable}</span></p>
    <p className="pool-disclosure">Indicative USD spot derived from <a href={`https://arbiscan.io/address/${poolAddress}`} target="_blank" rel="noopener noreferrer">Camelot V2 AIDOGE/WETH reserves</a> and <a href="https://data.chain.link/feeds/arbitrum/mainnet/eth-usd" target="_blank" rel="noopener noreferrer">Chainlink ETH/USD</a>. Excludes transfer taxes, swap fees, slippage, price impact and vault deductions. Not an executable quote or USDT market price.</p>
    <p className="chain-status" role="status">{oracle.usd ? `ETH/USD oracle updated ${new Date(Number(oracle.data!.updatedAt) * 1000).toISOString()}.` : oracle.isPending ? 'Loading ETH/USD oracle...' : 'USD spot unavailable: oracle or sequencer checks failed.'}</p>
    <p className="chain-status" role="status">{stats.price ? `Reserve snapshot updated ${new Date(stats.dataUpdatedAt).toLocaleTimeString()}.` : stats.isPending ? 'Loading pool reads...' : 'Pool reads unavailable or identity checks failed. Retrying automatically.'}</p>
    <div className="reported-markets">
      <p><strong>Reported Markets</strong><span>Aggregated third-party exchange listings</span></p>
      <a href="https://coinmarketcap.com/currencies/arbdoge-ai/#Markets" target="_blank" rel="noopener noreferrer" aria-label="View reported AIDOGE markets on CoinMarketCap (opens in new tab)">View on CoinMarketCap <ExternalLink size={16} aria-hidden="true" /></a>
    </div>
    <p className="markets-disclosure">Third-party listings are informational, not an endorsement or liquidity recommendation. All dashboard write actions remain on HOLD.</p>
  </div>
}
