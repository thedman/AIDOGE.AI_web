import { formatUnits } from 'viem'
import { useVaultPositions } from '../hooks/useVaultPositions'
import { RewardEstimates } from './RewardEstimates'

export function VaultDashboard() {
  const state = useVaultPositions()
  return <section className="stats-section" id="vaults" aria-labelledby="vault-title">
    <div className="section-heading compact"><p className="section-label">Arbitrum One</p><h2 id="vault-title">Vault positions</h2></div>
    {!state.enabled ? <p role="status">{state.isConnected ? 'Switch to Arbitrum One to view positions.' : 'Connect a wallet to view positions.'}</p>
      : state.isError ? <p className="wallet-error" role="alert">Vault reads unavailable. {state.error.message}</p>
      : !state.data ? <p role="status">Loading vault positions...</p>
      : <><div className="vault-positions">{state.data.positions.map(position => <article key={position.address}>
        <h3>{position.name}</h3>
        <dl className="account-balances">
          <div><dt>Locked principal</dt><dd>{formatUnits(position.principal, position.decimals)} {position.name}</dd></div>
          <div><dt>Lock expiration (UTC)</dt><dd>{position.principal === 0n ? 'No position' : new Date(Number(position.end) * 1000).toISOString()}</dd></div>
          <div><dt>Position state</dt><dd>{position.principal === 0n ? 'No position' : position.expired ? 'Lock expired' : 'Locked'}</dd></div>
          <div><dt>Claimable rewards</dt><dd>Unavailable</dd></div>
        </dl>
      </article>)}</div><p role="status">Block {state.data.blockNumber.toString()}{state.isFetching ? ' - refreshing' : ''}</p></>}
    <p>Claims, deposits and withdrawals remain on HOLD. Early withdrawal may substantially reduce the tokens returned. The penalty formula, maximum deduction and calldata parameter meaning remain unverified. Exact claimable payouts have not been verified.</p>
    <RewardEstimates />
  </section>
}
