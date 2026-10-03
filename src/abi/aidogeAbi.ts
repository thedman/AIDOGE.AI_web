import { parseAbi } from 'viem'

export const AIDOGE_ADDRESS = '0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b' as const
export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const
export const aidogeAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function owner() view returns (address)',
])
