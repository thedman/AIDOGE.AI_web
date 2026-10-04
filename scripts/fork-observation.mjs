import { createPublicClient, createTestClient, decodeEventLog, encodeFunctionData, http, parseAbi, publicActions, walletActions } from 'viem'
import { mkdir, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function requireLocalForkUrl(value) {
  const url = new URL(value)
  if (url.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(url.hostname)
    || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Only an explicit loopback HTTP Anvil endpoint is allowed')
  }
  return url.href
}
const targets = {
  aidoge: { vault: '0x14c228227b6ba5ca48b69b75e83950c4bb2be69e', token: '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b' },
  aicode: { vault: '0x3a6d60bc404523f281da5b5d6fd9beb2b348cbd7', token: '0x2823f231b8b7121c4ba6b6c0ceef37b6a5bda547' },
}
const slot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
const abi = parseAbi(['function locks(address) view returns (uint256,uint256)', 'function earlyWithdraw(uint256)'])
const tokenAbi = parseAbi(['function balanceOf(address) view returns (uint256)', 'event Transfer(address indexed from,address indexed to,uint256 value)'])
const json = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)

export async function observe() {
  const url = requireLocalForkUrl(process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545')
  const target = targets[process.env.FORK_TARGET]
  const holder = process.env.FORK_HOLDER
  const pin = process.env.FORK_BLOCK
  const rawAmount = process.env.FORK_AMOUNT_RAW
  if (!target || !/^0x[0-9a-f]{40}$/i.test(holder ?? '') || !/^\d+$/.test(pin ?? '') || !/^\d+$/.test(rawAmount ?? '') || BigInt(rawAmount) <= 0n) {
    throw new Error('Set FORK_TARGET=aidoge|aicode, FORK_HOLDER, FORK_BLOCK and positive FORK_AMOUNT_RAW')
  }
  const transport = http(url, { retryCount: 0 })
  const publicClient = createPublicClient({ transport })
  // Verify Anvil and its fork before any state-changing RPC.
  const version = await publicClient.request({ method: 'web3_clientVersion' })
  if (!version.toLowerCase().includes('anvil')) throw new Error('Endpoint is not Anvil')
  const info = await publicClient.request({ method: 'anvil_nodeInfo' })
  const reportedChainId = info.forkConfig?.forkChainId ?? info.environment?.chainId
  if (Number(info.forkConfig?.forkBlockNumber) !== Number(pin) || Number(reportedChainId) !== 42161
    || await publicClient.getChainId() !== 42161) throw new Error('Pinned Arbitrum fork metadata mismatch')
  const block = await publicClient.getBlock()
  if (block.number !== BigInt(pin)) throw new Error('Use a fresh fork at the requested block')
  const implementationRaw = await publicClient.getStorageAt({ address: target.vault, slot })
  const implementation = `0x${implementationRaw?.slice(-40)}`
  if (implementation !== '0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644') throw new Error('Unexpected vault implementation')
  const bytecode = await publicClient.getCode({ address: implementation })
  if (!bytecode || bytecode === '0x') throw new Error('Implementation bytecode unavailable')
  const client = createTestClient({ mode: 'anvil', transport }).extend(publicActions).extend(walletActions)
  const snapshot = await client.snapshot()
  let hash
  let report
  const balance = (address, blockNumber) => publicClient.readContract({ address: target.token, abi: tokenAbi, functionName: 'balanceOf', args: [address], blockNumber })
  const lock = () => publicClient.readContract({ address: target.vault, abi, functionName: 'locks', args: [holder] })
  try {
    const preLock = await lock()
    const pre = { holder: await balance(holder, block.number), vault: await balance(target.vault, block.number) }
    await client.impersonateAccount({ address: holder })
    await client.setBalance({ address: holder, value: 10n ** 19n })
    const calldata = encodeFunctionData({ abi, functionName: 'earlyWithdraw', args: [BigInt(rawAmount)] })
    hash = await client.sendTransaction({ account: holder, chain: null, to: target.vault, data: calldata, gas: 5000000n })
    const receipt = await client.waitForTransactionReceipt({ hash })
    const transfers = receipt.logs.filter(log => log.address.toLowerCase() === target.token).flatMap(log => {
      try { return [decodeEventLog({ abi: tokenAbi, data: log.data, topics: log.topics })] } catch { return [] }
    })
    const participants = new Set([holder.toLowerCase(), target.vault, ...transfers.flatMap(t => [t.args.from.toLowerCase(), t.args.to.toLowerCase()])])
    const deltas = []
    for (const address of participants) {
      const before = await balance(address, block.number)
      const after = await balance(address, receipt.blockNumber)
      deltas.push({ address, before, after, delta: after - before })
    }
    const tokenAccounting = []
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    const tokenParticipants = new Map()
    for (const log of receipt.logs.filter(log => log.topics[0] === transferTopic)) {
      try {
        const event = decodeEventLog({ abi: tokenAbi, data: log.data, topics: log.topics })
        const token = log.address.toLowerCase()
        const accounts = tokenParticipants.get(token) ?? new Set()
        accounts.add(event.args.from.toLowerCase()).add(event.args.to.toLowerCase())
        tokenParticipants.set(token, accounts)
      } catch { /* Non-ERC20 Transfer shapes remain preserved in the raw receipt. */ }
    }
    for (const [token, accounts] of tokenParticipants) {
      for (const address of accounts) {
        try {
          const read = blockNumber => publicClient.readContract({ address: token, abi: tokenAbi, functionName: 'balanceOf', args: [address], blockNumber })
          const before = await read(block.number)
          const after = await read(receipt.blockNumber)
          tokenAccounting.push({ token, address, before, after, delta: after - before })
        } catch { tokenAccounting.push({ token, address, unavailable: true }) }
      }
    }
    const traces = {}
    for (const [name, options] of Object.entries({ calls: { tracer: 'callTracer', tracerConfig: { withLog: true } }, stateDiff: { tracer: 'prestateTracer', tracerConfig: { diffMode: true } } })) {
      try { traces[name] = await publicClient.request({ method: 'debug_traceTransaction', params: [hash, options] }) }
      catch (error) { traces[name] = { unavailable: error.message } }
    }
    report = { target, holder, pin, blockHash: block.hash, timestamp: block.timestamp, implementation, bytecode, calldata, hash, receipt, pre, preLock, postLock: await lock(), transfers, deltas, tokenAccounting, traces, qualification: 'Observed local-fork behavior only; no penalty formula or safety assertions.' }
  } finally {
    try { await client.stopImpersonatingAccount({ address: holder }) }
    finally {
      await client.revert({ id: snapshot })
      if ((await publicClient.getBlock()).hash !== block.hash) throw new Error('Fork snapshot restoration failed')
    }
  }
  await mkdir('reports/fork', { recursive: true })
  const path = `reports/fork/${process.env.FORK_TARGET}-${pin}-${hash}.json`
  await writeFile(path, json(report) + '\n')
  console.log(path)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  observe().catch(error => { console.error(error.message); process.exitCode = 1 })
}
