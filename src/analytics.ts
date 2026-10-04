const sections: Record<string, string> = {
  home: 'Home', main: 'Home', overview: 'Home', token: 'AIDOGE',
  forensics: 'Contract matrix', vaults: 'Vaults', tokenomics: 'Tokenomics',
  ecosystem: 'Ecosystem', resources: 'Resources',
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialized = false

export function initializeAnalytics(measurementId?: string, baseUrl = import.meta.env.BASE_URL) {
  if (initialized || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return
  initialized = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer!.push(arguments) }

  // Never forward arbitrary hashes, query strings, wallet state or referrers.
  const base = new URL(baseUrl, window.location.origin)
  base.search = ''
  base.hash = ''
  const page = () => {
    const hash = window.location.hash.slice(1)
    const section = Object.hasOwn(sections, hash) && hash !== 'main' && hash !== 'overview' ? hash : 'home'
    return { page_location: `${base.href}#${section}`, page_title: `AIDOGE.AI | ${sections[section]}`, page_referrer: '' }
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    ...page(), send_page_view: false, anonymize_ip: true,
    allow_google_signals: false, allow_ad_personalization_signals: false,
  })
  let lastLocation = ''
  const trackPage = () => {
    const params = page()
    if (params.page_location === lastLocation) return
    lastLocation = params.page_location
    window.gtag!('set', params)
    window.gtag!('event', 'page_view', { ...params, send_to: measurementId })
  }
  trackPage()
  window.addEventListener('hashchange', trackPage)
  window.addEventListener('popstate', trackPage)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.id = 'ga4-script'
  document.head.appendChild(script)
}
