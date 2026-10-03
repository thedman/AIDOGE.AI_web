import { expect, it } from 'vitest'
import { requireLocalForkUrl } from './fork-observation.mjs'

it.each(['https://arb1.arbitrum.io/rpc', 'http://localhost:8545', 'http://192.168.1.1:8545', 'http://127.0.0.1.evil.test', 'http://user:password@127.0.0.1', 'http://127.0.0.1/rpc', 'http://127.0.0.1/?key=test'])('rejects unsafe fork endpoint %s', url => {
  expect(() => requireLocalForkUrl(url)).toThrow()
})
it.each(['http://127.0.0.1:8545', 'http://[::1]:8545'])('permits explicit loopback %s', url => {
  expect(requireLocalForkUrl(url)).toBe(`${url}/`)
})
