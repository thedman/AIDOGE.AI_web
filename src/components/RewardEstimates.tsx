import { formatUnits } from 'viem'
import { rewarders } from '../abi/rewarderAbi'
import { useRewardEstimates } from '../hooks/useRewardEstimates'

export function RewardEstimates() {
  const state = useRewardEstimates()
  return <div>
    <h3>Estimated / Unverified Payouts</h3>
    <dl className="account-balances">{rewarders.map(rewarder => {
      const result = state.data?.results.find(item => item.address === rewarder.address)
      return <div key={rewarder.address}><dt>{rewarder.name}</dt><dd>
        {result?.amount !== undefined ? `${formatUnits(result.amount, rewarder.decimals)} ${rewarder.name}` : state.enabled && state.isPending ? 'Loading' : 'Unavailable'}
        {result?.error && <span className="wallet-error"> - {result.error}</span>}
      </dd></div>
    })}</dl>
    <p>Completed-week estimates only. Not a verified claim quote; active-week rewards are excluded. Claims remain on HOLD.</p>
    {state.data && <p>Reward snapshot block {state.data.blockNumber.toString()}</p>}
  </div>
}
