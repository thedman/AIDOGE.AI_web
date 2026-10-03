// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WalletConnect } from './WalletConnect'

const mocks = vi.hoisted(() => ({
  account: { address: '0x1111111111111111111111111111111111111111', isConnected: false, isReconnecting: false, enabled: false, chainId: 1, connector: { uid: 'wallet' }, tokenBalance: 1234567n, decimals: 6, gasBalance: { value: 1000000000000000000n, decimals: 18 }, tokenLoading: false, gasLoading: false, tokenError: false, gasError: false },
  connectors: [{ uid: 'wallet', name: 'Test browser wallet', getProvider: vi.fn().mockResolvedValue({}) }],
  connect: { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null as Error | null, variables: undefined },
  disconnect: { mutate: vi.fn(), isPending: false, error: null },
  switchChain: { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null as Error | null },
}))
vi.mock('../hooks/useUserAidogeBalance', () => ({ useUserAidogeBalance: () => mocks.account }))
vi.mock('wagmi', () => ({ useConnectors: () => mocks.connectors, useConnect: () => mocks.connect, useDisconnect: () => mocks.disconnect, useSwitchChain: () => mocks.switchChain }))
afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  mocks.account.isConnected = false
  mocks.account.enabled = false
  mocks.connect.error = null
  mocks.switchChain.error = null
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
it('connects only after a user clicks the detected wallet', async () => {
  render(<WalletConnect />)
  expect(mocks.connect.mutate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }))
  const option = screen.getByRole('button', { name: 'Connect Test browser wallet' })
  await waitFor(() => expect((option as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(option)
  expect(mocks.connect.mutate).toHaveBeenCalledWith({ connector: mocks.connectors[0] })
})
it('keeps wrong-network warning and disconnect visible outside the dialog', () => {
  mocks.account.isConnected = true
  render(<WalletConnect />)
  expect(screen.getByRole('alert').textContent).toContain('Unsupported Network')
  expect(screen.queryByText('ETH gas balance')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Switch to Arbitrum One' }))
  expect(mocks.switchChain.mutate).toHaveBeenCalledWith({ chainId: 42161 })
  fireEvent.click(screen.getByRole('button', { name: 'Disconnect wallet' }))
  expect(mocks.disconnect.mutate).toHaveBeenCalledWith({ connector: mocks.account.connector })
})
it('shows personal ETH and token balances on Arbitrum', () => {
  mocks.account.isConnected = true
  mocks.account.enabled = true
  render(<WalletConnect />)
  fireEvent.click(screen.getByRole('button', { name: '0x1111...1111' }))
  expect(screen.getByText('ETH gas balance')).toBeTruthy()
  expect(screen.getByText('1.234567')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /^Disconnect$/ }))
  expect(mocks.disconnect.mutate).toHaveBeenCalled()
})
it('reports rejected account access', () => {
  mocks.connect.error = new Error('User rejected')
  render(<WalletConnect />)
  fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }))
  expect(screen.getByRole('alert').textContent).toContain('Connection declined')
})
it('reports rejected switching without hiding the network guard', () => {
  mocks.account.isConnected = true
  mocks.switchChain.error = new Error('User rejected')
  render(<WalletConnect />)
  expect(screen.getByRole('alert').textContent).toContain('Switch declined')
  expect(screen.getByRole('button', { name: 'Disconnect wallet' })).toBeTruthy()
})
