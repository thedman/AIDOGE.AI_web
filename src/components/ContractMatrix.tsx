import { contractAudits } from '../config/forensics'

export function ContractMatrix() {
  return <div className="forensics-panel" aria-labelledby="matrix-title">
    <div className="section-heading compact"><p className="section-label">Contract matrix</p><h3 id="matrix-title">GO / HOLD feature map</h3></div>
    <div className="matrix-table" role="table" aria-label="Contract and feature mapping matrix">
      <div role="row" className="matrix-head">{['Feature', 'Contract', 'Read coverage', 'Verdict'].map(label => <span role="columnheader" key={label}>{label}</span>)}</div>
      {contractAudits.map(audit => <div role="row" key={audit.contractName}>
        <span role="cell">{audit.contractName}</span><span role="cell">{audit.address ? <code>{audit.address}</code> : 'Unconfirmed address'}</span>
        <span role="cell">{audit.readStatus === 'GO' ? audit.verifiedReadMethods.join(', ') : audit.rationale}</span>
        <span role="cell"><mark className={`verdict ${audit.readStatus === 'GO' ? 'go' : 'hold'}`}>{audit.readStatus} reads</mark><mark className="verdict hold">{audit.writeStatus} writes</mark></span>
      </div>)}
    </div>
  </div>
}
