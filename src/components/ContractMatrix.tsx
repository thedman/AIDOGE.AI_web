import { AIDOGE_ADDRESS } from '../abi/aidogeAbi'

const rows = [
  ['Token info and burn', AIDOGE_ADDRESS, 'decimals, totalSupply, balanceOf, owner', 'GO read-only'],
  ['AICODE token', 'Not found in local archive', 'Pending verified contract address', 'HOLD'],
  ['Staking / vault', 'Not found in local archive', 'Pending ownership, pause, and proxy checks', 'HOLD'],
  ['NFT prologue', 'Not found in local archive', 'Pending mint-condition verification', 'HOLD'],
]

export function ContractMatrix() {
  return <div className="forensics-panel" aria-labelledby="matrix-title">
    <div className="section-heading compact"><p className="section-label">Contract matrix</p><h3 id="matrix-title">GO / HOLD feature map</h3></div>
    <div className="matrix-table" role="table" aria-label="Contract and feature mapping matrix">
      <div role="row" className="matrix-head">{['Feature', 'Contract', 'Read coverage', 'Verdict'].map(label => <span role="columnheader" key={label}>{label}</span>)}</div>
      {rows.map(([feature, address, coverage, verdict]) => <div role="row" key={feature}>
        <span role="cell">{feature}</span><span role="cell">{address.startsWith('0x') ? <code>{address}</code> : address}</span>
        <span role="cell">{coverage}</span><span role="cell"><mark className={`verdict ${verdict === 'HOLD' ? 'hold' : 'go'}`}>{verdict}</mark></span>
      </div>)}
    </div>
  </div>
}
