import { createTestClient, http, publicActions, walletActions, parseAbi, encodeFunctionData, decodeEventLog, formatUnits, keccak256 } from 'viem'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { requireLocalForkUrl } from './fork-observation.mjs'

const vault = '0x14c228227b6ba5ca48b69b75e83950c4bb2be69e'
const token = '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b'
const holder = '0x125d9b63de41f6dbbc138522b87f23ca190722fe'
const account = '0x000000000000000000000000000000000000beef'
const abi = parseAbi(['function createLock(uint256,uint256)', 'function earlyWithdraw(uint256)', 'function locks(address) view returns(uint256,uint256)', 'function earlyWithdrawBpsPerWeek() view returns(uint256)'])
const erc20 = parseAbi(['function transfer(address,uint256) returns(bool)', 'function approve(address,uint256) returns(bool)', 'function balanceOf(address) view returns(uint256)', 'event Transfer(address indexed from,address indexed to,uint256 value)'])
const client = createTestClient({ mode: 'anvil', pollingInterval: 100, transport: http(requireLocalForkUrl(process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545'), { retryCount: 0, timeout: 120000 }) }).extend(publicActions).extend(walletActions)
const stringify = x => JSON.stringify(x, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)
const block = await client.getBlock()
const info = await client.request({ method: 'anvil_nodeInfo' })
if (!(await client.request({ method: 'web3_clientVersion' })).toLowerCase().includes('anvil') || await client.getChainId() !== 42161 || block.number !== 511692613n || Number(info.forkConfig?.forkBlockNumber) !== 511692613 || block.hash !== '0x774dfc058258281738e1c32a93372c7b58e57f4123c7623ca1e1eaaafbc822e0') throw Error('Fresh pinned Arbitrum Anvil fork required')
const implementation = await client.getStorageAt({ address: vault, slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc' })
if (implementation?.slice(-40) !== '1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644') throw Error('Implementation mismatch')
const balance = (address, blockNumber) => client.readContract({ address: token, abi: erc20, functionName: 'balanceOf', args: [address], blockNumber })
const lock = () => client.readContract({ address: vault, abi, functionName: 'locks', args: [account] })
const send = async (from, to, callAbi, functionName, args) => {
  const calldata = encodeFunctionData({ abi: callAbi, functionName, args })
  const gas = 30000000n
  const hash = await client.sendTransaction({ account: from, chain: null, to, data: calldata, gas })
  const receipt = await client.waitForTransactionReceipt({ hash })
  return { calldata, hash, gasLimit: gas, receipt }
}
const bytecode = await client.getCode({ address: '0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644' })
if (!bytecode || bytecode === '0x') throw Error('Implementation code missing')
const report = { pinnedBlock: block, vault, token, holder, syntheticAccount: account, implementation, bytecodeHash: keccak256(bytecode), bpsPerWeek: await client.readContract({ address: vault, abi, functionName: 'earlyWithdrawBpsPerWeek' }), qualification: 'Local fork samples, not a definitive formula or verified production write interface. Candidate createLock arguments tested experimentally.', rows: [] }
const retryRow = process.env.SWEEP_RETRY_ROW
let previousAttempt
if (retryRow) {
  if (!/^(90|180|365|730):(0|25|50|75)$/.test(retryRow)) throw Error('Invalid SWEEP_RETRY_ROW')
  const previous = JSON.parse(await readFile('docs/evidence-bundles/aidoge_penalty_curve_matrix.json', 'utf8'))
  if (previous.pinnedBlock.hash !== block.hash || previous.vault !== vault) throw Error('Retry evidence mismatch')
  report.rows = previous.rows.filter(row => `${row.days}:${row.elapsedPercent}` !== retryRow)
  previousAttempt = previous.rows.find(row => `${row.days}:${row.elapsedPercent}` === retryRow)
}
await mkdir('docs/evidence-bundles', { recursive: true })
const save = async () => {
  await writeFile('docs/evidence-bundles/aidoge_penalty_curve_matrix.json', stringify(report) + '\n')
  const lines = report.rows.map(r => `| ${r.days} days | ${r.elapsedPercent}% | ${r.status} | ${r.actualDurationSeconds ?? '-'} | ${r.principalDebit === undefined ? '-' : formatUnits(BigInt(r.principalDebit), 6)} | ${r.net === undefined ? '-' : formatUnits(BigInt(r.net), 6)} | ${r.deductionBps === undefined ? '-' : formatUnits(BigInt(r.deductionBps), 2) + '%'} |`)
  await writeFile('docs/evidence-bundles/aidoge_penalty_curve_matrix.md', '# AIDOGE local-fork penalty sweep\n\nPinned block 511692613, hash ' + block.hash + '. No live writes. All dashboard writes remain HOLD. Raw setup receipts, calldata, exit receipts, available traces and deltas are in the adjacent JSON.\n\nDurations are experimental 90/180/365/730-day inputs, not assumed verified product tiers. Elapsed percentage uses the actual resulting lock expiration measured from the creation block. Each row starts from an independent restored snapshot. The previous 94.08% result was an existing position, NOT a Day-0 two-year lock.\n\n| Requested duration | Actual elapsed fraction | Status | Actual duration (seconds) | Principal debit (AIDOGE) | Net received (AIDOGE) | Observed deduction |\n| --- | --- | --- | --- | --- | --- | --- |\n' + lines.join('\n') + '\n\nThese finite samples do not establish an exact curve, global bounds, supported tier list, rounding, or production payout protection. Failed setup rows are not penalty observations. Review raw direct vault Transfer recipients separately from token-internal swap distributions. Time warps keep upstream fork state fixed and are counterfactual, not future market predictions.\n')
}
for (const days of [90, 180, 365, 730]) {
  for (const elapsedPercent of [0, 25, 50, 75]) {
    if (retryRow && retryRow !== `${days}:${elapsedPercent}`) continue
    const snapshot = await client.snapshot()
    const row = { days, elapsedPercent, status: 'pending', setup: [], ...(previousAttempt ? { previousAttempt } : {}) }
    report.rows.push(row)
    try {
      for (const address of [holder, account]) {
        await client.impersonateAccount({ address })
        await client.setBalance({ address, value: 10n ** 19n })
      }
      if ((await lock())[0] !== 0n) throw Error('Synthetic account already locked')
      row.setup.push(await send(holder, token, erc20, 'transfer', [account, 2000000000n]))
      row.setup.push(await send(account, token, erc20, 'approve', [vault, 1000000000n]))
      row.requestedUnlockTimestamp = (await client.getBlock()).timestamp + BigInt(days * 86400)
      const creation = await send(account, vault, abi, 'createLock', [1000000000n, row.requestedUnlockTimestamp])
      row.setup.push(creation)
      if (row.setup.some(s => s.receipt.status !== 'success')) {
        try { row.setupFailureTrace = await client.request({ method: 'debug_traceTransaction', params: [creation.hash, { tracer: 'callTracer' }] }) }
        catch { row.setupFailureTrace = { unavailable: true } }
        throw Error('Setup transaction reverted')
      }
      row.createdLock = await lock()
      const creationBlock = await client.getBlock({ blockNumber: creation.receipt.blockNumber })
      row.actualDurationSeconds = row.createdLock[1] - creationBlock.timestamp
      if (row.createdLock[0] <= 0n || row.actualDurationSeconds <= 0n) throw Error('No positive future lock created')
      const exitTime = creationBlock.timestamp + row.actualDurationSeconds * BigInt(elapsedPercent) / 100n + (elapsedPercent === 0 ? 1n : 0n)
      await client.setNextBlockTimestamp({ timestamp: exitTime })
      const preBlock = await client.getBlock()
      row.preLock = await lock()
      row.preUser = await balance(account)
      row.preVault = await balance(vault)
      row.exit = await send(account, vault, abi, 'earlyWithdraw', [row.preLock[0]])
      row.exitBlock = await client.getBlock({ blockNumber: row.exit.receipt.blockNumber })
      row.postLock = await lock()
      row.principalDebit = row.preLock[0] - row.postLock[0]
      row.net = await balance(account) - row.preUser
      row.vaultDebit = row.preVault - await balance(vault)
      row.status = row.exit.receipt.status
      if (row.principalDebit > 0n) row.deductionBps = (row.principalDebit - row.net) * 10000n / row.principalDebit
      row.transfers = row.exit.receipt.logs.filter(l => l.address.toLowerCase() === token).flatMap(l => { try { return [decodeEventLog({ abi: erc20, topics: l.topics, data: l.data })] } catch { return [] } })
      const accounts = new Set([account, vault, ...row.transfers.flatMap(t => [t.args.from.toLowerCase(), t.args.to.toLowerCase()])])
      row.deltas = []
      for (const address of accounts) {
        const before = await balance(address, preBlock.number)
        const after = await balance(address, row.exit.receipt.blockNumber)
        row.deltas.push({ address, before, after, delta: after - before })
      }
      row.traces = {}
      for (const [name, options] of Object.entries({ calls: { tracer: 'callTracer', tracerConfig: { withLog: true } }, stateDiff: { tracer: 'prestateTracer', tracerConfig: { diffMode: true } } })) {
        try { row.traces[name] = await client.request({ method: 'debug_traceTransaction', params: [row.exit.hash, options] }) }
        catch { row.traces[name] = { unavailable: true } }
      }
    } catch (error) { row.status = 'unavailable'; row.error = error.shortMessage ?? error.message }
    finally {
      for (const address of [holder, account]) await client.stopImpersonatingAccount({ address })
      await client.revert({ id: snapshot })
      if ((await client.getBlock()).hash !== block.hash) throw Error('Snapshot restoration failed')
      row.snapshotRestored = true
      await save()
    }
    console.log(stringify({ days, elapsedPercent, status: row.status, net: row.net, deductionBps: row.deductionBps, error: row.error }))
  }
}
