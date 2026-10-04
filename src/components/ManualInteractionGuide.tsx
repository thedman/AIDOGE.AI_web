import { useRef } from 'react'
import { BookOpen, ExternalLink, X } from 'lucide-react'
import { vaults } from '../abi/vaultAbi'

const targets = [
  { name: 'AIDOGE Vault 1 (legacy reference)', address: '0x5845696f6031bfd57b32e6ce2ddea19a486fa5e5' },
  ...vaults.map(vault => ({ name: `${vault.name} Vault V2`, address: vault.address })),
  { name: 'Claim router', address: '0xb38f360234ec6e79676eea7a766100f82004b6a3' },
]

export function ManualInteractionGuide() {
  const dialog = useRef<HTMLDialogElement>(null)
  return <>
    <button className="manual-guide-trigger" type="button" onClick={() => dialog.current?.showModal()}><BookOpen size={18} aria-hidden="true" />Manual contract guide</button>
    <dialog ref={dialog} className="wallet-dialog manual-guide" aria-labelledby="manual-guide-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      <button className="wallet-close" type="button" title="Close manual guide" aria-label="Close manual guide" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button>
      <h2 id="manual-guide-title">Manual contract interaction reference</h2>
      <p>Adapted from the supplied document, <cite>Guide to interacting with a smart contract</cite>. Its authorship, currency and instructions are not independently verified. This is not an emergency recovery tool or a safety endorsement.</p>
      <section aria-labelledby="manual-safety-title">
        <h3 id="manual-safety-title">Safety boundary: HOLD</h3>
        <p className="vault-disclosure">External explorer writes bypass this dashboard's safeguards and can irreversibly move funds. Early withdrawal may substantially reduce the tokens returned. The penalty formula, maximum deduction and parameter meaning remain unverified. Simulation success does not guarantee a payout or future execution result.</p>
      </section>
      <section aria-labelledby="manual-targets-title">
        <h3 id="manual-targets-title">Explorer references</h3>
        <ul className="manual-targets">{targets.map(target => <li key={target.address}>
          <strong>{target.name}</strong><code>{target.address}</code>
          <div><a href={`https://arbiscan.io/address/${target.address}#readContract`} target="_blank" rel="noopener noreferrer">Read on Arbiscan <ExternalLink size={14} aria-hidden="true" /></a>
          <a href={`https://arbiscan.io/address/${target.address}#writeContract`} target="_blank" rel="noopener noreferrer">External write reference (HOLD) <ExternalLink size={14} aria-hidden="true" /></a></div>
        </li>)}</ul>
        <p>Proxy contracts may require the explorer's Read/Write as Proxy interface. Confirm the implementation and available interface; missing methods are not a reason to guess calldata. The legacy vault is a document reference, not covered by the active V2 position checks.</p>
      </section>
      <section aria-labelledby="manual-steps-title">
        <h3 id="manual-steps-title">Document methods and verification steps</h3>
        <ol>
          <li>Confirm Arbitrum One, the full target address, proxy implementation and your position using read methods before considering any external interaction.</li>
          <li>The document describes expired V2 withdrawals using <code>withdraw()</code>, selector <code>0x3ccfd60b</code>. Expiry alone does not prove current withdrawal safety.</li>
          <li>It describes <code>earlyWithdraw(uint256)</code>, selector <code>0x6b5b9696</code>, with six-decimal AIDOGE and eighteen-decimal AICODE v2 inputs. Dedaub labels the argument <code>_minAmount</code>; whether it represents principal or minimum payout remains unresolved. Do not construct a transaction from that label or blindly append zeros to decimal input.</li>
          <li>It lists router claim selector <code>0x64981ffb</code> with a vault address and <code>claimAll()</code>, selector <code>0xd1058e59</code>. Historical routing is observed; current claimable payouts are not verified. Successful claims may yield no payout while consuming gas.</li>
          <li>Use Dedaub's Simulate mode, not Write, for investigation. Record the sender, pinned block, overrides, terminal result, token balance changes and principal state changes. Review complete evidence before independently deciding whether to use an external wallet write interface.</li>
        </ol>
        <a href={`https://app.dedaub.com/arbitrum/address/${vaults[0].address}/write`} target="_blank" rel="noopener noreferrer">Open AIDOGE simulation reference <ExternalLink size={14} aria-hidden="true" /></a>
      </section>
    </dialog>
  </>
}
