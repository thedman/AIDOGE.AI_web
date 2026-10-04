import { describe, expect, it } from 'vitest'
import { searchConsoleTags } from './searchConsole'

describe('Search Console HTML verification', () => {
  it('omits the tag without a token', () => {
    expect(searchConsoleTags()).toEqual([])
    expect(searchConsoleTags('')).toEqual([])
  })
  it('includes the token in the static HTML head', () => {
    expect(searchConsoleTags('sample_token-123')).toEqual([{
      tag: 'meta', attrs: { name: 'google-site-verification', content: 'sample_token-123' }, injectTo: 'head',
    }])
  })
  it('rejects pasted markup instead of injecting it', () => {
    expect(() => searchConsoleTags('<meta name="google-site-verification">')).toThrow('only the verification token')
  })
})
