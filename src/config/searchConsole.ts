import type { HtmlTagDescriptor } from 'vite'

export function searchConsoleTags(token?: string): HtmlTagDescriptor[] {
  if (!token) return []
  if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('VITE_GSC_VERIFICATION_TOKEN must contain only the verification token, not the full meta tag.')
  return [{ tag: 'meta', attrs: { name: 'google-site-verification', content: token }, injectTo: 'head' }]
}
