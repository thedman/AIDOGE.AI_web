import { parseAbi } from 'viem'

// View signatures reconstructed in aidoge-reward-trace; not verified-source ABIs.
export const rewarderAbi = parseAbi([
  'function weekCursor() view returns (uint256)',
  'function weekCursorOf(address) view returns (uint256)',
  'function tokensPerWeek(uint256) view returns (uint256)',
  'function totalSupplyAt(uint256) view returns (uint256)',
  'function balanceOfAt(address,uint256) view returns (uint256)',
])
export const rewarders = [
  { name: 'AIDOGE', decimals: 6, address: '0x78a0baa38c1859133ea8bb979e7150bca8d0c410' },
  { name: 'AICODE v2', decimals: 18, address: '0x6365b66997502a49c89ced0e81d553dbc24101ec' },
  { name: 'ARB', decimals: 18, address: '0xd7c78a327513c1ae16ff991a624a4c2820762cb6' },
] as const
