import { RefreshCw } from 'lucide-react'
import { formatUnits, zeroAddress } from 'viem'
import { useAidogeStats } from '../hooks/useAidogeStats'
import { MetricCard, formatTokenAmount } from './MetricCard'
import { ContractMatrix } from './ContractMatrix'

export function TokenDashboard() {
  const stats = useAidogeStats()
  const amount = (value: bigint | undefined) => value !== undefined && stats.decimals !== undefined
    ? formatTokenAmount(value, stats.decimals) : stats.isPending ? 'Loading' : 'Unavailable'
  const exact = (value: bigint | undefined) => value !== undefined && stats.decimals !== undefined
    ? formatUnits(value, stats.decimals) : undefined
  const owner = stats.owner === undefined ? stats.isPending ? 'Loading' : 'Unavailable'
    : stats.owner.toLowerCase() === zeroAddress ? 'Renounced' : 'Owner set'
  const failed = stats.isError || stats.incomplete
  return <section className="stats-section" id="forensics" aria-labelledby="stats-title">
    <div className="section-heading compact"><p className="section-label">Arbitrum One</p><h2 id="stats-title">Read-only Arbitrum dashboard</h2><p>Public token supply and ownership data. Circulating supply is total supply minus the dead-wallet balance.</p></div>
    <div className="stats-grid" aria-busy={stats.isFetching}>
      <MetricCard label="Total supply" value={amount(stats.totalSupply)} detail={exact(stats.totalSupply)} />
      <MetricCard label="Dead-wallet balance" value={amount(stats.burnBalance)} detail={exact(stats.burnBalance)} />
      <MetricCard label="Derived circulating supply" value={amount(stats.circulatingSupply)} detail={exact(stats.circulatingSupply)} />
      <MetricCard label="Owner status" value={owner} detail={stats.owner} />
    </div>
    <div className="dashboard-status">
      <p className="chain-status" data-state={failed ? 'error' : stats.isPending ? 'neutral' : 'ok'} role="status">
        {failed ? stats.data ? 'Some reads unavailable or stale. Retrying automatically.' : 'Arbitrum RPC unavailable. Retrying automatically.' : stats.isPending ? 'Connecting to Arbitrum One...' : `Live on Arbitrum One. Updated ${new Date(stats.dataUpdatedAt).toLocaleTimeString()}.`}
      </p>
      <button className="refresh-button" type="button" title="Refresh token data" aria-label="Refresh token data" disabled={stats.isFetching} onClick={() => void stats.refetch()}><RefreshCw size={18} className={stats.isFetching ? 'refreshing' : ''} /></button>
    </div>
    <ContractMatrix />
  </section>
}
