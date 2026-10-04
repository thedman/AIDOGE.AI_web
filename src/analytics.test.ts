// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let listeners: Array<[string, EventListenerOrEventListenerObject]> = []
beforeEach(() => {
  vi.resetModules()
  window.history.replaceState({}, '', '/AIDOGE.AI_web/')
  const add = window.addEventListener.bind(window)
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    listeners.push([type, listener])
    add(type, listener, options)
  })
})
afterEach(() => {
  for (const [type, listener] of listeners) window.removeEventListener(type, listener)
  listeners = []
  document.getElementById('ga4-script')?.remove()
  delete window.gtag
  delete window.dataLayer
  vi.restoreAllMocks()
})
const commands = () => (window.dataLayer || []).map(args => Array.from(args as ArrayLike<unknown>))
const views = () => commands().filter(args => args[0] === 'event')
const start = async (id?: string) => (await import('./analytics')).initializeAnalytics(id, '/AIDOGE.AI_web/')
const navigate = (url: string, event = 'hashchange') => {
  window.history.replaceState({}, '', url)
  window.dispatchEvent(new Event(event))
}

describe('optional GA4 pageviews', () => {
  it('does nothing without an ID', async () => {
    await start()
    expect(window.gtag).toBeUndefined()
    expect(document.getElementById('ga4-script')).toBeNull()
  })
  it('rejects malformed IDs', async () => {
    await start('G-<script>')
    expect(window.dataLayer).toBeUndefined()
  })
  it('loads one async tag and disables default pageviews and ads signals', async () => {
    await start('G-TEST123')
    await start('G-TEST123')
    expect(document.querySelectorAll('#ga4-script')).toHaveLength(1)
    expect((document.getElementById('ga4-script') as HTMLScriptElement).async).toBe(true)
    expect(commands().find(args => args[0] === 'config')?.[2]).toMatchObject({
      send_page_view: false, anonymize_ip: true, allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    expect(views()).toHaveLength(1)
  })
  it('tracks each section once despite duplicate route events', async () => {
    await start('G-TEST123')
    navigate('/AIDOGE.AI_web/#vaults')
    window.dispatchEvent(new Event('popstate'))
    window.dispatchEvent(new Event('hashchange'))
    expect(views()).toHaveLength(2)
    expect(views()[1][2]).toMatchObject({ page_title: 'AIDOGE.AI | Vaults', send_to: 'G-TEST123' })
    navigate('/AIDOGE.AI_web/#home', 'popstate')
    expect(views()).toHaveLength(3)
  })
  it('strips query strings, unknown hashes and wallet payloads', async () => {
    navigate('/AIDOGE.AI_web/?wallet=0x123&balance=42#0x456')
    await start('G-TEST123')
    expect(JSON.stringify(commands())).not.toMatch(/0x123|0x456|balance=42/)
    expect(views()[0][2]).toMatchObject({ page_referrer: '', page_title: 'AIDOGE.AI | Home' })
    navigate('/AIDOGE.AI_web/?account=0x999#vaults')
    expect(JSON.stringify(commands())).not.toContain('0x999')
  })
  it('does not track wallet changes or equivalent home anchors', async () => {
    await start('G-TEST123')
    window.dispatchEvent(new Event('accountsChanged'))
    window.dispatchEvent(new Event('chainChanged'))
    navigate('/AIDOGE.AI_web/#main')
    navigate('/AIDOGE.AI_web/#overview')
    navigate('/AIDOGE.AI_web/#unknown')
    expect(views()).toHaveLength(1)
  })
})
