import { readFile, writeFile } from 'node:fs/promises'
import { createPublicClient, http, parseAbi, keccak256, toHex } from 'viem'

const vault = '0x14c228227b6ba5ca48b69b75e83950c4bb2be69e'
const implementation = '0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644'
const evidence = JSON.parse(await readFile('docs/evidence-bundles/aidoge_earlyWithdraw.json', 'utf8'))
const client = createPublicClient({ transport: http('https://arb1.arbitrum.io/rpc', { retryCount: 0, timeout: 15000 }) })
if (await client.getChainId() !== 42161) throw Error('Wrong chain')
const block = await client.getBlock()
const implSlot = await client.getStorageAt({ address: vault, slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', blockNumber: block.number })
if (implSlot?.slice(-40) !== implementation.slice(2)) throw Error('Implementation changed')
const code = await client.getCode({ address: implementation, blockNumber: block.number })
if (code !== evidence.bytecode) throw Error('Runtime changed from observed evidence')
const report = { blockNumber: block.number, blockHash: block.hash, timestamp: block.timestamp, vault, implementation, runtimeHash: keccak256(code), getters: {}, storage: {}, qualification: 'Runtime reconstruction; no verified Solidity source retrieved. Current proxy-state snapshot is distinct from historical sweep block.' }
for (const name of ['earlyWithdrawBpsPerWeek', 'redistributeBps', 'burnBps', 'MAX_LOCK', 'WEEK', 'breaker', 'treasuryAddr', 'redistributeAddr', 'token', 'owner', 'supply', 'accumRedistribute']) {
  const type = ['treasuryAddr', 'redistributeAddr', 'token', 'owner'].includes(name) ? 'address' : name === 'breaker' ? 'bool' : 'uint256'
  report.getters[name] = await client.readContract({ address: vault, abi: parseAbi([`function ${name}() view returns(${type})`]), functionName: name, blockNumber: block.number })
}
for (const slot of [0x33, 0x65, 0x97, 0x98, 0x9f, 0xa2, 0xa3, 0xa4, 0xa5]) report.storage[toHex(slot)] = await client.getStorageAt({ address: vault, slot: toHex(slot, { size: 32 }), blockNumber: block.number })
const names = { 0x00: 'STOP', 0x01: 'ADD', 0x02: 'MUL', 0x03: 'SUB', 0x04: 'DIV', 0x05: 'SDIV', 0x10: 'LT', 0x11: 'GT', 0x12: 'SLT', 0x13: 'SGT', 0x14: 'EQ', 0x15: 'ISZERO', 0x16: 'AND', 0x17: 'OR', 0x18: 'XOR', 0x19: 'NOT', 0x1b: 'SHL', 0x1c: 'SHR', 0x20: 'KECCAK256', 0x30: 'ADDRESS', 0x33: 'CALLER', 0x34: 'CALLVALUE', 0x35: 'CALLDATALOAD', 0x36: 'CALLDATASIZE', 0x37: 'CALLDATACOPY', 0x39: 'CODECOPY', 0x3b: 'EXTCODESIZE', 0x3d: 'RETURNDATASIZE', 0x3e: 'RETURNDATACOPY', 0x42: 'TIMESTAMP', 0x43: 'NUMBER', 0x50: 'POP', 0x51: 'MLOAD', 0x52: 'MSTORE', 0x54: 'SLOAD', 0x55: 'SSTORE', 0x56: 'JUMP', 0x57: 'JUMPI', 0x5a: 'GAS', 0x5b: 'JUMPDEST', 0xf1: 'CALL', 0xf3: 'RETURN', 0xf4: 'DELEGATECALL', 0xfa: 'STATICCALL', 0xfd: 'REVERT', 0xfe: 'INVALID', 0x0b: 'SIGNEXTEND' }
const bytes = Buffer.from(code.slice(2), 'hex')
const instructions = []
for (let pc = 0; pc < bytes.length; pc++) {
  const op = bytes[pc]
  const instruction = { pc, hexPc: `0x${pc.toString(16).padStart(4, '0')}` }
  if (op >= 0x60 && op <= 0x7f) {
    const size = op - 0x5f
    instruction.op = `PUSH${size}`
    instruction.value = `0x${bytes.subarray(pc + 1, pc + 1 + size).toString('hex')}`
    pc += size
  } else instruction.op = names[op] ?? (op >= 0x80 && op <= 0x8f ? `DUP${op - 0x7f}` : op >= 0x90 && op <= 0x9f ? `SWAP${op - 0x8f}` : op >= 0xa0 && op <= 0xa4 ? `LOG${op - 0xa0}` : `OP_${op.toString(16)}`)
  instructions.push(instruction)
}
report.ranges = Object.fromEntries(Object.entries({ earlyWithdraw: [0x12c6, 0x153d], withdraw: [0xc47, 0xd46], createLock: [0x1c92, 0x1e51], roundWeek: [0x2abc, 0x2ad6], reducePrincipal: [0x26a3, 0x27ce], redistribute: [0x29f9, 0x2a6a], configure: [0x7bf, 0x9ae], arithmetic: [0x3acf, 0x3b36], maxLock: [0x12a9, 0x12c6] }).map(([name, [start, end]]) => [name, instructions.filter(i => i.pc >= start && i.pc < end)]))
await writeFile('docs/evidence-bundles/aidoge_vault_math_bytecode.json', JSON.stringify(report, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2) + '\n')
console.log(JSON.stringify({ blockNumber: String(block.number), blockHash: block.hash, getters: report.getters, storage: report.storage }, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2))
