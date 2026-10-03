import { parseAbi } from 'viem'

// Reconstructed from the reward-trace calls, not a verified-source ABI.
export const vaultAbi = parseAbi([
  'function locks(address) view returns (uint256 principal, uint256 end)',
])
export const vaults = [
  { name: 'AIDOGE', address: '0x14c228227b6ba5ca48b69b75e83950c4bb2be69e', decimals: 6 },
  { name: 'AICODE v2', address: '0x3a6d60bc404523f281da5b5d6fd9beb2b348cbd7', decimals: 18 },
] as const
export const vaultImplementation = '0x1a2d62379dc9c2aded1d1b35bda1c7c9b5b59644'
export const implementationSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
export const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
export const expectedAdmin = '0xc5723739dd99e85fa7795765b0738e569b7626fe'

export function matchesStorageAddress(raw: string | undefined, expected: string) {
  return !!raw && /^0x[0-9a-f]{64}$/i.test(raw)
    && raw.slice(2, 26) === '0'.repeat(24)
    && `0x${raw.slice(-40)}`.toLowerCase() === expected.toLowerCase()
}
