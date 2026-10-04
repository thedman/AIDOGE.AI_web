import { useEffect, useRef, useState } from 'react'
import { Calculator, X } from 'lucide-react'
import { formatUnits, parseUnits } from 'viem'
import { useVaultWriteProtection } from '../hooks/useVaultWriteProtection'
import { useVaultPositions } from '../hooks/useVaultPositions'
import { useConnection } from 'wagmi'

export function VaultWriteModal() {
  const dialog = useRef<HTMLDialogElement>(null)
  const protection = useVaultWriteProtection()
  const positions = useVaultPositions()
  const connection = useConnection()
  const position = positions.data?.positions.find(item => item.name === 'AIDOGE')
  const [amountChoice, setAmountChoice] = useState('custom')
  const [minimumChoice, setMinimumChoice] = useState('')
  const [amount, setAmount] = useState('')
  const [minimum, setMinimum] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [inputError, setInputError] = useState('')
  function reset() { protection.reset(); setAcknowledged(false); setInputError('') }
  useEffect(() => {
    setAmount(''); setMinimum(''); setAmountChoice('custom'); setMinimumChoice(''); setAcknowledged(false); setInputError('')
  }, [connection.address, connection.chainId, position?.principal, position?.end])
  const validAmount = /^\d+(\.\d{1,6})?$/.test(amount)
  const estimate = validAmount && protection.review?.math.grossPrincipal === parseUnits(amount, 6) ? protection.review.math : null
  function chooseAmount(choice: string) {
    reset(); setAmountChoice(choice); setMinimum(''); setMinimumChoice('')
    if (choice === 'custom' || !position || position.expired) { setAmount(''); return }
    const raw = position.principal * BigInt(choice) / 100n
    setAmount(formatUnits(raw, 6))
    if (raw > 0n) void protection.inspect(raw, 0n)
  }
  function chooseMinimum(choice: string) {
    setMinimumChoice(choice); setAcknowledged(false); setInputError('')
    setMinimum(choice && choice !== 'custom' && estimate ? formatUnits(estimate.netPayoutEstimate * BigInt(choice) / 100n, 6) : '')
  }
  function inspect() {
    reset()
    if (!/^\d+(\.\d{1,6})?$/.test(amount) || !/^\d+(\.\d{1,6})?$/.test(minimum)) { setInputError('Enter nonnegative AIDOGE amounts with at most six decimals.'); return }
    void protection.inspect(parseUnits(amount, 6), parseUnits(minimum, 6))
  }
  return <>
    <button className="manual-guide-trigger" onClick={() => { reset(); dialog.current?.showModal() }}><Calculator size={18} aria-hidden="true" />Early exit review (HOLD)</button>
    <dialog ref={dialog} className="wallet-dialog vault-review" aria-labelledby="vault-review-title" onClose={reset}>
      <button className="wallet-close" aria-label="Close early exit review" onClick={() => dialog.current?.close()}><X size={20} /></button>
      <h2 id="vault-review-title">AIDOGE early exit review</h2>
      <p>Read-only reconstruction. Nominal output is not a measured wallet payout or an executable quote. All writes remain on HOLD.</p>
      <p>Locked principal: {position ? `${formatUnits(position.principal, 6)} AIDOGE` : 'Unavailable'}</p>
      {position && <p>Lock expiry (UTC): {new Date(Number(position.end) * 1000).toISOString()}{position.expired ? ' - expired' : ''}</p>}
      <label>Withdrawal amount<select value={amountChoice} onChange={event => chooseAmount(event.target.value)} disabled={!position || position.expired || position.principal === 0n}>
        <option value="custom">Custom amount</option><option value="10">10% of locked principal</option><option value="25">25% of locked principal</option><option value="50">50% of locked principal</option><option value="100">Max locked principal</option>
      </select></label>
      <label>Gross principal (AIDOGE)<input inputMode="decimal" value={amount} onChange={event => { reset(); setAmountChoice('custom'); setMinimumChoice(''); setMinimum(''); setAmount(event.target.value) }} /></label>
      <button disabled={!protection.enabled || protection.pending || !validAmount} onClick={() => { reset(); setMinimum(''); setMinimumChoice(''); void protection.inspect(parseUnits(amount, 6), 0n) }}><Calculator size={18} aria-hidden="true" />{protection.pending ? 'Checking...' : 'Estimate selected amount'}</button>
      {estimate && <p>Nominal return: {formatUnits(estimate.netPayoutEstimate, 6)} AIDOGE. Nominal deduction: {formatUnits(estimate.totalPenalty, 6)} AIDOGE.</p>}
      <label>Minimum suggestion<select value={minimumChoice} onChange={event => chooseMinimum(event.target.value)}>
        <option value="">Choose an advisory minimum</option><option value="100" disabled={!estimate}>100% of nominal return</option><option value="99" disabled={!estimate}>99% of nominal return</option><option value="95" disabled={!estimate}>95% of nominal return</option><option value="custom">Custom minimum</option>
      </select></label>
      <label>Advisory minimum (AIDOGE)<input inputMode="decimal" value={minimum} onChange={event => { setAcknowledged(false); setMinimumChoice('custom'); setMinimum(event.target.value) }} /></label>
      <button disabled={!protection.enabled || protection.pending} onClick={inspect}><Calculator size={18} aria-hidden="true" />{protection.pending ? 'Checking...' : 'Run read-only review'}</button>
      {!protection.enabled && <p>Connect a wallet on Arbitrum One to review.</p>}
      {(inputError || protection.error) && <p role="alert">{inputError || protection.error}</p>}
      {protection.review && <dl className="account-balances">
        <div><dt>Snapshot block</dt><dd>{protection.review.blockNumber.toString()}</dd></div>
        <div><dt>Weeks remaining / nominal penalty BPS</dt><dd>{protection.review.math.weeksRemaining.toString()} / {protection.review.math.penaltyBps.toString()}</dd></div>
        {(['grossPrincipal', 'netPayoutEstimate', 'totalPenalty', 'burnShare', 'rewarderShare', 'residualRecipientShare'] as const).map(key => <div key={key}><dt>{({ grossPrincipal: 'Gross principal', netPayoutEstimate: 'Nominal token transfer', totalPenalty: 'Nominal deduction', burnShare: 'Burn allocation', rewarderShare: 'Rewarder allocation', residualRecipientShare: 'Residual recipient allocation' })[key]}</dt><dd>{formatUnits(protection.review!.math[key], 6)} AIDOGE</dd></div>)}
      </dl>}
      <p>The contract does not enforce this minimum. Simulation checks execution only; transfer logs, taxes and balance deltas are unavailable. State may change before mining. Review snapshots expire after 30 seconds.</p>
      <label><input type="checkbox" checked={acknowledged && !!protection.review} disabled={!protection.review} onChange={event => setAcknowledged(event.target.checked)} />I acknowledge these costs and limitations.</label>
      <button disabled title="Writes remain on HOLD; no contract-enforced minimum payout">Transaction unavailable - HOLD</button>
    </dialog>
  </>
}
